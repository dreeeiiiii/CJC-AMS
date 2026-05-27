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

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Bind paths to controllers
router.get("/", getAnnouncements);
router.post("/", upload.single("image"), createAnnouncement);
router.put("/:id", updateAnnouncement);
router.patch("/:id/pin", togglePin);
router.post("/:id/acknowledge", acknowledgeAnnouncement);
router.delete("/:id/acknowledge", unacknowledgeAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;