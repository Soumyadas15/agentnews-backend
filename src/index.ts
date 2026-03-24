import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import categoryRoutes from "./routes/category.routes";
import commentRoutes from "./routes/comment.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import rssRoutes from "./routes/rss.routes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { startSourcingScheduler, getSourcingStatus } from "./services/sourcing/scheduler";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [
      "https://theagentnews.com",
      "https://www.theagentnews.com",
      // Vercel preview URLs (any subdomain of vercel.app)
      /https:\/\/.*\.vercel\.app$/,
    ]
  : true;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AgentNews API",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", commentRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/rss", rssRoutes);

// ── Sourcing status endpoint ──────────────────────────────────
app.get("/api/sourcing/status", (_req, res) => {
  res.json(getSourcingStatus());
});

// ── Error handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AgentNews API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);

  // Start the AI news sourcing engine
  startSourcingScheduler().catch((err) => {
    console.error("Failed to start sourcing scheduler:", err);
  });
});

export default app;
