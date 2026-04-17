export const config = {
  maxDuration: 15,
};

const BLOCKED_DOMAINS = [
  "ebay.", "poshmark.", "mercari.", "depop.", "thredup.",
  "therealreal.", "vestiaire.", "grailed.", "stockx.",
  "offerup.", "craigslist.", "tradesy.", "rebag.",
];

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

function isBlocked(url: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => lower.includes(d));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { brand, name, model, search_query } = req.body;

  if (!brand && !name && !search_query) {
    return res.status(400).json({ error: "Brand, name, or search_query required" });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SerpAPI key not configured" });
  }

  try {
    const rawQuery = search_query || [brand, name, model].filter(Boolean).join(" ");

    const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(rawQuery)}&api_key=${apiKey}&gl=us&hl=en&num=10`;

    const shoppingRes = await fetch(shoppingUrl);
    const shoppingData = await shoppingRes.json();

    if (!shoppingRes.ok) {
      console.error("[prices] Shopping API error:", shoppingData?.error);
      return res.status(500).json({ error: "Price search failed" });
    }

    const shoppingResults = shoppingData.shopping_results || [];
    console.log(`[prices] ${shoppingResults.length} shopping results for "${rawQuery}"`);

    // Build results directly from shopping data
    const seen = new Map<string, any>(); // dedupe by retailer name

    for (const item of shoppingResults) {
      const priceNum = item.extracted_price || parsePrice(item.price || "");
      if (priceNum <= 0) continue;

      const source = (item.source || "").trim();
      if (!source) continue;
      if (item.link && isBlocked(item.link)) continue;

      const key = source.toLowerCase();

      // Keep lowest price per retailer
      if (!seen.has(key) || priceNum < seen.get(key).price_num) {
        seen.set(key, {
          retailer: source,
          title: item.title || "",
          price: item.price || `$${priceNum}`,
          price_num: priceNum,
          link: item.link || "",
          thumbnail: item.thumbnail || null,
        });
      }
    }

    // Sort by price, take top 5
    const results = Array.from(seen.values())
      .sort((a, b) => a.price_num - b.price_num)
      .slice(0, 5);

    if (results.length > 0) {
      results[0].tag = "Best Price";
    }

    console.log(`[prices] Returning ${results.length} retailers`);
    return res.status(200).json({ retailers: results });

  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
