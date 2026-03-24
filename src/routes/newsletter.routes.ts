import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";

const router = Router();

router.post("/subscribe", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    sendError(res, "A valid email address is required", 400);
    return;
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email },
    });
    sendSuccess(res, null, "Subscribed successfully");
  } catch {
    sendError(res, "Failed to subscribe", 500);
  }
});

router.post("/unsubscribe", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email) { sendError(res, "Email required", 400); return; }
  try {
    await prisma.newsletterSubscriber.update({ where: { email }, data: { active: false } });
    sendSuccess(res, null, "Unsubscribed");
  } catch {
    sendError(res, "Not found", 404);
  }
});

export default router;
