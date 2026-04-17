// Price lookup with DIRECT retailer links.
// Strategy:
// 1) Google Shopping → get prices + retailer names
// 2) Google Product API (via product_id) → get direct seller links
// 3) Fallback: organic Google search → always has direct URLs
// Never return Google tracking/redirect links.

export const config = {
  maxDuration: 15,
};

function filterAnomalousPrices(results: any[]): any[] {
  const valid = results.filter((r) => r.price_num >= 1);
  if (valid.length < 2) return valid;

  const sorted = valid.map((r) => r.price_num).sort((a: number, b: number) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return valid.filter((r) => r.price_num >= median * 0.2 && r.price_num <= median * 5);
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

// Blocklist: used/resale/auction sites that cheapen the experience
const BLOCKED_DOMAINS = [
  "ebay.", "poshmark.", "mercari.", "depop.", "thredup.",
  "therealreal.", "vestiaire.", "grailed.", "stockx.",
  "offerup.", "craigslist.", "facebook.com/marketplace",
  "tradesy.", "rebag.", "luxedh.", "fashionphile.",
];

// Check if a URL is a real retailer link (not Google or a resale site)
function isDirectLink(url: string): boolean {
  if (!url) return false;
  try {
    const lower = url.toLowerCase();
    const host = new URL(url).hostname;
    if (host.includes("google.com") || host.includes("google.co.")) return false;
    // Block used/resale/auction sites
    if (BLOCKED_DOMAINS.some((d) => lower.includes(d))) return false;
    return true;
  } catch {
    return false;
  }
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

    // ── Fire Google Shopping + Organic search IN PARALLEL ──
    // Shopping gives us pricing data; Organic gives direct retailer URLs.
    // Dropped the google_product loop (up to 3 sequential calls) — rarely
    // returned sellers and was the biggest latency hit.
    const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(rawQuery)}&api_key=${apiKey}&gl=us&hl=en&num=5`;
    const organicUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(rawQuery + " buy")}&api_key=${apiKey}&gl=us&hl=en&num=10`;

    const [shoppingRes, organicRes] = await Promise.all([
      fetch(shoppingUrl),
      fetch(organicUrl),
    ]);

    const [shoppingData, organicData] = await Promise.all([
      shoppingRes.json(),
      organicRes.json().catch(() => ({})),
    ]);

    if (!shoppingRes.ok) {
      console.error("[prices] Shopping API error:", shoppingData?.error);
      return res.status(500).json({ error: "Price search failed" });
    }

    const shoppingResults = shoppingData.shopping_results || [];
    console.log(`[prices] Shopping: ${shoppingResults.length} results for "${rawQuery}"`);

    // ── Primary: shopping results always have prices — use them directly ──
    // Build a map of retailer → best organic link (to upgrade tracking URLs where possible)
    const organicLinkByRetailer = new Map<string, string>();
    if (organicRes.ok) {
      const organicResults = organicData.organic_results || [];
      for (const result of organicResults) {
        if (!isDirectLink(result.link)) continue;
        try {
          const host = new URL(result.link).hostname.replace("www.", "");
          const retailerName = host.split(".")[0].toLowerCase();
          if (!organicLinkByRetailer.has(retailerName)) {
            organicLinkByRetailer.set(retailerName, result.link);
          }
        } catch { continue; }
      }
    }

    // Build results from shopping data (guaranteed to have prices)
    const results: any[] = [];
    for (const item of shoppingResults) {
      const priceNum = item.extracted_price || 0;
      if (priceNum <= 0) continue; // skip items with no price

      const source = (item.source || "Unknown").trim();
      const retailerKey = source.toLowerCase().replace(/\s+/g, "");

      // Try to find a better direct link from organic results
      const organicLink = organicLinkByRetailer.get(retailerKey) ||
                          organicLinkByRetailer.get(source.toLowerCase());
      const link = organicLink || item.link || "";

      // Skip if we have no usable link at all
      if (!link || !isDirectLink(link)) continue;

      results.push({
        retailer: source,
        title: item.title || "",
        price: item.price || `$${priceNum}`,
        price_num: priceNum,
        link,
        thumbnail: item.thumbnail || null,
      });
    }

    console.log(`[prices] ${results.length} results with real prices`);

    // Filter: must have a usable link AND a real price
    const withLinks = results.filter((r: any) => r.link && isDirectLink(r.link) && r.price_num > 0);

    // Filter: remove anomalous prices
    const validated = withLinks.length >= 2 ? filterAnomalousPrices(withLinks) : withLinks;

    // Deduplicate by retailer domain
    const byRetailer = new Map<string, any>();
    for (const r of validated) {
      const key = r.retailer.toLowerCase().replace(/\.com$/, "").trim();
      if (!byRetailer.has(key) || r.price_num < byRetailer.get(key).price_num) {
        byRetailer.set(key, r);
      }
    }
    const deduped = Array.from(byRetailer.values());

    // Sort by price (lowest first), take top 5, tag the best
    deduped.sort((a: any, b: any) => a.price_num - b.price_num);

    const final = deduped.slice(0, 5);
    if (final.length > 0) {
      final[0].tag = "Best Price";
    }

    return res.status(200).json({ retailers: final });
  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
