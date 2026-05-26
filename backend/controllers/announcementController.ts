import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../db.js";

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
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 5, 1), 50);
    const skip = (page - 1) * limit;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [announcements, total, thisWeekCount, withImagesCount] = await Promise.all([
      prisma.announcement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.announcement.count(),
      prisma.announcement.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      prisma.announcement.count({
        where: { image: { not: null } },
      }),
    ]);

    return res.status(200).json({
      data: announcements,
      hasMore: skip + announcements.length < total,
      stats: {
        total,
        thisWeek: thisWeekCount,
        withImages: withImagesCount,
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
    const { title, content, category, author, link } = req.body;

    // validation
    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    let imageUrl: string | null = null;

    if (req.file) {
      const baseUrl =
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
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

    const parsedId = parseInt(id, 10);
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
 * UPDATE ANNOUNCEMENT
 */
export const updateAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, content, category, author, link } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    const existing = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parsedId },
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