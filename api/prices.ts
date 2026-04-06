// Two-step price lookup for DIRECT retailer links:
// 1) Google Shopping search → find product_id
// 2) Google Product API → get actual seller links (diptyque.com, nordstrom.com, etc.)
// This is the only reliable way to get direct URLs — Google Shopping search
// results always use Google tracking redirects.

export const config = {
  maxDuration: 15,
};

// Filter out prices that are anomalous (too low, or extreme outliers)
function filterAnomalousPrices(results: any[]): any[] {
  const valid = results.filter((r) => r.price_num >= 1);
  if (valid.length < 2) return valid;

  const sorted = valid.map((r) => r.price_num).sort((a: number, b: number) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const floor = median * 0.2;
  const ceiling = median * 5;

  return valid.filter((r) => r.price_num >= floor && r.price_num <= ceiling);
}

// Parse a price string like "$68.00" into a number
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
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
    // ── Step 1: Google Shopping search to find the product ──
    const rawQuery = search_query || [brand, name, model].filter(Boolean).join(" ");
    const query = encodeURIComponent(rawQuery);
    const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&api_key=${apiKey}&num=5`;

    const shoppingRes = await fetch(shoppingUrl);
    const shoppingData = await shoppingRes.json();

    if (!shoppingRes.ok) {
      console.error("SerpAPI shopping error:", JSON.stringify(shoppingData));
      return res.status(500).json({ error: "Price search failed" });
    }

    const shoppingResults = shoppingData.shopping_results || [];

    if (shoppingResults.length === 0) {
      return res.status(200).json({ retailers: [] });
    }

    // ── Step 2: Use product_id to get DIRECT seller links ──
    // Try to find a product_id from the top results
    let sellerResults: any[] = [];

    for (const item of shoppingResults.slice(0, 3)) {
      const productId = item.product_id;
      if (!productId) continue;

      try {
        const productUrl = `https://serpapi.com/search.json?engine=google_product&product_id=${productId}&api_key=${apiKey}`;
        const productRes = await fetch(productUrl);
        const productData = await productRes.json();

        if (!productRes.ok) continue;

        // online_sellers has the DIRECT retailer links
        const sellers = productData.sellers_results?.online_sellers || [];

        if (sellers.length > 0) {
          sellerResults = sellers;
          console.log(`[prices] Found ${sellers.length} direct sellers via product_id ${productId}`);
          break; // Got good results, stop trying more product IDs
        }
      } catch (err) {
        console.error("Product API error:", err);
        continue;
      }
    }

    let results: any[];

    if (sellerResults.length > 0) {
      // ── Best path: direct seller links from Google Product API ──
      results = sellerResults.map((seller: any) => ({
        retailer: seller.name || "Unknown",
        title: seller.title || "",
        price: seller.base_price || seller.total_price || "N/A",
        price_num: parsePrice(seller.base_price || seller.total_price || ""),
        link: seller.link || "", // This is the REAL direct retailer URL
        thumbnail: null,
      }));
    } else {
      // ── Fallback: use shopping results directly (links may be Google redirects) ──
      console.log("[prices] No product_id sellers found, falling back to shopping results");
      results = shoppingResults.map((item: any) => ({
        retailer: item.source || "Unknown",
        title: item.title || "",
        price: item.price || "N/A",
        price_num: item.extracted_price || 0,
        link: item.link || item.product_link || "",
        thumbnail: item.thumbnail || null,
      }));
    }

    // Filter: must have a usable link
    const withLinks = results.filter((r: any) => r.link);

    // Filter: remove anomalous prices
    const validated = filterAnomalousPrices(withLinks);

    // Deduplicate by retailer — keep the cheapest from each store
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
