import { Response } from "express";
import { prisma } from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../types/index";

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const articleId = String(req.params["articleId"]);
    const where: Record<string, unknown> = { articleId };

    // Non-admins only see approved comments
    if (!req.user || req.user.role === "READER") {
      where["approved"] = true;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, comments);
  } catch (error) {
    console.error("GetComments error:", error);
    sendError(res, "Failed to fetch comments", 500);
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const articleId = String(req.params["articleId"]);
    const { content } = req.body as { content: string };

    if (!content || content.trim().length === 0) {
      sendError(res, "Comment content is required", 400);
      return;
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article || !article.published) {
      sendError(res, "Article not found", 404);
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        articleId,
        authorId: req.user!.id,
        approved: req.user!.role === "ADMIN" || req.user!.role === "AUTHOR",
      },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    sendSuccess(res, comment, "Comment submitted successfully", 201);
  } catch (error) {
    console.error("CreateComment error:", error);
    sendError(res, "Failed to create comment", 500);
  }
};

export const approveComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);
    const comment = await prisma.comment.update({
      where: { id },
      data: { approved: true },
    });
    sendSuccess(res, comment, "Comment approved");
  } catch (error) {
    console.error("ApproveComment error:", error);
    sendError(res, "Failed to approve comment", 500);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      sendError(res, "Comment not found", 404);
      return;
    }

    if (comment.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      sendError(res, "Forbidden", 403);
      return;
    }

    await prisma.comment.delete({ where: { id } });
    sendSuccess(res, null, "Comment deleted");
  } catch (error) {
    console.error("DeleteComment error:", error);
    sendError(res, "Failed to delete comment", 500);
  }
};
