import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
// 📌 Helper function to handle token signing
const generateToken = (user) => {
    const secret = process.env.JWT_TOKEN_SECRET;
    if (!secret) {
        throw new Error("JWT_TOKEN_SECRET is missing from .env");
    }
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role // Force cast to access the DB column
    }, secret, { expiresIn: '1d' });
};
// 📌 Register User
export const createUsersAccount = async (req, res) => {
    const { type, fullName, contactNo, address, gender, email, password, churchAffiliation } = req.body;
    try {
        if (type === 'member') {
            const existingUser = await prisma.member.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered as a member" });
            }
            if (!password) {
                return res.status(400).json({ message: "Password is required for member registration" });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = await prisma.member.create({
                data: {
                    fullName,
                    contactNo,
                    address,
                    gender: gender,
                    email,
                    password: hashedPassword,
                    // role defaults to MEMBER in schema, no need to pass it
                },
            });
            return res.status(201).json({
                message: "Member account created successfully",
                id: newUser.id
            });
        }
        if (type === 'visitor') {
            if (email) {
                const existingVisitor = await prisma.visitor.findUnique({ where: { email } });
                if (existingVisitor) {
                    return res.status(400).json({ message: "Visitor already exists with this email" });
                }
            }
            const newVisitor = await prisma.visitor.create({
                data: {
                    fullName,
                    contactNo,
                    address,
                    gender: gender,
                    email: email || null,
                    category: "WalkIn",
                    churchAffiliation: churchAffiliation || null,
                    role: "VISITOR"
                },
            });
            return res.status(201).json({
                message: "Visitor record created successfully",
                id: newVisitor.id
            });
        }
        return res.status(400).json({ message: "Invalid registration type" });
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message || "An internal server error occurred" });
    }
};
// 📌 Member Login
// 📌 Member Login
// 📌 Member Login - Robust Version
export const memberLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Fetch user from database
        const user = await prisma.member.findUnique({ where: { email } });
        // DEBUG: This will show up in your terminal/backend console
        console.log("--- Login Attempt ---");
        console.log("Email:", email);
        console.log("User Found:", !!user);
        if (user)
            console.log("DB Role:", user.role);
        // 2. Check if user exists
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // 3. Robust Role Check
        // We cast to any because TypeScript might not see the 'role' field if it's dynamic
        const rawRole = user.role;
        const userRole = rawRole ? rawRole.toString().toUpperCase() : null;
        // Check if user is either a MEMBER or an ADMIN (Admins should be able to log in anywhere)
        if (!userRole || (userRole !== "MEMBER" && userRole !== "ADMIN")) {
            console.log("❌ Access Denied: User has invalid role:", userRole);
            return res.status(403).json({
                message: "Access Denied: You do not have the required permissions."
            });
        }
        // 4. Password Comparison (Bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // 5. Generate JWT
        const token = generateToken(user);
        // 6. Success Response
        return res.status(200).json({
            message: "Member login successful",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: userRole // Return the standardized uppercase role
            }
        });
    }
    catch (error) {
        console.error("Critical Login Error:", error);
        return res.status(500).json({ error: "Internal server error during login" });
    }
};
// 📌 Admin Login
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.member.findUnique({ where: { email } });
        if (!user || user.role.toString().toUpperCase() !== "ADMIN") {
            return res.status(401).json({ message: "Access denied. Admin only." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user);
        return res.status(200).json({
            message: "Admin login successful",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
// 📌 Verify User (Used by Auth Middleware/Context)
export const verifyUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;
        const user = await prisma.member.findUnique({
            where: { id: userId }
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({
            authenticated: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=authControllers.js.map