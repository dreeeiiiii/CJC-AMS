import express from "express";
import multer from "multer";
import { 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement,
  updateAnnouncement,
  togglePin,
  acknowledgeAnnouncement,
  unacknowledgeAnnouncement
} from "../controllers/announcementController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Bind paths to controllers
router.get("/", protect, getAnnouncements);
router.post("/", upload.single("image"), createAnnouncement);
router.put("/:id", updateAnnouncement);
router.patch("/:id/pin", togglePin);
router.post("/:id/acknowledge", protect, acknowledgeAnnouncement);
router.delete("/:id/acknowledge", protect, unacknowledgeAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;