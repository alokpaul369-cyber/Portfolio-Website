import { Braces, Layers, ServerCog } from 'lucide-react';

/**
 * Static content for the About section. Kept separate from the components so
 * the wording can be edited without touching layout code.
 */

export const aboutParagraphs = [
  'I am a Computer Science and Engineering undergraduate based in Bangladesh. I build full-stack web applications with MongoDB, Express, React and Node.js, and I enjoy taking a feature from the database schema through to a finished, usable interface.',
  'My main focus is secure backend design: well-structured REST APIs, authentication and authorization, and careful input validation. Alongside project work, I strengthen my problem-solving skills through C++ and data structures and algorithms, and I am currently expanding into Next.js and TypeScript.',
];

/** Key facts shown in the grid. */
export const keyFacts = [
  { value: '25+', label: 'Repositories' },
  { value: '6', label: 'Featured Projects' },
  { value: '15+', label: 'Technologies' },
];

/** "What I Do" cards. */
export const services = [
  {
    Icon: Layers,
    title: 'Full-Stack Development',
    description:
      'End-to-end web applications with React on the front end and Node.js, Express and MongoDB behind it, structured to stay maintainable as they grow.',
  },
  {
    Icon: ServerCog,
    title: 'Backend & API Design',
    description:
      'RESTful APIs with clear resource design, JWT authentication, input validation, rate limiting and consistent error handling.',
  },
  {
    Icon: Braces,
    title: 'Problem Solving',
    description:
      'Regular practice with data structures and algorithms in C++, applied to writing efficient, well-reasoned code.',
  },
];
