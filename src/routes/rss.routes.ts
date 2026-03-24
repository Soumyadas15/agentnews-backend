import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

const router = Router();
const SITE_URL = "https://theagentnews.com";
const API_URL  = "https://api.theagentnews.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true } },
      },
    });

    const items = articles.map(a => {
      const link = `${SITE_URL}/articles/${escapeXml(a.slug)}`;
      const date = new Date(a.publishedAt || a.createdAt).toUTCString();
      const tags = a.tags.map(t => `<category>${escapeXml(t.name)}</category>`).join("\n        ");
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <author>${escapeXml(a.author.name)}</author>
      <category>${escapeXml(a.category.name)}</category>
      ${tags}
      <pubDate>${date}</pubDate>
      ${a.coverImage ? `<enclosure url="${escapeXml(a.coverImage)}" type="image/jpeg" length="0"/>` : ""}
    </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>AgentNews</title>
    <link>${SITE_URL}</link>
    <description>The latest AI and technology news, sourced and enriched every few minutes.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} AgentNews</copyright>
    <managingEditor>news@theagentnews.com (AgentNews)</managingEditor>
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>AgentNews</title>
      <link>${SITE_URL}</link>
    </image>
    <atom:link href="${API_URL}/api/rss" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>3</ttl>
${items}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=180"); // 3-min cache
    res.send(xml);
  } catch (err) {
    console.error("RSS error:", err);
    res.status(500).send("RSS generation failed");
  }
});

export default router;
