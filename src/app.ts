import express, { Application, Request, Response } from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import productRouter from "./routes/product.routes";
import CartRouter from "./routes/cart.routes";
import OrderRouter from "./routes/order.routes";
import PaymentRouter from "./routes/payment.routes";
import swaggerJSDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app:Application = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ==========================================
// SWAGGER CONFIGURATION
// ==========================================
const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API documentation for my backend endpoints",
      apis: ['./src/**/*.ts', './dist/**/*.js', './build/**/*.js']
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
          required: ["email","name","password"]
        },
        AuthSignIn: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" }
          },
          required: ["email","password"]
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
          required: ["title","price","stock"]
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
  apis:
  process.env.NODE_ENV === "production"
    ? ["./dist/routes/*.js"]
    : ["./src/routes/*.ts"], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Serve the documentation UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ==========================================

// Application Routes
app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", CartRouter);
app.use("/api/payments", PaymentRouter);
app.use("/api/order", OrderRouter);

export default app;