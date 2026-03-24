import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types/index";
import { sendError } from "../utils/response";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Unauthorized: No token provided", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    sendError(res, "Unauthorized: Invalid token format", 401);
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    sendError(res, "Unauthorized: Invalid or expired token", 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Unauthorized", 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, "Forbidden: Insufficient permissions", 403);
      return;
    }
    next();
  };
};
