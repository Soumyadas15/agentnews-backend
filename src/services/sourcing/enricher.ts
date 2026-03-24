import OpenAI from "openai";
import { RawFeedItem } from "./fetcher";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EnrichedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Full HTML-formatted article body
  tags: string[];
  categorySlug: string;
  coverImage?: string;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "llm", "gpt", "claude",
  "gemini", "neural", "model", "agent", "chatbot", "automation", "openai",
  "anthropic", "deepmind", "transformer", "diffusion", "generative",
];

function isAIRelated(item: RawFeedItem): boolean {
  const text = `${item.title} ${item.contentSnippet}`.toLowerCase();
  return AI_KEYWORDS.some((kw) => text.includes(kw));
}

export async function enrichArticle(item: RawFeedItem): Promise<EnrichedArticle | null> {
  // Filter out non-AI articles (especially from broad tech feeds)
  if (!isAIRelated(item)) {
    return null;
  }

  const sourceText = item.content || item.contentSnippet;
  const prompt = `You are a journalist for AgentNews — a premium news site covering AI and its advancements.

Given this raw article from "${item.source.name}", rewrite it as a polished AgentNews article.

Original title: ${item.title}
Source: ${item.link}
Raw content:
${sourceText.slice(0, 3000)}

Respond with ONLY valid JSON (no markdown, no code block) in this exact shape:
{
  "title": "A compelling, clear headline (max 80 chars)",
  "excerpt": "A punchy 1-2 sentence summary that hooks the reader (max 200 chars)",
  "content": "Full article body in HTML (use <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em> tags). Min 300 words. Write original editorial prose — do NOT just restate the source verbatim. Add context, implications, and analysis for an AI-savvy audience.",
  "tags": ["tag1", "tag2", "tag3"],
  "categorySlug": "one of: artificial-intelligence | research | industry | products | policy"
}

Rules:
- Tags should be 2-5 specific, lowercase terms (e.g. "gpt-4o", "openai", "multimodal")
- Pick the most fitting categorySlug
- Write for an informed AI audience — be smart, not dumbed down
- Do NOT include phrases like "according to the source" or "the original article"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as {
      title: string;
      excerpt: string;
      content: string;
      tags: string[];
      categorySlug: string;
    };

    // Validate required fields
    if (!parsed.title || !parsed.excerpt || !parsed.content) {
      console.error("[Sourcing] AI returned incomplete article for:", item.title);
      return null;
    }

    return {
      title: parsed.title,
      slug: toSlug(parsed.title) + "-" + Date.now(),
      excerpt: parsed.excerpt.slice(0, 200),
      content: parsed.content,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      categorySlug: parsed.categorySlug || item.source.category,
      coverImage: item.imageUrl,
    };
  } catch (err) {
    console.error("[Sourcing] Enrichment failed for:", item.title, (err as Error).message);
    return null;
  }
}
