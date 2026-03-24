// ── AI News RSS Feed Sources ─────────────────────────────────────────────────
// All feeds are focused on AI, ML, and tech advancement topics.

export interface FeedSource {
  name: string;
  url: string;
  category: string; // Maps to AgentNews category slug
}

export const AI_FEEDS: FeedSource[] = [
  // General AI / LLMs
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "artificial-intelligence",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    category: "artificial-intelligence",
  },
  {
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    category: "artificial-intelligence",
  },
  {
    name: "Ars Technica AI",
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "artificial-intelligence",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    category: "research",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.research.google/atom.xml",
    category: "research",
  },
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    category: "artificial-intelligence",
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    category: "research",
  },
  {
    name: "DeepMind Blog",
    url: "https://deepmind.google/blog/rss.xml",
    category: "research",
  },
  {
    name: "WIRED AI",
    url: "https://www.wired.com/feed/tag/artificial-intelligence/latest/rss",
    category: "artificial-intelligence",
  },
];
