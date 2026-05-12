import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
// Rule: Add .js extensions to local relative imports
import { swaggerUi, swaggerSpec } from "./swagger.js";
import prisma from "./db.js";
// Import your routes with .js extensions
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// Load environment variables
dotenv.config();
const app = express();
// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
// --- Swagger Documentation ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// --- Routes ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
/**
 * Test Route
 */
app.get('/test', async (req, res) => {
    try {
        // prisma.member is correct based on your Member model in schema.prisma
        const members = await prisma.member.findMany();
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${PORT}`);
    console.log(`📑 API Docs available at: http://localhost:${PORT}/api-docs`);
});
//# sourceMappingURL=server.js.map