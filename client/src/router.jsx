import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import RootLayout from '@/components/layout/RootLayout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Secondary pages are split into separate chunks and loaded on first visit.
const About = lazy(() => import('@/pages/About'));
const Skills = lazy(() => import('@/pages/Skills'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const Experience = lazy(() => import('@/pages/Experience'));
const Research = lazy(() => import('@/pages/Research'));
const ResearchDetail = lazy(() => import('@/pages/ResearchDetail'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Contact = lazy(() => import('@/pages/Contact'));
const Privacy = lazy(() => import('@/pages/Privacy'));

// Admin area: loaded only when /admin is visited, never by public visitors.
const AdminRoot = lazy(() => import('@/components/admin/AdminRoot'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const ProtectedRoute = lazy(() => import('@/components/admin/ProtectedRoute'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'));
const AdminProjectForm = lazy(() => import('@/pages/admin/AdminProjectForm'));
const AdminSkills = lazy(() => import('@/pages/admin/AdminSkills'));
const AdminSkillForm = lazy(() => import('@/pages/admin/AdminSkillForm'));
const AdminExperience = lazy(() => import('@/pages/admin/AdminExperience'));
const AdminExperienceForm = lazy(() => import('@/pages/admin/AdminExperienceForm'));
const AdminResearch = lazy(() => import('@/pages/admin/AdminResearch'));
const AdminResearchForm = lazy(() => import('@/pages/admin/AdminResearchForm'));
const AdminCertifications = lazy(() => import('@/pages/admin/AdminCertifications'));
const AdminCertificationForm = lazy(() => import('@/pages/admin/AdminCertificationForm'));
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'));
const AdminPostForm = lazy(() => import('@/pages/admin/AdminPostForm'));
const AdminMessages = lazy(() => import('@/pages/admin/AdminMessages'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'));
const AdminContent = lazy(() => import('@/pages/admin/AdminContent'));
const AdminAccount = lazy(() => import('@/pages/admin/AdminAccount'));

/** Create and edit routes for one admin resource. */
function resourceRoutes(path, List, Form) {
  return [
    { path, element: <List /> },
    { path: `${path}/new`, element: <Form /> },
    { path: `${path}/:id`, element: <Form /> },
  ];
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'skills', element: <Skills /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:slug', element: <ProjectDetail /> },
      { path: 'research', element: <Research /> },
      { path: 'research/:slug', element: <ResearchDetail /> },
      { path: 'experience', element: <Experience /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy', element: <Privacy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoot />,
    children: [
      { path: 'login', element: <AdminLogin /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminOverview /> },
              ...resourceRoutes('projects', AdminProjects, AdminProjectForm),
              ...resourceRoutes('skills', AdminSkills, AdminSkillForm),
              ...resourceRoutes('experience', AdminExperience, AdminExperienceForm),
              ...resourceRoutes('research', AdminResearch, AdminResearchForm),
              ...resourceRoutes('certifications', AdminCertifications, AdminCertificationForm),
              ...resourceRoutes('blog', AdminBlog, AdminPostForm),
              { path: 'messages', element: <AdminMessages /> },
              { path: 'analytics', element: <AdminAnalytics /> },
              { path: 'profile', element: <AdminProfile /> },
              { path: 'content', element: <AdminContent /> },
              { path: 'account', element: <AdminAccount /> },
              { path: '*', element: <AdminOverview /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
