import express from "express";
// Rule: Use 'import type' for interfaces/types
import type { Request, Response } from "express";

import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Rule: Add .js extensions to local relative imports
import { swaggerUi, swaggerSpec } from "./swagger.js";
import prisma from "./db.js";

// Import your routes with .js extensions
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js"
import attendanceRoutes from "./routes/attendanceRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js"

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors({
  origin: "http://localhost:5173", // Allow your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(bodyParser.json());

// --- Swagger Documentation ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/visitors", visitorRoutes);

/**
 * Test Route
 */
app.get('/test', async (req: Request, res: Response) => {
  try {
    // prisma.member is correct based on your Member model in schema.prisma
    const members = await prisma.member.findMany(); 
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
  console.log(`📑 API Docs available at: http://localhost:${PORT}/api-docs`);
});