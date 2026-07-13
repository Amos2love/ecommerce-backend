"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
// ==========================================
// SWAGGER CONFIGURATION
// ==========================================
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce API",
            version: "1.0.0",
            description: "API documentation for my backend endpoints",
        },
        servers: [
            {
                // You can use process.env.PORT here if you have one set up
                url: process.env.API_URL || "http://localhost:3000",
                description: "Server",
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
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                },
                // Auth
                UserSignup: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email" },
                        name: { type: "string" },
                        password: { type: "string" }
                    },
                    required: ["email", "name", "password"]
                },
                AuthSignIn: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string" }
                    },
                    required: ["email", "password"]
                },
                AuthTokens: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" },
                        expiresIn: { type: "integer" }
                    }
                },
                // User DTO
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        email: { type: "string", format: "email" },
                        name: { type: "string" },
                        role: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                // Product
                Product: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        price: { type: "number" },
                        stock: { type: "integer" },
                        imageUrl: { type: "string" },
                        imageId: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                ProductCreate: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        price: { type: "number" },
                        stock: { type: "integer" },
                        image: { type: "string", format: "binary" }
                    },
                    required: ["title", "price", "stock"]
                },
                ProductList: {
                    type: "object",
                    properties: {
                        data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                        page: { type: "integer" },
                        perPage: { type: "integer" },
                        total: { type: "integer" }
                    }
                },
                // Cart
                CartItem: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        product: { $ref: "#/components/schemas/Product" },
                        quantity: { type: "integer" },
                        price: { type: "number" },
                        lineTotal: { type: "number" }
                    }
                },
                Cart: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        userId: { type: "string" },
                        items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
                        subtotal: { type: "number" },
                        total: { type: "number" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                // Orders
                OrderItem: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        product: { $ref: "#/components/schemas/Product" },
                        quantity: { type: "integer" },
                        price: { type: "number" }
                    }
                },
                Order: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        userId: { type: "string" },
                        status: { type: "string" },
                        subtotal: { type: "number" },
                        tax: { type: "number" },
                        shippingFee: { type: "number" },
                        discount: { type: "number" },
                        total: { type: "number" },
                        paymentMethod: { type: "string" },
                        transactionId: { type: "string" },
                        trackingNumber: { type: "string" },
                        shippingName: { type: "string" },
                        shippingAddress: { type: "string" },
                        shippingCity: { type: "string" },
                        shippingCountry: { type: "string" },
                        items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                }
            },
        },
    },
    apis: process.env.NODE_ENV === "production"
        ? ["./dist/routes/*.js"]
        : ["./src/routes/*.ts"]
};
app.get("/swagger.json", (req, res) => {
    res.json(swaggerDocs);
});
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
// Serve the documentation UI
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// ==========================================
// Application Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/product", product_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/order", order_routes_1.default);
exports.default = app;
