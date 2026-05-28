import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db.js";

interface DecodedToken {
  id: number;
  email: string;
  role: string;
}

export const submitTestimony = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullName, testimony } = req.body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return res.status(400).json({ error: "Full name is required" });
    }

    if (!testimony || typeof testimony !== "string" || testimony.trim().length === 0) {
      return res.status(400).json({ error: "Testimony is required" });
    }

    const trimmedTestimony = testimony.trim();
    if (trimmedTestimony.length > 500) {
      return res.status(400).json({ error: "Testimony must be 500 characters or less" });
    }

    const sanitizedName = fullName.trim().replace(/<[^>]*>/g, "");
    const sanitizedTestimony = trimmedTestimony.replace(/<[^>]*>/g, "");

    let memberId: number | null = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const secret = process.env.JWT_TOKEN_SECRET
        if (secret) {
          const decoded = jwt.verify(authHeader.split(" ")[1]!, secret) as unknown as DecodedToken
          memberId = decoded.id
        }
      } catch {
        // invalid token — proceed as anonymous
      }
    }

    const newTestimony = await prisma.testimony.create({
      data: {
        name: sanitizedName,
        quote: sanitizedTestimony,
        status: "pending",
        memberId,
      },
    });

    return res.status(201).json({
      message: "Testimony submitted successfully",
      testimony: newTestimony,
    });
  } catch (error: any) {
    console.error("Submit Testimony Error:", error);
    return res.status(500).json({ error: error.message || "Failed to submit testimony" });
  }
};

export const getAllTestimonies = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== "all") {
      where.status = status as string;
    }
    const testimonies = await prisma.testimony.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(testimonies);
  } catch (error: any) {
    console.error("Get Testimonies Error:", error);
    return res.status(500).json({ error: error.message || "Failed to retrieve testimonies" });
  }
};

export const getPublicTestimonies = async (req: Request, res: Response): Promise<any> => {
  try {
    const testimonies = await prisma.testimony.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(testimonies);
  } catch (error: any) {
    console.error("Get Public Testimonies Error:", error);
    return res.status(500).json({ error: error.message || "Failed to retrieve testimonies" });
  }
};

export const approveTestimony = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid testimony ID" });
    }

    const testimony = await prisma.testimony.update({
      where: { id: parsedId },
      data: { status: "approved" },
    });

    return res.status(200).json({ message: "Testimony approved", testimony });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Testimony not found" });
    }
    console.error("Approve Testimony Error:", error);
    return res.status(500).json({ error: error.message || "Failed to approve testimony" });
  }
};

export const rejectTestimony = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid testimony ID" });
    }

    const testimony = await prisma.testimony.update({
      where: { id: parsedId },
      data: { status: "rejected" },
    });

    return res.status(200).json({ message: "Testimony rejected", testimony });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Testimony not found" });
    }
    console.error("Reject Testimony Error:", error);
    return res.status(500).json({ error: error.message || "Failed to reject testimony" });
  }
};

export const deleteTestimony = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid testimony ID" });
    }

    await prisma.testimony.delete({
      where: { id: parsedId },
    });

    return res.status(200).json({ message: "Testimony deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Testimony not found" });
    }
    console.error("Delete Testimony Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete testimony" });
  }
};
