import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const secret = process.env.JWT_TOKEN_SECRET;
        if (!secret) {
            throw new Error("JWT_TOKEN_SECRET is not defined in environment variables");
        }
        const decoded = jwt.verify(token, secret);
        // Now TypeScript knows req.user is allowed on AuthRequest
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};
//# sourceMappingURL=auth.js.map