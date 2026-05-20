import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js'; 
import type { AuthRequest } from '../middleware/auth.js';

// 📌 Helper to format the full name since it's no longer in the DB
const formatFullName = (user: any) => {
  const middle = user.middleName ? ` ${user.middleName.charAt(0)}.` : '';
  return `${user.firstName}${middle} ${user.lastName}`;
};

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
      role: (user as any).role 
    }, 
    secret, 
    { expiresIn: '1d' }
  );
};

// 📌 Register User
export const createUsersAccount = async (req: Request, res: Response) => {
  const { 
    type, 
    firstName, 
    lastName, 
    middleName,
    contactNo, 
    address, 
    gender, 
    email, 
    password, 
    churchAffiliation 
  } = req.body;

  try {
    if (type === 'member') {
      const existingUser = await prisma.member.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered as a member" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.member.create({
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          contactNo,
          address,
          gender: gender as any,
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({ message: "Member account created successfully", id: newUser.id });
    }

    if (type === 'visitor') {
      const newVisitor = await prisma.visitor.create({
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          contactNo,
          address,
          gender: gender as any,
          email: email || null,
          category: "WalkIn",
          churchAffiliation: churchAffiliation ?? null, 
          role: "VISITOR" as any
        },
      });

      return res.status(201).json({ message: "Visitor record created successfully", id: newVisitor.id });
    }

    return res.status(400).json({ message: "Invalid registration type" });

  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// 📌 1. Dedicated Admin Login Route
export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.member.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Explicit Role Check: Must be ADMIN
    const userRole = user.role ? user.role.toUpperCase() : "MEMBER";
    if (userRole !== "ADMIN") {
      return res.status(403).json({ 
        message: "Access Denied: You do not have administrative permissions." 
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Admin authentication successful",
      token,
      user: { 
        id: user.id, 
        firstName: user.firstName,   
        lastName: user.lastName,
        email: user.email, 
        role: userRole 
      }
    });

  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({ error: "Internal server error during admin login" });
  }
};

// 📌 2. Dedicated Regular Member Login Route
export const memberLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.member.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Explicit Role Check: Must be MEMBER
    const userRole = user.role ? user.role.toUpperCase() : "MEMBER";
    if (userRole !== "MEMBER") {
      return res.status(403).json({ 
        message: "Access Denied: Please use the Admin Portal to sign in with this account." 
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Member login successful",
      token,
      user: { 
        id: user.id, 
        firstName: user.firstName,   
        middleName: user.middleName, 
        lastName: user.lastName,
        email: user.email, 
        contactNo: user.contactNo,   
        address: user.address,
        profileImage: user.profileImage,
        role: userRole 
      }
    });

  } catch (error: any) {
    console.error("Member Login Error:", error);
    return res.status(500).json({ error: "Internal server error during member login" });
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
      where: { id: userId }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      authenticated: true, 
      user: {
        id: user.id,
        fullName: formatFullName(user),
        email: user.email,
        role: (user as any).role
      } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};