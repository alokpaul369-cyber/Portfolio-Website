/**
 * Site-wide content and links, kept in one place so components contain no
 * hard-coded personal details.
 *
 * Role, tagline, location, availability, email and LinkedIn are defaults: the
 * admin can override them from Site content in the admin panel, where the CV
 * is uploaded too (see lib/siteContent.js). The name is fixed here because it
 * is also written into build-time SEO tags.
 */
export const site = {
  name: 'Alok Paul',
  role: 'Full-Stack Developer',
  location: 'Bangladesh',
  availability: 'Available for collaboration',
  tagline:
    'I build secure, scalable web applications with the MERN stack, with a focus on REST APIs, authentication and clean user interfaces.',
  profileImage: '/images/profile.jpg',
  socialImage: '/images/og-image.jpg',
};

/**
 * Primary navigation, in display order. A link with `section` appears only
 * when that optional section has content.
 */
export const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Skills', to: '/skills' },
  { label: 'Projects', to: '/projects' },
  // Shown only while the site has visible research entries (see Navbar).
  { label: 'Research', to: '/research', section: 'research' },
  // Shown only once a blog post is published.
  { label: 'Blog', to: '/blog', section: 'blog' },
  { label: 'Experience', to: '/experience' },
  { label: 'Contact', to: '/contact' },
];

/** GitHub username; also set GITHUB_USERNAME on the server to the same value. */
export const githubUsername = 'alokpaul369-cyber';

/** Social profiles shown in the hero and footer. */
export const socialLinks = {
  github: `https://github.com/${githubUsername}`,
  linkedin: 'https://www.linkedin.com/in/your-profile',
  email: 'alokpaul369@gmail.com',
};
