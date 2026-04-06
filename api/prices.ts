// This runs on Vercel's servers — NOT in the browser.
// It receives a product name + brand, searches Google Shopping
// via SerpAPI, and returns real retailer prices with direct links.

export const config = {
  maxDuration: 15,
};

// Extract the real destination URL from a Google redirect/tracking link
function extractDirectUrl(url: string): string {
  if (!url) return "";

  // If it's already a direct retailer URL (not google.com), use it as-is
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("google.com") && !parsed.hostname.includes("google.co")) {
      return url;
    }
  } catch {
    return url;
  }

  // Try to extract the real URL from Google redirect patterns:
  // Pattern 1: /url?url=https://retailer.com/...
  // Pattern 2: /aclk?...&adurl=https://retailer.com/...
  // Pattern 3: /url?q=https://retailer.com/...
  try {
    const parsed = new URL(url);
    const destination =
      parsed.searchParams.get("url") ||
      parsed.searchParams.get("adurl") ||
      parsed.searchParams.get("q");

    if (destination && destination.startsWith("http")) {
      return destination;
    }
  } catch {
    // Not a valid URL, return as-is
  }

  return url;
}

// Filter out prices that are anomalous (too low, or extreme outliers)
function filterAnomalousPrices(results: any[]): any[] {
  // Remove anything under $1 — bad data
  const valid = results.filter((r) => r.price_num >= 1);

  if (valid.length < 2) return valid;

  // Find the median price to detect outliers
  const sorted = valid.map((r) => r.price_num).sort((a: number, b: number) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Keep results within a reasonable range of the median:
  // no less than 20% of median (suspiciously cheap)
  // no more than 5x median (suspiciously expensive or wrong product)
  const floor = median * 0.2;
  const ceiling = median * 5;

  return valid.filter((r) => r.price_num >= floor && r.price_num <= ceiling);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { brand, name } = req.body;

  if (!brand || !name) {
    return res.status(400).json({ error: "Brand and name required" });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SerpAPI key not configured" });
  }

  try {
    const query = encodeURIComponent(`${brand} ${name} buy`);
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&api_key=${apiKey}&num=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("SerpAPI error:", JSON.stringify(data));
      return res.status(500).json({ error: "Price search failed" });
    }

    // Extract shopping results — resolve direct retailer URLs from Google tracking links
    const rawResults = (data.shopping_results || []).map((item: any) => {
      // SerpAPI returns `link` (often a Google tracking URL) and sometimes
      // `product_link` (Google Shopping detail page). Extract the real retailer URL.
      const directLink = extractDirectUrl(item.link || "") || extractDirectUrl(item.product_link || "");

      return {
        retailer: item.source || "Unknown",
        title: item.title || "",
        price: item.price || "N/A",
        price_num: item.extracted_price || 0,
        link: directLink,
        thumbnail: item.thumbnail || null,
      };
    });

    // Filter: must have a usable link
    const withLinks = rawResults.filter((r: any) => r.link);

    // Filter: remove anomalous prices (bad data, wrong product, etc.)
    const validated = filterAnomalousPrices(withLinks);

    // Deduplicate by retailer — keep the cheapest from each store
    const byRetailer = new Map<string, any>();
    for (const r of validated) {
      const key = r.retailer.toLowerCase();
      if (!byRetailer.has(key) || r.price_num < byRetailer.get(key).price_num) {
        byRetailer.set(key, r);
      }
    }
    const deduped = Array.from(byRetailer.values());

    // Sort by price (lowest first), take top 5, tag the best
    deduped.sort((a: any, b: any) => a.price_num - b.price_num);
    const results = deduped.slice(0, 5);
    if (results.length > 0) {
      results[0].tag = "Best Price";
    }

    return res.status(200).json({ retailers: results });
  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
