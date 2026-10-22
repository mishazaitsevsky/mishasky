import type { MetadataRoute } from "next";

// AI model-training crawlers: blocked. This only asks — major companies honor it.
// Search engines and AI answer agents (ChatGPT/Perplexity/Claude fetching a page
// to answer someone's question, with a link back) stay allowed.
const AI_TRAINING_CRAWLERS = [
  "GPTBot",             // OpenAI training
  "ClaudeBot",          // Anthropic training
  "Google-Extended",    // Gemini training (doesn't affect Google Search)
  "Applebot-Extended",  // Apple AI training
  "CCBot",              // Common Crawl (feeds many models)
  "meta-externalagent", // Meta AI training
  "Bytespider",         // ByteDance
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_TRAINING_CRAWLERS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: "https://mishasky.net/sitemap.xml",
  };
}
