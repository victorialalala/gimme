export const config = {
  maxDuration: 20,
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

function isGoogleLink(url: string): boolean {
  if (!url) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "google.com" || host.endsWith(".google.com");
  } catch {
    return false;
  }
}

// Google click/redirect URLs embed the real destination in a query param.
// Pull it out so the user lands on the actual retailer, not a Google page.
function extractDirectUrl(link: string | undefined): string | null {
  if (!link) return null;
  if (!isGoogleLink(link)) return link;
  try {
    const u = new URL(link);
    const candidates = ["adurl", "url", "q", "dest", "destination"];
    for (const p of candidates) {
      const v = u.searchParams.get(p);
      if (v && /^https?:\/\//i.test(v) && !isGoogleLink(v)) return v;
    }
  } catch {}
  return null;
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
// If >=3 results, anything below 40% of the median gets filtered out.
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
    const brandLower = (brand || "").toLowerCase().trim();

    // Fast path: single google_shopping call, extract direct retailer URLs
    // from Google redirect links.
    const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(rawQuery)}&api_key=${apiKey}&gl=us&hl=en&num=10`;
    const shoppingRes = await fetch(shoppingUrl, { signal: AbortSignal.timeout(8000) });
    const shoppingData = await shoppingRes.json();

    if (!shoppingRes.ok) {
      console.error("[prices] Shopping API error:", shoppingData?.error);
      return res.status(500).json({ error: "Price search failed" });
    }

    const shoppingResults = shoppingData.shopping_results || [];
    console.log(`[prices] ${shoppingResults.length} shopping results for "${rawQuery}"`);

    const seen = new Map<string, Retailer>();

    for (const item of shoppingResults) {
      const priceNum = item.extracted_price || parsePrice(item.price || "");
      if (priceNum <= 0) continue;

      const source = (item.source || "").trim();
      if (!source) continue;
      if (isBlockedSource(source)) continue;

      // Brand sanity check: if we know the brand, skip results whose title
      // doesn't mention it.
      if (brandLower.length > 2) {
        const titleLower = (item.title || "").toLowerCase();
        if (!titleLower.includes(brandLower)) continue;
      }

      // Extract a direct retailer URL. Skip the result if we can't.
      const direct =
        extractDirectUrl(item.link) ||
        extractDirectUrl(item.product_link);
      if (!direct) continue;
      if (isBlocked(direct)) continue;

      const key = source.toLowerCase();
      const entry: Retailer = {
        retailer: source,
        title: item.title || "",
        price: item.price || `$${priceNum}`,
        price_num: priceNum,
        link: direct,
        thumbnail: item.thumbnail || null,
      };
      if (!seen.has(key) || priceNum < seen.get(key)!.price_num) {
        seen.set(key, entry);
      }
    }

    let results = Array.from(seen.values()).sort((a, b) => a.price_num - b.price_num);

    // If fast path produced <2 usable retailers, fall back to google_product
    // engine which returns explicit sellers with direct URLs.
    if (results.length < 2) {
      const topMatch = shoppingResults.find((r: any) => {
        if (!r.product_id) return false;
        if (brandLower.length > 2) {
          const titleLower = (r.title || "").toLowerCase();
          if (!titleLower.includes(brandLower)) return false;
        }
        return true;
      });

      if (topMatch?.product_id) {
        try {
          const productUrl = `https://serpapi.com/search.json?engine=google_product&product_id=${encodeURIComponent(topMatch.product_id)}&api_key=${apiKey}&gl=us&hl=en&offers=1`;
          const productRes = await fetch(productUrl, { signal: AbortSignal.timeout(8000) });
          const productData = await productRes.json();
          const onlineSellers = productData?.sellers_results?.online_sellers || [];
          console.log(`[prices] ${onlineSellers.length} sellers for product ${topMatch.product_id}`);

          for (const s of onlineSellers) {
            const sName = (s.name || "").trim();
            const link = s.link || "";
            if (!sName || !link) continue;
            if (isGoogleLink(link)) continue;
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
            if (!seen.has(key) || priceNum < seen.get(key)!.price_num) {
              seen.set(key, entry);
            }
          }
          results = Array.from(seen.values()).sort((a, b) => a.price_num - b.price_num);
        } catch (err: any) {
          console.warn("[prices] google_product fallback failed:", err?.message || err);
        }
      }
    }

    results = filterScamPrices(results).slice(0, 5);
    if (results.length > 0) results[0].tag = "Best Price";

    console.log(`[prices] Returning ${results.length} retailers`);
    return res.status(200).json({ retailers: results });

  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
