// This runs on Vercel's servers — NOT in the browser.
// It receives a product name + brand, searches Google Shopping
// via SerpAPI, and returns real retailer prices.

export const config = {
  maxDuration: 15,
};

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
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&api_key=${apiKey}&num=6`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("SerpAPI error:", JSON.stringify(data));
      return res.status(500).json({ error: "Price search failed" });
    }

    // Extract shopping results into a clean format
    // SerpAPI may return `link` (direct retailer URL) or `product_link` (Google Shopping page) — use whichever is available
    const rawResults = (data.shopping_results || []).slice(0, 8).map(
      (item: any) => ({
        retailer: item.source || "Unknown",
        title: item.title || "",
        price: item.price || "N/A",
        price_num: item.extracted_price || 0,
        link: item.link || item.product_link || "",
        thumbnail: item.thumbnail || null,
      })
    );

    // Filter out results with no usable link, then take top 5
    const results = rawResults.filter((r: any) => r.link).slice(0, 5);

    // Sort by price (lowest first) and tag the best
    results.sort((a: any, b: any) => a.price_num - b.price_num);
    if (results.length > 0) {
      results[0].tag = "Best Price";
    }

    return res.status(200).json({ retailers: results });
  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
