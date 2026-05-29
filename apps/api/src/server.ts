import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Formify SaaS API",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
  securitySchemes: {
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
      description: "Enter your developer API Key (e.g., formify_demo_api_key_2026_ninja)",
    },
  },
});

if (env.NODE_ENV !== "prod") {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    }),
  );
}

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "Formify SaaS API Server is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Formify backend service is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
