import { Router } from "express";
import { 
  getActiveVerse, 
  getTestimonies, 
  createTestimony, 
  deleteTestimony 
} from "../controllers/contentControllers.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

/**
 * --- PUBLIC / MEMBER ROUTES ---
 * Accessible by any logged-in member to populate the dashboard.
 */

// GET /api/contentRoutes/verse/today
router.get("/verse/today", getActiveVerse);

// GET /api/contentRoutes/testimonies
router.get("/testimonies", getTestimonies);


/**
 * --- ADMIN ONLY ROUTES ---
 * Only users with the 'ADMIN' role can modify the Verse of the Day or Testimonies.
 */


// POST /api/contentRoutes/testimonies
router.post("/testimonies", protect, adminOnly, createTestimony);

// DELETE /api/contentRoutes/testimonies/:id
router.delete("/testimonies/:id", protect, adminOnly, deleteTestimony);

export default router;