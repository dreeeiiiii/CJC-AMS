import express from "express";
import multer from "multer";
import path from "path";
import { 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement,
  updateAnnouncement
} from "../controllers/announcementController.js";

const router = express.Router();

// Define storage back to your public/uploads directory
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(process.cwd(), "public", "uploads"));
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "announcement-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Bind paths to controllers
router.get("/", getAnnouncements);
router.post("/", upload.single("image"), createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;