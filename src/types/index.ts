import { Request, ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export interface AuthRequest<
  P = ParamsDictionary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResBody = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReqBody = any,
  ReqQuery = ParsedQs,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ArticleQuery extends PaginationQuery {
  category?: string;
  tag?: string;
  search?: string;
  featured?: string;
  published?: string;
}
