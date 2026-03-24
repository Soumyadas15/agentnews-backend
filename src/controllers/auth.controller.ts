import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../types/index";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, name } = req.body;

    if (!email || !username || !password || !name) {
      sendError(res, "All fields are required", 400);
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      sendError(res, "Email or username already exists", 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, name },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    sendSuccess(res, { user, token }, "Registered successfully", 201);
  } catch (error) {
    console.error("Register error:", error);
    sendError(res, "Registration failed", 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, "Email and password are required", 400);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, { user: userWithoutPassword, token }, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, "Login failed", 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: { select: { articles: true, comments: true } },
      },
    });

    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    console.error("GetMe error:", error);
    sendError(res, "Failed to get user", 500);
  }
};
