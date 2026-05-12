import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CJCSched API",
            version: "1.0.0",
            description: "API documentation with Swagger and TypeScript",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // 👈 CRITICAL: Changed from .js to .ts to detect your JSDoc comments
    apis: ["./routes/*.ts"],
};
const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi, swaggerSpec };
//# sourceMappingURL=swagger.js.map