import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number; // Changed to number to match Prisma Int ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: DecodedToken;
}

// 1. Protect Middleware (Ensures user is logged in)
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    const secret = process.env.JWT_TOKEN_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "Authentication configuration error" });
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (!decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ message: "Token payload is invalid" });
    }
    
    req.user = {
      ...decoded,
      id: Number(decoded.id),
      role: decoded.role.toUpperCase()
    }; 
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

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