import { Response, Request } from "express";
import { prisma } from "../utils/prisma";
import { sendSuccess, sendError, paginate, paginationMeta } from "../utils/response";
import { uniqueSlug } from "../utils/slug";
import { AuthRequest, ArticleQuery } from "../types/index";

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  published: true,
  featured: true,
  views: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, name: true, username: true, avatar: true },
  },
  category: {
    select: { id: true, name: true, slug: true, color: true },
  },
  tags: {
    select: { id: true, name: true, slug: true },
  },
  _count: { select: { comments: true } },
};

export const getArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10", category, tag, search, featured, published } =
      req.query as ArticleQuery;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where: Record<string, unknown> = {};

    if (!req.user || req.user.role === "READER") {
      where["published"] = true;
    } else if (published !== undefined) {
      where["published"] = published === "true";
    }

    if (featured === "true") where["featured"] = true;
    if (category) where["category"] = { slug: category };
    if (tag) where["tags"] = { some: { slug: tag } };
    if (search) {
      where["OR"] = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: articleSelect,
        orderBy: { publishedAt: "desc" },
        ...paginate(pageNum, limitNum),
      }),
      prisma.article.count({ where }),
    ]);

    sendSuccess(res, {
      articles,
      meta: paginationMeta(total, pageNum, limitNum),
    });
  } catch (error) {
    console.error("GetArticles error:", error);
    sendError(res, "Failed to fetch articles", 500);
  }
};

export const getArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const slug = String(req.params["slug"]);

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true, bio: true } },
        category: true,
        tags: true,
        comments: {
          where: { approved: true },
          include: {
            author: { select: { id: true, name: true, username: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      sendError(res, "Article not found", 404);
      return;
    }

    if (!article.published && (!authReq.user || authReq.user.role === "READER")) {
      sendError(res, "Article not found", 404);
      return;
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    sendSuccess(res, { ...article, views: article.views + 1 });
  } catch (error) {
    console.error("GetArticleBySlug error:", error);
    sendError(res, "Failed to fetch article", 500);
  }
};

export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, excerpt, content, coverImage, categoryId, tags, published, featured } =
      req.body as {
        title: string;
        excerpt: string;
        content: string;
        coverImage?: string;
        categoryId: string;
        tags?: string[];
        published?: boolean;
        featured?: boolean;
      };

    if (!title || !excerpt || !content || !categoryId) {
      sendError(res, "Title, excerpt, content and category are required", 400);
      return;
    }

    const slug = uniqueSlug(title);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage ?? null,
        published: published ?? false,
        featured: featured ?? false,
        publishedAt: published ? new Date() : null,
        authorId: req.user!.id,
        categoryId,
        tags:
          tags && tags.length > 0
            ? {
                connectOrCreate: tags.map((tag: string) => ({
                  where: { slug: tag.toLowerCase().replace(/\s+/g, "-") },
                  create: {
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, "-"),
                  },
                })),
              }
            : undefined,
      },
      select: articleSelect,
    });

    sendSuccess(res, article, "Article created successfully", 201);
  } catch (error) {
    console.error("CreateArticle error:", error);
    sendError(res, "Failed to create article", 500);
  }
};

export const updateArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);
    const { title, excerpt, content, coverImage, categoryId, tags, published, featured } =
      req.body as {
        title?: string;
        excerpt?: string;
        content?: string;
        coverImage?: string;
        categoryId?: string;
        tags?: string[];
        published?: boolean;
        featured?: boolean;
      };

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, "Article not found", 404);
      return;
    }

    if (existing.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      sendError(res, "Forbidden", 403);
      return;
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categoryId && { categoryId }),
        ...(published !== undefined && {
          published,
          publishedAt:
            published && !existing.published ? new Date() : existing.publishedAt,
        }),
        ...(featured !== undefined && { featured }),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag: string) => ({
              where: { slug: tag.toLowerCase().replace(/\s+/g, "-") },
              create: {
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, "-"),
              },
            })),
          },
        }),
      },
      select: articleSelect,
    });

    sendSuccess(res, article, "Article updated successfully");
  } catch (error) {
    console.error("UpdateArticle error:", error);
    sendError(res, "Failed to update article", 500);
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, "Article not found", 404);
      return;
    }

    if (existing.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      sendError(res, "Forbidden", 403);
      return;
    }

    await prisma.article.delete({ where: { id } });
    sendSuccess(res, null, "Article deleted successfully");
  } catch (error) {
    console.error("DeleteArticle error:", error);
    sendError(res, "Failed to delete article", 500);
  }
};
