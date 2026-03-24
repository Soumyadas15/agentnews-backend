import { Router } from "express";
import {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/article.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);
router.post("/", authenticate, authorize("AUTHOR", "ADMIN"), createArticle);
router.put("/:id", authenticate, authorize("AUTHOR", "ADMIN"), updateArticle);
router.delete("/:id", authenticate, authorize("AUTHOR", "ADMIN"), deleteArticle);

export default router;
