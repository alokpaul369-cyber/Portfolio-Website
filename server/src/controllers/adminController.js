import { viewsLastWeek } from '../services/analyticsService.js';
import {
  BlogPost,
  Certification,
  Experience,
  Message,
  Project,
  Research,
  Skill,
} from '../models/index.js';

/**
 * GET /api/admin/stats (admin)
 * Counts for the dashboard overview and the five most recent messages.
 */
export async function getStats(_req, res) {
  const [
    projects,
    featuredProjects,
    skills,
    experience,
    publishedPosts,
    draftPosts,
    messages,
    unreadMessages,
    research,
    hiddenResearch,
    certifications,
    viewsLast7Days,
    recentMessages,
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ featured: true }),
    Skill.countDocuments(),
    Experience.countDocuments(),
    BlogPost.countDocuments({ published: true }),
    BlogPost.countDocuments({ published: false }),
    Message.countDocuments(),
    Message.countDocuments({ read: false }),
    Research.countDocuments(),
    Research.countDocuments({ visible: false }),
    Certification.countDocuments(),
    viewsLastWeek(),
    Message.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .select('name email subject read createdAt'),
  ]);

  res.json({
    success: true,
    data: {
      counts: {
        projects,
        featuredProjects,
        skills,
        experience,
        publishedPosts,
        draftPosts,
        messages,
        unreadMessages,
        research,
        hiddenResearch,
        certifications,
        viewsLast7Days,
      },
      recentMessages,
    },
  });
}
