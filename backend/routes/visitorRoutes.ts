import { Router } from "express";
import { 
  getAllVisitors, 
  createVisitor, 
  deleteVisitors,
  getVisitorStats // 1. Make sure to import this!
} from "../controllers/visitorController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();


router.get("/stats", protect, adminOnly, getVisitorStats);

// The rest of your routes
router.get("/", protect, adminOnly, getAllVisitors);
router.post("/", protect, adminOnly, createVisitor);
router.delete("/", protect, adminOnly, deleteVisitors);

export default router;