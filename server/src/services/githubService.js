import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/**
 * Public GitHub profile data for the portfolio, fetched from the GitHub REST
 * API and cached in memory.
 *
 * Caching rules:
 * - Fresh data is reused for `GITHUB_CACHE_MINUTES` (default 60), so visitors
 *   cost at most two GitHub requests per hour.
 * - Concurrent requests during a refresh share one GitHub call.
 * - If GitHub fails, the last successful result is served (marked `stale`)
 *   instead of an error.
 */

const API_BASE = 'https://api.github.com';
const REPO_COUNT = 6;
const REQUEST_TIMEOUT_MS = 10000;

const cache = { data: null, fetchedAt: 0, pending: null };

function cacheTtlMs() {
  return env.github.cacheMinutes * 60 * 1000;
}

/** Calls the GitHub REST API and returns parsed JSON. */
async function githubGet(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    // GitHub requires a User-Agent; a generic client name is used.
    'User-Agent': 'portfolio-github-activity',
  };
  if (env.github.token) headers.Authorization = `Bearer ${env.github.token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reason = remaining === '0' ? 'rate limit reached' : `HTTP ${response.status}`;
    throw new Error(`GitHub request ${path} failed: ${reason}`);
  }
  return response.json();
}

/** Keeps only the fields the client needs, under stable names. */
function toProfile(user) {
  return {
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    htmlUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
  };
}

/**
 * Removes emoji from GitHub-provided text, both Unicode emoji (with their
 * modifiers and joiners) and GitHub ":shortcode:" emoji, keeping the site's
 * no-emoji presentation consistent.
 */
export function stripEmoji(text) {
  return (
    String(text ?? '')
      .replace(/:[a-z0-9_+-]+:/gi, '')
      // Pictographs, skin-tone modifiers, flag letters, variation selector,
      // zero-width joiner and keycap mark, each removed individually.
      .replace(
        /\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|\u{FE0F}|\u{200D}|\u{20E3}/gu,
        '',
      )
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

function toRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    description: stripEmoji(repo.description),
    htmlUrl: repo.html_url,
    homepage: repo.homepage || '',
    language: repo.language || null,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.pushed_at || repo.updated_at,
  };
}

/**
 * Fetches the profile and the most recently pushed original repositories
 * (excluding forks, archived repositories and the profile README repository).
 */
async function fetchFromGitHub() {
  const username = encodeURIComponent(env.github.username);
  const [user, repos] = await Promise.all([
    githubGet(`/users/${username}`),
    // "pushed" orders by the latest code push, which matches the date shown on each card.
    // ("updated" also changes on metadata edits such as a new description or star.)
    githubGet(`/users/${username}/repos?sort=pushed&direction=desc&per_page=30&type=owner`),
  ]);

  // The repository named after the user holds the profile README, not a project.
  const isProfileReadme = (repo) => repo.name.toLowerCase() === user.login.toLowerCase();

  return {
    profile: toProfile(user),
    repos: repos
      .filter((repo) => !repo.fork && !repo.archived && !isProfileReadme(repo))
      .slice(0, REPO_COUNT)
      .map(toRepo),
  };
}

/**
 * Returns `{ profile, repos, fetchedAt, stale }`, from the cache when fresh.
 * Throws a 502 ApiError only when GitHub fails and nothing is cached yet.
 */
export async function getGitHubActivity() {
  const age = Date.now() - cache.fetchedAt;
  if (cache.data && age < cacheTtlMs()) {
    return { ...cache.data, fetchedAt: new Date(cache.fetchedAt).toISOString(), stale: false };
  }

  // Share one in-flight refresh between concurrent requests.
  cache.pending ??= fetchFromGitHub()
    .then((data) => {
      cache.data = data;
      cache.fetchedAt = Date.now();
    })
    .finally(() => {
      cache.pending = null;
    });

  try {
    await cache.pending;
    return { ...cache.data, fetchedAt: new Date(cache.fetchedAt).toISOString(), stale: false };
  } catch (error) {
    console.error(error.message);
    if (cache.data) {
      return { ...cache.data, fetchedAt: new Date(cache.fetchedAt).toISOString(), stale: true };
    }
    throw new ApiError(502, 'GitHub activity is temporarily unavailable. Please try again later.');
  }
}
