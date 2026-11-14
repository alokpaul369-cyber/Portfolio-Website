/** Account: previous sign-in time, password and email changes, and signing out other sessions. */
import { beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { agentFor, createTestApp, loginAgent, TEST_ADMIN } from './helpers.js';
import { Admin } from '../src/models/index.js';

const app = createTestApp();
const NEW_PASSWORD = 'a-brand-new-long-password';

let here; // the browser making the change
let elsewhere; // another signed-in browser

beforeEach(async () => {
  elsewhere = await loginAgent(app);
  here = await loginAgent(app);
});

const me = (agent) => agent.get('/api/auth/me');
const login = (credentials) => agentFor(app).post('/api/auth/login').send(credentials);

describe('sign-in details', () => {
  it('reports the previous sign-in after a later one', async () => {
    // Both agents are the same admin, so take each sign-in time from its own response.
    const earlier = (await login(TEST_ADMIN)).body.admin.lastLoginAt;
    const latest = await login(TEST_ADMIN);
    expect(latest.body.admin.previousLoginAt).toBe(earlier);

    const profile = (await me(here)).body.admin;
    expect(profile.previousLoginAt).toBe(earlier);
    expect(profile.lastLoginAt).toBe(latest.body.admin.lastLoginAt);
    expect(profile).toHaveProperty('passwordChangedAt');
    expect(profile).not.toHaveProperty('password');
    expect(profile).not.toHaveProperty('sessionVersion');
  });
});

describe('session tokens', () => {
  const tokenFor = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      issuer: 'alok-paul-portfolio',
      audience: 'admin',
      expiresIn: '1d',
    });
  const meWith = (token) => agentFor(app).get('/api/auth/me').set('Cookie', `admin_token=${token}`);

  it('accepts a token issued before session versions existed', async () => {
    const admin = await Admin.findOne();
    expect((await meWith(tokenFor({ sub: String(admin._id) }))).status).toBe(200);
  });

  it('rejects a token with another version, a bad signature or an unknown admin', async () => {
    const admin = await Admin.findOne();
    expect((await meWith(tokenFor({ sub: String(admin._id), sv: 5 }))).status).toBe(401);
    expect((await meWith(tokenFor({ sub: String(admin._id), sv: 0 }) + 'x')).status).toBe(401);
    expect((await meWith(tokenFor({ sub: '507f1f77bcf86cd799439011', sv: 0 }))).status).toBe(401);
  });

  it('ends every session when the password is replaced outside the API', async () => {
    // What "npm run seed:admin -- --reset" does: set a new password on the document and save.
    const admin = await Admin.findOne();
    admin.password = NEW_PASSWORD;
    await admin.save();
    expect((await me(here)).status).toBe(401);
    expect((await me(elsewhere)).status).toBe(401);
  });
});

describe('PUT /api/auth/password', () => {
  const change = (agent, body) => agent.put('/api/auth/password').send(body);

  it('requires a signed-in admin', async () => {
    const response = await change(agentFor(app), {
      currentPassword: TEST_ADMIN.password,
      newPassword: NEW_PASSWORD,
    });
    expect(response.status).toBe(401);
  });

  it('rejects a wrong current password', async () => {
    const response = await change(here, { currentPassword: 'wrong', newPassword: NEW_PASSWORD });
    // 400 with a field error; a 401 would make the client treat the session as expired.
    expect(response.status).toBe(400);
    expect(response.body.details[0].field).toBe('currentPassword');
    expect((await me(here)).status).toBe(200);
    expect((await login(TEST_ADMIN)).status).toBe(200);
  });

  it('rejects a new password that is too short or unchanged', async () => {
    const short = await change(here, {
      currentPassword: TEST_ADMIN.password,
      newPassword: 'short',
    });
    expect(short.status).toBe(400);

    const same = await change(here, {
      currentPassword: TEST_ADMIN.password,
      newPassword: TEST_ADMIN.password,
    });
    expect(same.status).toBe(400);
  });

  it('changes the password, keeps this session and ends the others', async () => {
    const response = await change(here, {
      currentPassword: TEST_ADMIN.password,
      newPassword: NEW_PASSWORD,
    });
    expect(response.status).toBe(200);
    expect(response.body.admin).not.toHaveProperty('password');

    expect((await me(here)).status).toBe(200);
    expect((await me(elsewhere)).status).toBe(401);
    expect((await login(TEST_ADMIN)).status).toBe(401);
    expect((await login({ email: TEST_ADMIN.email, password: NEW_PASSWORD })).status).toBe(200);
  });
});

describe('PUT /api/auth/email', () => {
  const change = (agent, body) => agent.put('/api/auth/email').send(body);

  it('requires a signed-in admin and the current password', async () => {
    const body = { currentPassword: TEST_ADMIN.password, email: 'new@example.test' };
    expect((await change(agentFor(app), body)).status).toBe(401);
    expect((await change(here, { ...body, currentPassword: 'wrong' })).status).toBe(400);
    expect((await me(here)).body.admin.email).toBe(TEST_ADMIN.email);
  });

  it('rejects an invalid address', async () => {
    const response = await change(here, {
      currentPassword: TEST_ADMIN.password,
      email: 'not-an-email',
    });
    expect(response.status).toBe(400);
  });

  it('saves the new address trimmed and in lower case', async () => {
    const response = await change(here, {
      currentPassword: TEST_ADMIN.password,
      email: '  New.Address@Example.TEST ',
    });
    expect(response.status).toBe(200);
    expect(response.body.admin.email).toBe('new.address@example.test');

    expect((await me(here)).status).toBe(200);
    expect((await login(TEST_ADMIN)).status).toBe(401);
    const signedIn = await login({
      email: 'new.address@example.test',
      password: TEST_ADMIN.password,
    });
    expect(signedIn.status).toBe(200);
  });
});

describe('POST /api/auth/sessions/revoke', () => {
  it('requires a signed-in admin', async () => {
    expect((await agentFor(app).post('/api/auth/sessions/revoke')).status).toBe(401);
  });

  it('keeps this session and ends the others', async () => {
    const response = await here.post('/api/auth/sessions/revoke');
    expect(response.status).toBe(200);
    expect((await me(here)).status).toBe(200);
    expect((await me(elsewhere)).status).toBe(401);
    // Signing in again still works.
    expect((await login(TEST_ADMIN)).status).toBe(200);
  });
});
