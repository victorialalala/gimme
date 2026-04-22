export const config = {
  maxDuration: 15,
};

const BLOCKED_DOMAINS = [
  "ebay.", "poshmark.", "mercari.", "depop.", "thredup.",
  "therealreal.", "vestiaire.", "grailed.", "stockx.",
  "offerup.", "craigslist.", "facebook.com/marketplace",
  "tradesy.", "rebag.", "luxedh.", "fashionphile.",
  // Risky / high-variance marketplaces and grey-market sellers
  "senser.", "dhgate.", "aliexpress.", "alibaba.", "joom.",
  "wish.com", "temu.", "shein.",
];

// Common words that aren't distinctive enough to match on their own
const GENERIC_TOKENS = new Set([
  "mini", "small", "medium", "large", "leather", "saffiano",
  "bag", "purse", "tote", "handbag", "wallet", "crossbody",
  "shoulder", "with", "from", "the", "and", "women", "womens",
  "ladies", "new", "style", "brand",
]);

function normalize(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

function isBlocked(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => lower.includes(d));
}

function isBlockedSource(source: string): boolean {
  if (!source) return false;
  const lower = source.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => lower.includes(d.replace(".", "")));
}

// Must match brand AND at least one distinctive token from the product name
// (so "Prada Saffiano Mini-Bag" doesn't match an "Arqué" search).
function matchesProduct(title: string, brand: string, productName: string): boolean {
  const titleNorm = normalize(title);

  const brandNorm = normalize(brand);
  if (brandNorm.length > 2 && !titleNorm.includes(brandNorm)) return false;

  const nameNorm = normalize(productName);
  if (nameNorm.length > 2) {
    const tokens = nameNorm
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !GENERIC_TOKENS.has(t));
    if (tokens.length > 0) {
      const anyMatch = tokens.some((t) => titleNorm.includes(t));
      if (!anyMatch) return false;
    }
  }

  return true;
}

type Retailer = {
  retailer: string;
  title: string;
  price: string;
  price_num: number;
  link: string;
  thumbnail: string | null;
  tag?: string;
};

// Drop outlier-low prices that signal counterfeit / scam sellers.
function filterScamPrices(rs: Retailer[]): Retailer[] {
  if (rs.length < 3) return rs;
  const sorted = rs.map((r) => r.price_num).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const threshold = median * 0.4;
  return rs.filter((r) => r.price_num >= threshold);
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

    // Step 1: google_shopping to find candidates
    const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(rawQuery)}&api_key=${apiKey}&gl=us&hl=en&num=10`;
    const shoppingRes = await fetch(shoppingUrl, { signal: AbortSignal.timeout(7000) });
    const shoppingData = await shoppingRes.json();

    if (!shoppingRes.ok) {
      console.error("[prices] Shopping API error:", shoppingData?.error);
      return res.status(500).json({ error: "Price search failed" });
    }

    const shoppingResults = shoppingData.shopping_results || [];
    console.log(`[prices] ${shoppingResults.length} shopping results for "${rawQuery}"`);

    // Keep only results that match brand + distinctive product name tokens
    const matched = shoppingResults.filter((r: any) =>
      matchesProduct(r.title || "", brand || "", name || "")
    );
    console.log(`[prices] ${matched.length} matched after product filter`);

    if (matched.length === 0) {
      return res.status(200).json({ retailers: [] });
    }

    // Step 2: try google_product on the top match for direct retailer URLs.
    // Aggressive 5s timeout — if it's slow, fall back to shopping results.
    const topMatch = matched.find((r: any) => r.product_id);
    const retailerMap = new Map<string, Retailer>();

    if (topMatch?.product_id) {
      try {
        const productUrl = `https://serpapi.com/search.json?engine=google_product&product_id=${encodeURIComponent(topMatch.product_id)}&api_key=${apiKey}&gl=us&hl=en&offers=1`;
        const productRes = await fetch(productUrl, { signal: AbortSignal.timeout(5000) });
        const productData = await productRes.json();
        const sellers = productData?.sellers_results?.online_sellers || [];
        console.log(`[prices] ${sellers.length} sellers via google_product`);

        for (const s of sellers) {
          const sName = (s.name || "").trim();
          const link = s.link || "";
          if (!sName || !link) continue;
          if (isBlocked(link) || isBlockedSource(sName)) continue;

          const priceStr = s.total_price || s.base_price || "";
          const priceNum =
            s.extracted_total_price ||
            s.extracted_base_price ||
            parsePrice(priceStr);
          if (priceNum <= 0) continue;

          const key = sName.toLowerCase();
          const entry: Retailer = {
            retailer: sName,
            title: topMatch.title || "",
            price: priceStr || `$${priceNum}`,
            price_num: priceNum,
            link,
            thumbnail: topMatch.thumbnail || null,
          };
          if (!retailerMap.has(key) || priceNum < retailerMap.get(key)!.price_num) {
            retailerMap.set(key, entry);
          }
        }
      } catch (err: any) {
        console.warn("[prices] google_product skipped:", err?.message || err);
      }
    }

    // Fallback: if google_product yielded nothing, use the matched shopping
    // results (still better than nothing, even though links are Google-hosted).
    if (retailerMap.size === 0) {
      for (const item of matched) {
        const priceNum = item.extracted_price || parsePrice(item.price || "");
        if (priceNum <= 0) continue;

        const source = (item.source || "").trim();
        if (!source) continue;
        if (isBlocked(item.link || "") || isBlockedSource(source)) continue;

        const link = item.link || item.product_link || "";
        if (!link) continue;

        const key = source.toLowerCase();
        const entry: Retailer = {
          retailer: source,
          title: item.title || "",
          price: item.price || `$${priceNum}`,
          price_num: priceNum,
          link,
          thumbnail: item.thumbnail || null,
        };
        if (!retailerMap.has(key) || priceNum < retailerMap.get(key)!.price_num) {
          retailerMap.set(key, entry);
        }
      }
    }

    let results = Array.from(retailerMap.values()).sort((a, b) => a.price_num - b.price_num);
    results = filterScamPrices(results).slice(0, 5);
    if (results.length > 0) results[0].tag = "Best Price";

    console.log(`[prices] Returning ${results.length} retailers`);
    return res.status(200).json({ retailers: results });

  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
