    import { Router } from "express";
    import { forgotPassword,verifyOtp, resetPassword} from "../controllers/forgotpasswordController.js";


    const router = Router();

    router.post("/forgotpassword",forgotPassword);
    router.post("/verify-otp",verifyOtp);
    router.post("/reset-password", resetPassword);

    export default router;