import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js'; 
import type { AuthRequest } from '../middleware/auth.js';

/**
 * Note: Since you are using a custom Prisma output, 
 * we use 'any' or type casting to prevent the TS(2339) error 
 * that occurs when the IDE looks at the default node_modules.
 */

// 📌 Helper function to handle token signing
const generateToken = (user: any) => {
  const secret = process.env.JWT_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT_TOKEN_SECRET is missing from .env");
  }
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role // This works at runtime because the DB has the column
    }, 
    secret, 
    { expiresIn: '1d' }
  );
};

// 📌 Register User
export const createUsersAccount = async (req: Request, res: Response) => {
  const { 
    type, // "member" or "visitor"
    fullName, 
    contactNo, 
    address, 
    gender, 
    email, 
    password, 
    churchAffiliation 
  } = req.body;

  try {
    // --- LOGIC FOR MEMBER ---
    if (type === 'member') {
      const existingUser = await prisma.member.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered as a member" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await prisma.member.create({
        data: {
          fullName,
          contactNo,
          address,
          gender,
          email,
          password: hashedPassword,
          role: "MEMBER" as any // Bypassing custom output error
        },
      });

      return res.status(201).json({ 
        message: "Member account created successfully", 
        id: newUser.id 
      });
    }

    // --- LOGIC FOR VISITOR ---
    if (type === 'visitor') {
      // Visitors might not have unique emails in your schema, but we check if provided
      if (email) {
        const existingVisitor = await prisma.visitor.findUnique({ where: { email } });
        if (existingVisitor) {
            return res.status(400).json({ message: "Visitor already exists with this email" });
        }
      }

      const newVisitor = await prisma.visitor.create({
        data: {
          fullName,
          contactNo,
          address,
          gender,
          email, // Optional in your schema
          category: "WalkIn", // Defaulting to WalkIn per your Enum
          // Note: If you haven't added churchAffiliation to your prisma schema yet,
          // you should add it to the Visitor model first.
        },
      });

      return res.status(201).json({ 
        message: "Visitor record created successfully", 
        id: newVisitor.id 
      });
    }

    return res.status(400).json({ message: "Invalid registration type" });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Member Login
export const memberLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.member.findUnique({ where: { email } });
    
    // Using (user as any) to access the role property safely
    if (!user || (user as any).role !== "MEMBER") {
      return res.status(401).json({ message: "Invalid member credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Member login successful",
      token,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: (user as any).role 
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Admin Login
export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.member.findUnique({ where: { email } });

    // Using (user as any) to access the role property safely
    if (!user || (user as any).role !== "ADMIN") {
      return res.status(401).json({ message: "Access denied. Admin only." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: (user as any).role 
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Verify User
export const verifyUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as any).id;
    const user = await prisma.member.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        fullName: true, 
        email: true, 
        role: true // Prisma query includes it at runtime
      } as any
    });

    res.status(200).json({ 
      authenticated: true, 
      user: user as any 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};