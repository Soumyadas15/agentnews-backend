import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { generateSlug } from "../utils/slug";

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { articles: { where: { published: true } } } } },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, categories);
  } catch (error) {
    console.error("GetCategories error:", error);
    sendError(res, "Failed to fetch categories", 500);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params["slug"]);
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { articles: { where: { published: true } } } } },
    });
    if (!category) {
      sendError(res, "Category not found", 404);
      return;
    }
    sendSuccess(res, category);
  } catch (error) {
    console.error("GetCategoryBySlug error:", error);
    sendError(res, "Failed to fetch category", 500);
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body as { name: string; description?: string; color?: string };
    if (!name) {
      sendError(res, "Name is required", 400);
      return;
    }
    const slug = generateSlug(name);
    const category = await prisma.category.create({
      data: { name, slug, description: description ?? null, color: color ?? null },
    });
    sendSuccess(res, category, "Category created", 201);
  } catch (error) {
    console.error("CreateCategory error:", error);
    sendError(res, "Failed to create category", 500);
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);
    const { name, description, color } = req.body as { name?: string; description?: string; color?: string };
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name, slug: generateSlug(name) }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
    });
    sendSuccess(res, category, "Category updated");
  } catch (error) {
    console.error("UpdateCategory error:", error);
    sendError(res, "Failed to update category", 500);
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);
    await prisma.category.delete({ where: { id } });
    sendSuccess(res, null, "Category deleted");
  } catch (error) {
    console.error("DeleteCategory error:", error);
    sendError(res, "Failed to delete category", 500);
  }
};
