// Price lookup with DIRECT retailer links.
// Strategy:
// 1) Google Shopping → get prices + retailer names
// 2) Google Product API (via product_id) → get direct seller links
// 3) Fallback: organic Google search → always has direct URLs
// Never return Google tracking/redirect links.

export const config = {
  maxDuration: 25,
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

// Check if a URL is a real retailer link (not a Google redirect)
function isDirectLink(url: string): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return !host.includes("google.com") && !host.includes("google.co.");
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

    // ── Step 1: Google Shopping search for prices + product IDs ──
    const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(rawQuery)}&api_key=${apiKey}&gl=us&hl=en&num=5`;

    const shoppingRes = await fetch(shoppingUrl);
    const shoppingData = await shoppingRes.json();

    if (!shoppingRes.ok) {
      console.error("[prices] Shopping API error:", shoppingData?.error);
      return res.status(500).json({ error: "Price search failed" });
    }

    const shoppingResults = shoppingData.shopping_results || [];
    console.log(`[prices] Shopping found ${shoppingResults.length} results for "${rawQuery}"`);

    if (shoppingResults.length === 0) {
      return res.status(200).json({ retailers: [] });
    }

    // ── Step 2: Try Google Product API for direct seller links ──
    let directSellers: any[] = [];

    for (const item of shoppingResults.slice(0, 3)) {
      if (!item.product_id) {
        console.log(`[prices] No product_id on result: "${item.title}"`);
        continue;
      }

      try {
        const productUrl = `https://serpapi.com/search.json?engine=google_product&product_id=${item.product_id}&api_key=${apiKey}&gl=us&hl=en`;
        console.log(`[prices] Trying product_id: ${item.product_id}`);

        const productRes = await fetch(productUrl);
        const productData = await productRes.json();

        if (!productRes.ok) {
          console.log(`[prices] Product API returned ${productRes.status}: ${productData?.error}`);
          continue;
        }

        // Try multiple paths — SerpAPI response format varies
        const sellers =
          productData.sellers_results?.online_sellers ||
          productData.sellers_results?.sellers ||
          productData.online_sellers ||
          [];

        console.log(`[prices] Product API returned ${sellers.length} sellers (keys: ${Object.keys(productData.sellers_results || {}).join(", ") || "none"})`);

        if (sellers.length > 0) {
          directSellers = sellers;
          break;
        }
      } catch (err: any) {
        console.error(`[prices] Product API error: ${err?.message}`);
        continue;
      }
    }

    let results: any[] = [];

    if (directSellers.length > 0) {
      // ── Path A: Direct seller links from Google Product API ──
      console.log(`[prices] Using ${directSellers.length} direct sellers`);
      results = directSellers
        .filter((s: any) => isDirectLink(s.link))
        .map((seller: any) => ({
          retailer: seller.name || "Unknown",
          title: seller.title || "",
          price: seller.base_price || seller.total_price || "N/A",
          price_num: parsePrice(seller.base_price || seller.total_price || ""),
          link: seller.link,
          thumbnail: null,
        }));
    }

    // ── Path B: Fallback — use organic Google search for direct links ──
    // Organic search results ALWAYS have direct retailer URLs
    if (results.length === 0) {
      console.log("[prices] Falling back to organic Google search");

      const organicUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(rawQuery + " buy")}&api_key=${apiKey}&gl=us&hl=en&num=10`;
      const organicRes = await fetch(organicUrl);
      const organicData = await organicRes.json();

      if (organicRes.ok) {
        const organicResults = organicData.organic_results || [];
        console.log(`[prices] Organic search returned ${organicResults.length} results`);

        // Also check inline shopping results from organic search
        const inlineShopping = organicData.inline_shopping_results || organicData.shopping_results || [];

        // Build a price lookup from the shopping results we already have
        const priceByRetailer = new Map<string, { price: string; price_num: number }>();
        for (const item of shoppingResults) {
          const retailer = (item.source || "").toLowerCase();
          if (retailer) {
            priceByRetailer.set(retailer, {
              price: item.price || "N/A",
              price_num: item.extracted_price || 0,
            });
          }
        }

        // Extract direct links from organic results — filter to product/shop pages
        for (const result of organicResults) {
          if (!isDirectLink(result.link)) continue;

          // Skip non-retail pages (blogs, reviews, articles)
          const url = result.link.toLowerCase();
          const isLikelyShop =
            url.includes("/product") ||
            url.includes("/shop") ||
            url.includes("/buy") ||
            url.includes("/p/") ||
            url.includes("/dp/") ||
            url.includes("/item") ||
            url.includes("/collections/") ||
            url.includes("amazon.") ||
            url.includes("nordstrom.") ||
            url.includes("sephora.") ||
            url.includes("bloomingdales.") ||
            url.includes("saks.") ||
            url.includes("net-a-porter.") ||
            url.includes("ssense.") ||
            url.includes("farfetch.") ||
            url.includes("shopbop.") ||
            url.includes("macys.") ||
            url.includes("target.") ||
            url.includes("walmart.") ||
            url.includes("ebay.") ||
            url.includes("etsy.") ||
            url.includes("diptyque.") ||
            url.includes("byredo.") ||
            url.includes("nike.") ||
            url.includes("adidas.") ||
            url.includes("apple.") ||
            url.includes("bestbuy.");

          if (!isLikelyShop) continue;

          // Extract retailer name from domain
          try {
            const host = new URL(result.link).hostname.replace("www.", "");
            const retailerName = host.split(".")[0];
            const displayName = retailerName.charAt(0).toUpperCase() + retailerName.slice(1);

            // Try to match price from shopping results
            const priceInfo = priceByRetailer.get(retailerName) ||
                              priceByRetailer.get(displayName.toLowerCase());

            // Extract price from snippet if available
            let price = priceInfo?.price || "See price";
            let priceNum = priceInfo?.price_num || 0;

            // Check if organic result has a price in its snippet
            const snippetPrice = (result.snippet || "").match(/\$[\d,]+\.?\d*/);
            if (snippetPrice && !priceInfo) {
              price = snippetPrice[0];
              priceNum = parsePrice(snippetPrice[0]);
            }

            results.push({
              retailer: displayName,
              title: result.title || "",
              price,
              price_num: priceNum,
              link: result.link,
              thumbnail: null,
            });
          } catch {
            continue;
          }
        }

        console.log(`[prices] Found ${results.length} direct retailer links from organic search`);
      }
    }

    // ── Path C: Last resort — shopping results with price data but check for any direct links ──
    if (results.length === 0) {
      console.log("[prices] Last resort: checking shopping results for any direct links");
      for (const item of shoppingResults) {
        const link = item.link || "";
        if (isDirectLink(link)) {
          results.push({
            retailer: item.source || "Unknown",
            title: item.title || "",
            price: item.price || "N/A",
            price_num: item.extracted_price || 0,
            link,
            thumbnail: item.thumbnail || null,
          });
        }
      }
    }

    // Filter: must have a usable link
    const withLinks = results.filter((r: any) => r.link && isDirectLink(r.link));

    // Filter: remove anomalous prices (only if we have price data)
    const withPrices = withLinks.filter((r: any) => r.price_num > 0);
    const validated = withPrices.length >= 2 ? filterAnomalousPrices(withPrices) : withLinks;

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
    deduped.sort((a: any, b: any) => {
      // Put "See price" items last
      if (a.price_num === 0 && b.price_num > 0) return 1;
      if (b.price_num === 0 && a.price_num > 0) return -1;
      return a.price_num - b.price_num;
    });

    const final = deduped.slice(0, 5);
    if (final.length > 0 && final[0].price_num > 0) {
      final[0].tag = "Best Price";
    }

    return res.status(200).json({ retailers: final });
  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
