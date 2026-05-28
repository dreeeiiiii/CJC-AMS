import { Router } from "express";
import { createUsersAccount, memberLogin, adminLogin, verifyUser } from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/auth.js";
import { googleLogin } from "../controllers/googleAuthControllers.js";
const router = Router();
// --- Registration ---
router.post("/register", createUsersAccount);
// --- Login Routes ---
router.post("/member/login", memberLogin);
router.post("/admin/login", adminLogin);
// --- External Auth ---
router.post("/google", googleLogin);
// --- Verification ---
router.get("/verify", authMiddleware, verifyUser);
export default router;
//# sourceMappingURL=authRoutes.js.map