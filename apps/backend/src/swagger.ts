import swaggerJsdoc from "swagger-jsdoc";
import { authDocs } from "./modules/auth/auth.docs.js";
import { productDocs } from "./modules/product/product.docs.js";
import { cartDocs } from "./modules/cart/cart.docs.js";
import { orderDocs } from "./modules/order/order.docs.js";
import { categoryDocs } from "./modules/category/category.docs.js";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "E-commerce Order API", version: "1.0.0" },
    tags: [
      { name: "Auth" },
      { name: "Product" },
      { name: "Category" },
      { name: "Cart" },
      { name: "Order" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Request successful" },
            data: {},
          },
          required: ["success", "message", "data"],
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Request failed" },
            data: { type: "null", nullable: true, example: null },
          },
          required: ["success", "message", "data"],
        },
        AuthRegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string", minLength: 2, maxLength: 60, example: "John" },
            lastName: { type: "string", minLength: 2, maxLength: 60, example: "Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", minLength: 6, example: "Secret123" },
          },
        },
        AuthLoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", minLength: 6, example: "Secret123" },
          },
        },
        AuthRegisterData: {
          type: "object",
          required: ["id", "email", "role"],
          properties: {
            id: { type: "integer", example: 5 },
            email: { type: "string", format: "email", example: "john@example.com" },
            role: { type: "string", enum: ["admin", "customer"], example: "customer" },
          },
        },
        AuthLoginData: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },
        Category: {
          type: "object",
          required: ["id", "name", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Electronics" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          required: ["id", "name", "price", "stock", "categoryId", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer", example: 10 },
            name: { type: "string", example: "Phone X" },
            description: { type: "string", nullable: true, example: "Latest flagship device" },
            price: { type: "number", example: 699.99 },
            stock: { type: "integer", example: 25 },
            categoryId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ProductListData: {
          type: "object",
          required: ["items", "page", "limit", "total"],
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 12 },
            total: { type: "integer", example: 48 },
          },
        },
        UpsertProductRequest: {
          type: "object",
          required: ["name", "price", "stock", "categoryId"],
          properties: {
            name: { type: "string", minLength: 2, example: "Phone X" },
            description: { type: "string", nullable: true, example: "Latest flagship device" },
            price: { type: "number", minimum: 0, example: 699.99 },
            stock: { type: "integer", minimum: 0, example: 10 },
            categoryId: { type: "integer", minimum: 1, example: 1 },
          },
        },
        CreateCategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 2, example: "Wearables" },
          },
        },
        CartRow: {
          type: "object",
          required: ["id", "userId", "createdAt"],
          properties: {
            id: { type: "integer", example: 2 },
            userId: { type: "integer", example: 5 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CartItemRow: {
          type: "object",
          required: ["id", "cartId", "productId", "quantity"],
          properties: {
            id: { type: "integer", example: 17 },
            cartId: { type: "integer", example: 2 },
            productId: { type: "integer", example: 10 },
            quantity: { type: "integer", example: 2 },
          },
        },
        CartItemWithIncludes: {
          allOf: [
            { $ref: "#/components/schemas/CartItemRow" },
            {
              type: "object",
              required: ["product", "cart"],
              properties: {
                product: { $ref: "#/components/schemas/Product" },
                cart: { $ref: "#/components/schemas/CartRow" },
              },
            },
          ],
        },
        CartGetData: {
          type: "object",
          required: ["items", "total"],
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/CartItemWithIncludes" } },
            total: { type: "number", example: 1399.98 },
          },
        },
        AddToCartRequest: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "integer", minimum: 1, example: 10 },
            quantity: { type: "integer", minimum: 1, example: 1 },
          },
        },
        UpdateCartItemRequest: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", minimum: 1, example: 3 },
          },
        },
        OrderItem: {
          type: "object",
          required: ["id", "orderId", "productId", "quantity", "unitPrice"],
          properties: {
            id: { type: "integer", example: 101 },
            orderId: { type: "integer", example: 44 },
            productId: { type: "integer", example: 10 },
            quantity: { type: "integer", example: 2 },
            unitPrice: { type: "number", example: 699.99 },
          },
        },
        Order: {
          type: "object",
          required: ["id", "userId", "status", "totalAmount", "createdAt", "updatedAt", "items"],
          properties: {
            id: { type: "integer", example: 44 },
            userId: { type: "integer", example: 5 },
            status: {
              type: "string",
              enum: ["pending", "placed", "confirmed", "cancelled"],
              example: "placed",
            },
            totalAmount: { type: "number", example: 1399.98 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          },
        },
        OrderListData: {
          type: "object",
          required: ["items", "page", "limit", "total"],
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Order" } },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 21 },
          },
        },
      },
    },
  },
  apis: [],
}) as { paths?: Record<string, unknown> } & Record<string, unknown>;

swaggerSpec.paths = {
  ...(swaggerSpec.paths ?? {}),
  ...authDocs,
  ...productDocs,
  ...cartDocs,
  ...orderDocs,
  ...categoryDocs,
};
