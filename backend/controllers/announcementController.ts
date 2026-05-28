import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../db.js";
import { uploadToCloudinary } from "../config/cloudinary.js"



declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role?: string;
    };
  }
}

const formatDate = () => {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

/**
 * GET ALL ANNOUNCEMENTS
 */
export const getAnnouncements = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id; 
     const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 5, 1), 50);
    const skip = (page - 1) * limit;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [announcements, total, thisWeekCount, withImagesCount, pinnedCount, scheduledCount, categoryAgg] = await Promise.all([
      prisma.announcement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        // --- ADDED THIS SECTION ---
        include: {
          acknowledgments: {
            where: { userId: userId },
          },
        },
        // --------------------------
      }),
      prisma.announcement.count(),
      prisma.announcement.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      prisma.announcement.count({
        where: { image: { not: null } },
      }),
      prisma.announcement.count({
        where: { pinned: true },
      }),
      prisma.announcement.count({
        where: { scheduledAt: { gt: now } },
      }),
      prisma.announcement.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ]);

    // --- TRANSFORM DATA TO ADD selfAcknowledged ---
    const formattedAnnouncements = announcements.map((ann) => {
      const { acknowledgments, ...rest } = ann;
      return {
        ...rest,
        // If the acknowledgments array has an entry, this user has seen it
        selfAcknowledged: acknowledgments.length > 0,
      };
    });
    // ----------------------------------------------

    const byCategory: Record<string, number> = {};
    for (const row of categoryAgg) {
      byCategory[row.category] = row._count.category;
    }

    return res.status(200).json({
      data: formattedAnnouncements, // Use the formatted data here
      hasMore: skip + announcements.length < total,
      stats: {
        total,
        thisWeek: thisWeekCount,
        withImages: withImagesCount,
        pinned: pinnedCount,
        scheduled: scheduledCount,
        byCategory,
      },
    });
  } catch (error: any) {
    console.error("Fetch Announcements Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to retrieve announcements",
    });
  }
};

/**
 * CREATE ANNOUNCEMENT
 */
export const createAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, category, author, link, scheduledAt } = req.body;

    // validation
    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    let imageUrl: string | null = null;

    if (req.file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(req.file.buffer, 'announcements');
        imageUrl = (result as any).secure_url;
      } else {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(req.file.originalname);
        const filename = 'announcement-' + uniqueSuffix + ext;
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filepath, req.file.buffer);
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        imageUrl = `${baseUrl}/uploads/${filename}`;
      }
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || "General",
        author: author || "CJCRSG Phils. Inc.",
        link: link || null,
        image: imageUrl,
        timestamp: formatDate(),
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
      },
    });

    return res.status(201).json(newAnnouncement);
  } catch (error: any) {
    console.error("Create Announcement Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to create announcement",
    });
  }
};

/**
 * DELETE ANNOUNCEMENT
 */
export const deleteAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const parsedId = parseInt(id as string, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // delete image file if exists
    if (announcement.image) {
      const filename = announcement.image.split("/uploads/")[1];
      if (filename) {
        const filePath = path.join(process.cwd(), "public", "uploads", filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.announcement.delete({
      where: { id: parsedId },
    });

    return res.status(200).json({
      message: "Announcement deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Announcement Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to delete announcement",
    });
  }
};

/**
 * ACKNOWLEDGE ANNOUNCEMENT (POST)
 */
export const acknowledgeAnnouncement = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = req.params.id as string;

    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({
        error: "Invalid announcement ID format",
      });
    }

    // logged-in member id
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // check announcement exists
    const existing = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    // prevent duplicate acknowledgment
    const alreadyAcknowledged =
      await prisma.announcementAcknowledgment.findUnique({
        where: {
          announcementId_userId: {
            announcementId: parsedId,
            userId,
          },
        },
      });

    if (alreadyAcknowledged) {
      return res.status(400).json({
        error: "You already acknowledged this announcement",
      });
    }

    // create acknowledgment
    await prisma.announcementAcknowledgment.create({
      data: {
        announcementId: parsedId,
        userId,
      },
    });

    // increment count
    const updated = await prisma.announcement.update({
      where: { id: parsedId },
      data: {
        acknowledgmentCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json(updated);

  } catch (error: any) {
    console.error("Acknowledge Error:", error);

    return res.status(500).json({
      error: error.message || "Failed to acknowledge announcement",
    });
  }
};

/**
 * UNACKNOWLEDGE ANNOUNCEMENT (DELETE)
 */
export const unacknowledgeAnnouncement = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = req.params.id as string;

    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({
        error: "Invalid announcement ID format",
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // check announcement exists
    const existing = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    // check acknowledgment exists
    const acknowledgment =
      await prisma.announcementAcknowledgment.findUnique({
        where: {
          announcementId_userId: {
            announcementId: parsedId,
            userId,
          },
        },
      });

    if (!acknowledgment) {
      return res.status(400).json({
        error: "You have not acknowledged this announcement",
      });
    }

    // remove acknowledgment
    await prisma.announcementAcknowledgment.delete({
      where: {
        announcementId_userId: {
          announcementId: parsedId,
          userId,
        },
      },
    });

    // decrement count
    const updated = await prisma.announcement.update({
      where: { id: parsedId },
      data: {
        acknowledgmentCount: {
          decrement: 1,
        },
      },
    });

    return res.status(200).json(updated);

  } catch (error: any) {
    console.error("Unacknowledge Error:", error);

    return res.status(500).json({
      error: error.message || "Failed to unacknowledge announcement",
    });
  }
};

/**
 * UPDATE ANNOUNCEMENT
 */
export const updateAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id: idParam } = req.params;
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    const { title, content, category, author, link } = req.body;

    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title?.trim() ?? existing.title,
        content: content?.trim() ?? existing.content,
        category: category ?? existing.category,
        author: author ?? existing.author,
        link: link ?? existing.link,
      },
    });

    return res.status(200).json(updatedAnnouncement);
  } catch (error: any) {
    console.error("Update Announcement Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to update announcement",
    });
  }
};

/**
 * TOGGLE PIN
 */
export const togglePin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { pinned } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const parsedId = parseInt(id as string, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const updated = await prisma.announcement.update({
      where: { id: parsedId },
      data: { pinned: pinned ?? !announcement.pinned },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    console.error("Toggle Pin Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to toggle pin",
    });
  }
};