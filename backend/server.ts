import express from "express";
// Rule: Use 'import type' for interfaces/types
import type { Request, Response } from "express";
import type { AuthRequest } from "./middleware/auth.js";

import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";  
import { fileURLToPath } from "url";
import fs from "fs"; // 🚀 Added to safely verify and create directories

// Rule: Add .js extensions to local relative imports
import { swaggerUi, swaggerSpec } from "./swagger.js";
import prisma from "./db.js";
import { protect } from "./middleware/auth.js";
import { uploadToCloudinary } from "./config/cloudinary.js";

// Import your routes with .js extensions
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js"; // 🚀 Imported modular routes
import testimonyRoutes from "./routes/testimonyRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// --- ESM Directory Setup ---
// Required to serve static files in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Bulletproof directory handling: creates public/uploads if it doesn't exist yet
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Middleware ---
app.use(cors({
  origin: "http://localhost:5173", // Allow your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(bodyParser.json());

// Serve the uploads folder dynamically using the absolute path
app.use('/uploads', express.static(uploadDir));

// --- Multer Configuration: Profiles (memory storage for Cloudinary upload) ---
const uploadProfile = multer({ storage: multer.memoryStorage() });


// --- Swagger Documentation ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/announcements", announcementRoutes); // 🚀 Cleanly mounted announcement router here
app.use("/api/testimonies", testimonyRoutes);

/**
 * Profile Image Upload Route (Cloudinary with local disk fallback)
 */
app.post('/api/upload-profile', protect as any, uploadProfile.single('profileImage'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (req.user as any).id;
    let imageUrl: string;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, 'profiles');
      imageUrl = (result as any).secure_url;
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname);
      const filename = 'profile-' + uniqueSuffix + ext;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      imageUrl = `${baseUrl}/uploads/${filename}`;
    }

    const updatedMember = await prisma.member.update({
      where: { id: userId },
      data: { profileImage: imageUrl }
    });

    res.json({ 
      message: "Profile image updated successfully", 
      imageUrl: updatedMember.profileImage 
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message || "Server error during upload" });
  }
});

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