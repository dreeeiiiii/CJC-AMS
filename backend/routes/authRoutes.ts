import { Router } from "express";
import { 
  createUsersAccount, 
  memberLogin,
  adminLogin,    
  verifyUser 
} from "../controllers/authControllers.js";
import { protect } from "../middleware/auth.js";
import { googleLogin } from "../controllers/googleAuthControllers.js";

const router = Router();

// --- Registration ---
router.post("/register", createUsersAccount);

// --- Login Routes ---
router.post("/memberLogin", memberLogin);
router.post("/adminLogin", adminLogin);

// --- External Auth ---
router.post("/google", googleLogin);

// --- Verification ---
router.get("/verify", protect as any, verifyUser);

export default router;