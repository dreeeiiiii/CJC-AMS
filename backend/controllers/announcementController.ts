import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../db.js"; // Adjust relative path to your db.js config

export const getAnnouncements = async (req: Request, res: Response): Promise<any> => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(announcements);
  } catch (error: any) {
    console.error("Fetch Announcements Error:", error);
    return res.status(500).json({ error: error.message || "Failed to retrieve announcements" });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Announcement content body cannot be empty" });
    }

    let imageUrl: string | null = null;
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        content: content,
        image: imageUrl,
      },
    });

    return res.status(201).json(newAnnouncement);
  } catch (error: any) {
    console.error("Create Announcement Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create announcement" });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // 🚀 Type guard: Ensures 'id' is explicitly a single string before passing to parseInt
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Announcement ID parameter is missing or invalid" });
    }

    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    // Find the record first to check for an associated image file to unlink
    const announcement = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement record not found" });
    }

    // Clean up disk storage: Delete the image file from public/uploads if it exists
    if (announcement.image) {
      const filename = announcement.image.split("/uploads/")[1];
      if (filename) {
        // Construct path back to public/uploads
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.announcement.delete({
      where: { id: parsedId },
    });

    return res.status(200).json({ message: "Announcement and associated file deleted successfully" });
  } catch (error: any) {
    console.error("Delete Announcement Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete announcement" });
  }
};

/**
 * 🚀 PUT /api/announcements/:id
 * Updates the text content of an existing announcement.
 */
export const updateAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Type Guard for parameters
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Announcement ID parameter is missing or invalid" });
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    // Payload verification
    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Announcement content body cannot be empty" });
    }

    // Verify record exists before committing updates
    const existing = await prisma.announcement.findUnique({
      where: { id: parsedId }
    });

    if (!existing) {
      return res.status(404).json({ error: "Announcement record not found" });
    }

    // Update operation using Prisma Client
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parsedId },
      data: { content: content.trim() }
    });

    return res.status(200).json(updatedAnnouncement);
  } catch (error: any) {
    console.error("Update Announcement Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update announcement" });
  }
};