import { prisma } from "../../utils/prisma";
import { EnrichedArticle } from "./enricher";
import bcrypt from "bcryptjs";

// The bot author account used for all sourced articles
const AGENTBOT_EMAIL = "agentbot@theagentnews.com";
const AGENTBOT_USERNAME = "agentbot";
const AGENTBOT_NAME = "AgentBot";

let agentBotId: string | null = null;

/**
 * Ensures the AgentBot user exists in the DB, creates it if not.
 * Returns the user ID.
 */
export async function ensureAgentBot(): Promise<string> {
  if (agentBotId) return agentBotId;

  let bot = await prisma.user.findUnique({ where: { email: AGENTBOT_EMAIL } });

  if (!bot) {
    const password = await bcrypt.hash(
      process.env.AGENTBOT_PASSWORD || "agentbot-" + Math.random().toString(36),
      10
    );
    bot = await prisma.user.create({
      data: {
        email: AGENTBOT_EMAIL,
        username: AGENTBOT_USERNAME,
        name: AGENTBOT_NAME,
        password,
        role: "AUTHOR",
        bio: "Automated AI news sourcing engine. Fetches and publishes the latest AI news every few minutes.",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=agentbot",
      },
    });
    console.log("[Sourcing] AgentBot user created:", bot.id);
  }

  agentBotId = bot.id;
  return agentBotId;
}

/**
 * Ensures a category exists (by slug). Creates it with a default config if missing.
 */
async function ensureCategory(slug: string): Promise<string> {
  const CATEGORY_DEFAULTS: Record<string, { name: string; color: string; description: string }> = {
    "artificial-intelligence": {
      name: "Artificial Intelligence",
      color: "#6366F1",
      description: "Latest developments in AI systems, models, and capabilities",
    },
    research: {
      name: "Research",
      color: "#10B981",
      description: "Academic and industry AI research breakthroughs",
    },
    industry: {
      name: "Industry",
      color: "#F59E0B",
      description: "Business news, funding, and enterprise AI adoption",
    },
    products: {
      name: "Products",
      color: "#3B82F6",
      description: "New AI-powered products and feature launches",
    },
    policy: {
      name: "Policy",
      color: "#EF4444",
      description: "AI regulation, ethics, and governance",
    },
  };

  let cat = await prisma.category.findUnique({ where: { slug } });

  if (!cat) {
    const defaults = CATEGORY_DEFAULTS[slug] ?? {
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "#6366F1",
      description: "",
    };
    cat = await prisma.category.create({
      data: { slug, name: defaults.name, color: defaults.color, description: defaults.description },
    });
    console.log(`[Sourcing] Created category: ${cat.name}`);
  }

  return cat.id;
}

/**
 * Publishes an enriched article to the DB.
 * Returns the created article ID or null on failure.
 */
export async function publishArticle(
  enriched: EnrichedArticle,
  sourceUrl: string
): Promise<string | null> {
  try {
    const authorId = await ensureAgentBot();
    const categoryId = await ensureCategory(enriched.categorySlug);

    const article = await prisma.article.create({
      data: {
        title: enriched.title,
        slug: enriched.slug,
        excerpt: enriched.excerpt,
        content: enriched.content,
        coverImage: enriched.coverImage ?? null,
        published: true,
        featured: false,
        publishedAt: new Date(),
        authorId,
        categoryId,
        tags:
          enriched.tags.length > 0
            ? {
                connectOrCreate: enriched.tags.map((tag) => ({
                  where: { slug: tag.toLowerCase().replace(/\s+/g, "-") },
                  create: {
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, "-"),
                  },
                })),
              }
            : undefined,
      },
    });

    // Record in sourced_articles for dedup
    await prisma.sourcedArticle.update({
      where: { sourceUrl },
      data: { published: true, articleId: article.id },
    });

    return article.id;
  } catch (err) {
    console.error("[Sourcing] Failed to publish article:", (err as Error).message);
    return null;
  }
}
