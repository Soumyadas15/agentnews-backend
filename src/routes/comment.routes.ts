import { Router } from "express";
import {
  getComments,
  createComment,
  approveComment,
  deleteComment,
} from "../controllers/comment.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/articles/:articleId/comments", getComments);
router.post("/articles/:articleId/comments", authenticate, createComment);
router.patch("/comments/:id/approve", authenticate, authorize("ADMIN"), approveComment);
router.delete("/comments/:id", authenticate, deleteComment);

export default router;
