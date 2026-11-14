/**
 * Initial site content loaded by `npm run seed:content -w server`.
 *
 * Skills: `icon` is a key from the client's icon registry
 * (client/src/lib/skillIcons.js). Order within each category follows the list order.
 *
 * Education: entries are matched by degree name, so re-running the seed
 * updates them in place. Institution names are optional; add them here before
 * seeding or later from the admin dashboard.
 */

const skillGroups = {
  language: [
    ['C++', 'SiCplusplus'],
    ['C', 'SiC'],
    ['Java', 'DiJava'],
    ['JavaScript', 'SiJavascript'],
    ['TypeScript', 'SiTypescript'],
  ],
  frontend: [
    ['HTML', 'SiHtml5'],
    ['CSS', 'SiCss'],
    ['React', 'SiReact'],
    ['Next.js', 'SiNextdotjs'],
    ['Tailwind CSS', 'SiTailwindcss'],
    ['Bootstrap', 'SiBootstrap'],
  ],
  backend: [
    ['Node.js', 'SiNodedotjs'],
    ['Express.js', 'SiExpress'],
    ['REST APIs', 'TbApi'],
    ['JWT Authentication', 'SiJsonwebtokens'],
  ],
  database: [
    ['MongoDB', 'SiMongodb'],
    ['Mongoose', 'SiMongoose'],
    ['SQLite', 'SiSqlite'],
  ],
  tools: [
    ['Git', 'SiGit'],
    ['GitHub', 'SiGithub'],
    ['VS Code', 'VscVscode'],
    ['Postman', 'SiPostman'],
    ['npm', 'SiNpm'],
    ['pnpm', 'SiPnpm'],
    ['Cloudinary', 'SiCloudinary'],
  ],
};

export const skills = Object.entries(skillGroups).flatMap(([category, items]) =>
  items.map(([name, icon], index) => ({ name, category, icon, order: index })),
);

const GITHUB = 'https://github.com/alokpaul369-cyber';

/** Portfolio projects. `order` sets the position in the default listing. */
export const projects = [
  {
    title: 'Real World Backend System',
    description:
      'A course platform API covering the core of an online learning product. It provides JWT authentication, course enrollments, statistics for an admin dashboard and image uploads to Cloudinary.',
    techStack: ['Node.js', 'Express', 'MongoDB', 'Cloudinary'],
    category: 'backend',
    featured: true,
    order: 1,
    githubUrl: `${GITHUB}/Real-World-Backend-System`,
  },
  {
    title: 'MediX: Medicine Finder',
    description:
      'A desktop application for finding medicines at nearby pharmacies. It includes stock tracking, reservations, background jobs and reports.',
    techStack: ['Java', 'Swing', 'SQLite'],
    category: 'desktop',
    featured: true,
    order: 2,
    githubUrl: `${GITHUB}/MEDIX-PROJECT`,
  },
  {
    title: 'AI Prompt Web App',
    description:
      'A web application where users can ask a question and receive an answer from Llama 3.3. Requests are handled by a Node.js server that calls the Groq API.',
    techStack: ['Node.js', 'Groq API'],
    category: 'ai',
    featured: true,
    order: 3,
    githubUrl: `${GITHUB}/AI-Prompt-Web-Application`,
  },
  {
    title: 'SkyCast Weather App',
    description:
      'A weather application that displays live data from the Open-Meteo API in a modern, responsive interface.',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    category: 'frontend',
    featured: false,
    order: 4,
    githubUrl: `${GITHUB}/Weather-App`,
  },
  {
    title: 'Advanced Student Management API',
    description:
      'A secure REST API built with the MVC pattern, providing JWT-protected create, read, update and delete operations for student records.',
    techStack: ['Express', 'Mongoose', 'JWT'],
    category: 'backend',
    featured: false,
    order: 5,
    githubUrl: `${GITHUB}/Advanced-Student-Management-API`,
  },
  {
    title: 'DSA Problem Solve',
    description:
      'Searching, sorting and array algorithms implemented from scratch in C++, as practice in data structures and algorithms.',
    techStack: ['C++'],
    category: 'dsa',
    featured: false,
    order: 6,
    githubUrl: `${GITHUB}/DSA-Problem-Solve`,
  },
];

/** Education, most recent first. Dates are shown as years on the site. */
export const education = [
  {
    type: 'education',
    role: 'B.Sc. in Computer Science & Engineering',
    company: '',
    startDate: '2025-01-01',
    endDate: null,
    current: true,
    description: [],
  },
  {
    type: 'education',
    role: 'Higher Secondary Certificate (HSC)',
    company: '',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    current: false,
    description: [],
  },
  {
    type: 'education',
    role: 'Secondary School Certificate (SSC)',
    company: '',
    startDate: '2020-01-01',
    endDate: '2022-12-31',
    current: false,
    description: [],
  },
];
