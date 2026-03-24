import cron from "node-cron";
import { fetchAllFeeds, RawFeedItem } from "./fetcher";
import { enrichArticle } from "./enricher";
import { publishArticle, ensureAgentBot } from "./publisher";
import { prisma } from "../../utils/prisma";

let isRunning = false;
let lastRun: Date | null = null;
let lastRunStats: { fetched: number; new: number; published: number; skipped: number } | null = null;

/**
 * Core sourcing logic — fetches, deduplicates, enriches, and publishes.
 */
async function runSourcingCycle(): Promise<void> {
  if (isRunning) {
    console.log("[Sourcing] Cycle already in progress, skipping...");
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn("[Sourcing] OPENAI_API_KEY not set — sourcing engine disabled");
    return;
  }

  isRunning = true;
  const startedAt = new Date();
  const stats = { fetched: 0, new: 0, published: 0, skipped: 0 };

  try {
    console.log("\n[Sourcing] ─── Starting sourcing cycle ───");

    // 1. Fetch all feeds
    const rawItems = await fetchAllFeeds();
    stats.fetched = rawItems.length;

    // 2. Filter out already-seen URLs
    const seenUrls = new Set(
      (
        await prisma.sourcedArticle.findMany({
          where: { sourceUrl: { in: rawItems.map((i) => i.link) } },
          select: { sourceUrl: true },
        })
      ).map((r: { sourceUrl: string }) => r.sourceUrl)
    );

    const newItems: RawFeedItem[] = rawItems.filter((item) => !seenUrls.has(item.link));
    stats.new = newItems.length;
    stats.skipped = rawItems.length - newItems.length;

    console.log(
      `[Sourcing] ${stats.fetched} fetched | ${stats.new} new | ${stats.skipped} already seen`
    );

    if (newItems.length === 0) {
      console.log("[Sourcing] Nothing new to process.\n");
      return;
    }

    // 3. Register new URLs in sourced_articles immediately (prevents concurrent dupes)
    await prisma.sourcedArticle.createMany({
      data: newItems.map((item) => ({
        sourceUrl: item.link,
        sourceTitle: item.title,
        sourceName: item.source.name,
        published: false,
      })),
      skipDuplicates: true,
    });

    // 4. Process each new item: enrich + publish (sequential to be gentle on OpenAI rate limits)
    for (const item of newItems) {
      try {
        const enriched = await enrichArticle(item);

        if (!enriched) {
          // Not AI-related or enrichment failed
          continue;
        }

        const articleId = await publishArticle(enriched, item.link);

        if (articleId) {
          stats.published++;
          console.log(`[Sourcing] ✓ Published: "${enriched.title}"`);
        }

        // Small delay between OpenAI calls to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`[Sourcing] Error processing "${item.title}":`, (err as Error).message);
      }
    }

    lastRunStats = stats;
    lastRun = startedAt;
    console.log(
      `[Sourcing] ─── Cycle done | ${stats.published} published in ${
        Date.now() - startedAt.getTime()
      }ms ───\n`
    );
  } catch (err) {
    console.error("[Sourcing] Cycle error:", (err as Error).message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the sourcing scheduler.
 * Runs immediately on startup, then every 3 minutes.
 */
export async function startSourcingScheduler(): Promise<void> {
  console.log("[Sourcing] Initializing sourcing engine...");

  // Ensure AgentBot exists before first run
  try {
    await ensureAgentBot();
  } catch (err) {
    console.error("[Sourcing] Failed to create AgentBot user:", (err as Error).message);
    return;
  }

  // Run immediately on startup
  runSourcingCycle().catch(console.error);

  // Then every 3 minutes
  cron.schedule("*/3 * * * *", () => {
    runSourcingCycle().catch(console.error);
  });

  console.log("[Sourcing] Scheduler active — running every 3 minutes");
}

/**
 * Returns current sourcing engine status (used by status endpoint).
 */
export function getSourcingStatus() {
  return {
    active: true,
    isRunning,
    lastRun: lastRun?.toISOString() ?? null,
    lastRunStats,
    schedule: "every 3 minutes",
  };
}
