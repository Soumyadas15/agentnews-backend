import Parser from "rss-parser";
import { AI_FEEDS, FeedSource } from "./feeds";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AgentNews/1.0 (https://theagentnews.com; RSS sourcing bot)",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

export interface RawFeedItem {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  pubDate: string | undefined;
  source: FeedSource;
  imageUrl?: string;
}

function extractImage(item: Record<string, unknown>): string | undefined {
  // Try various image fields that different feeds use
  const mediaContent = item["mediaContent"] as Record<string, unknown> | undefined;
  if (mediaContent?.["$"] && (mediaContent["$"] as Record<string, string>)?.["url"]) {
    return (mediaContent["$"] as Record<string, string>)["url"];
  }

  const mediaThumbnail = item["mediaThumbnail"] as Record<string, unknown> | undefined;
  if (mediaThumbnail?.["$"] && (mediaThumbnail["$"] as Record<string, string>)?.["url"]) {
    return (mediaThumbnail["$"] as Record<string, string>)["url"];
  }

  const enclosure = item["enclosure"] as Record<string, string> | undefined;
  if (enclosure?.url && enclosure?.type?.startsWith("image/")) {
    return enclosure.url;
  }

  // Try scraping og:image from content HTML
  const content = (item["content"] as string) || (item["contentSnippet"] as string) || "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return undefined;
}

export async function fetchFeed(source: FeedSource): Promise<RawFeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return feed.items
      .filter((item) => item.title && item.link)
      .slice(0, 10) // Max 10 items per feed per run
      .map((item) => {
        const raw = item as unknown as Record<string, unknown>;
        return {
          title: item.title!,
          link: item.link!,
          content: (raw["content:encoded"] as string) || item.content || item.contentSnippet || "",
          contentSnippet: item.contentSnippet || "",
          pubDate: item.pubDate,
          source,
          imageUrl: extractImage(raw),
        };
      });
  } catch (err) {
    console.error(`[Sourcing] Failed to fetch feed ${source.name}:`, (err as Error).message);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<RawFeedItem[]> {
  const results = await Promise.allSettled(AI_FEEDS.map(fetchFeed));

  const items: RawFeedItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  console.log(`[Sourcing] Fetched ${items.length} raw items from ${AI_FEEDS.length} feeds`);
  return items;
}
