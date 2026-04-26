import "dotenv/config";
import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { categoryRouter } from "./modules/category/category.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { swaggerSpec } from "./swagger.js";
import { i18nMiddleware } from "./middleware/i18n.middleware.js";

export const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests like curl/postman may not send Origin.
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowed = env.corsAllowedOrigins;
    if (allowed.length === 0 || allowed.includes("*") || allowed.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  },
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(i18nMiddleware);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.use(errorHandler);
