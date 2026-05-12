import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number; // Changed to number to match Prisma Int ID
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: DecodedToken;
}

// 1. Protect Middleware (Ensures user is logged in)
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    const secret = process.env.JWT_TOKEN_SECRET!;
    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    req.user = decoded; 
    next();
  } catch (error: any) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// 2. Admin Only Middleware (Ensures user has ADMIN role)
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role.toUpperCase() === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};