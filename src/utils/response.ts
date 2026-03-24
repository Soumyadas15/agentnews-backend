import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = "Internal Server Error",
  statusCode = 500,
  errors?: unknown
) => {
  const body: Record<string, unknown> = { success: false, message };
  if (errors) body["errors"] = errors;
  return res.status(statusCode).json(body);
};

export const paginate = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const paginationMeta = (
  total: number,
  page: number,
  limit: number
) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
