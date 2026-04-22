export const config = {
  maxDuration: 10,
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

// Search URLs for known retailers — used to build deterministic direct links
// so we never send the user to a Google redirect page.
const RETAILER_SEARCH_URLS: Record<string, string> = {
  "nordstrom": "https://www.nordstrom.com/sr?keyword=",
  "saks fifth avenue": "https://www.saksfifthavenue.com/search?q=",
  "saks": "https://www.saksfifthavenue.com/search?q=",
  "bloomingdale's": "https://www.bloomingdales.com/shop/search?keyword=",
  "bloomingdales": "https://www.bloomingdales.com/shop/search?keyword=",
  "neiman marcus": "https://www.neimanmarcus.com/search.jsp?from=brSearch&q=",
  "bergdorf goodman": "https://www.bergdorfgoodman.com/search.jsp?from=brSearch&q=",
  "mytheresa": "https://www.mytheresa.com/us/en/search?q=",
  "net-a-porter": "https://www.net-a-porter.com/en-us/search?q=",
  "net a porter": "https://www.net-a-porter.com/en-us/search?q=",
  "farfetch": "https://www.farfetch.com/shopping/search/items.aspx?q=",
  "ssense": "https://www.ssense.com/en-us/search?keyword=",
  "matchesfashion": "https://www.matchesfashion.com/us/search?q=",
  "matches fashion": "https://www.matchesfashion.com/us/search?q=",
  "24s": "https://www.24s.com/en-us/search?q=",
  "moda operandi": "https://www.modaoperandi.com/search?q=",
  "prada": "https://www.prada.com/us/en/search.html?q=",
  "gucci": "https://www.gucci.com/us/en/search?searchString=",
  "louis vuitton": "https://us.louisvuitton.com/eng-us/search/",
  "hermès": "https://www.hermes.com/us/en/search/?s=",
  "hermes": "https://www.hermes.com/us/en/search/?s=",
  "chanel": "https://www.chanel.com/us/search/?query=",
  "dior": "https://www.dior.com/en_us/search?q=",
  "bottega veneta": "https://www.bottegaveneta.com/en-us/search?q=",
  "celine": "https://www.celine.com/en-us/search?q=",
  "saint laurent": "https://www.ysl.com/en-us/search?q=",
  "ysl": "https://www.ysl.com/en-us/search?q=",
  "balenciaga": "https://www.balenciaga.com/en-us/search?q=",
  "loewe": "https://www.loewe.com/usa/en/search?q=",
  "fendi": "https://www.fendi.com/us-en/search?q=",
  "valentino": "https://www.valentino.com/en-us/search?search=",
  "miu miu": "https://www.miumiu.com/us/en/search.html?q=",
  "coach": "https://www.coach.com/search?q=",
  "michael kors": "https://www.michaelkors.com/search?q=",
  "tory burch": "https://www.toryburch.com/en-us/search/?q=",
  "kate spade": "https://www.katespade.com/search?q=",
  "marc jacobs": "https://www.marcjacobs.com/search?q=",
  "shopbop": "https://www.shopbop.com/search?q=",
  "revolve": "https://www.revolve.com/r/Search.jsp?search=",
  "nap": "https://www.net-a-porter.com/en-us/search?q=",
  "amazon": "https://www.amazon.com/s?k=",
  "amazon.com": "https://www.amazon.com/s?k=",
  "target": "https://www.target.com/s?searchTerm=",
  "walmart": "https://www.walmart.com/search?q=",
  "macy's": "https://www.macys.com/shop/search?keyword=",
  "macys": "https://www.macys.com/shop/search?keyword=",
};

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

function isBlockedSource(source: string): boolean {
  if (!source) return false;
  const lower = source.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => lower.includes(d.replace(".", "")));
}

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

// Build a direct search URL on the retailer's own site for this product.
// Returns null if the retailer isn't on our known list (we'd rather skip
// than risk another Google-redirect disappointment).
function buildRetailerLink(source: string, brand: string, name: string): string | null {
  const sourceLower = source.toLowerCase().trim();
  let template: string | null = null;

  // Exact match first
  if (RETAILER_SEARCH_URLS[sourceLower]) {
    template = RETAILER_SEARCH_URLS[sourceLower];
  } else {
    // Fuzzy: any key that is contained in / contains the source
    for (const [k, v] of Object.entries(RETAILER_SEARCH_URLS)) {
      if (sourceLower.includes(k) || k.includes(sourceLower)) {
        template = v;
        break;
      }
    }
  }

  if (!template) return null;

  // If the retailer is the brand itself, searching "Prada prada arqué" is
  // redundant — just search the product name.
  const brandLower = (brand || "").toLowerCase();
  const searchTerm =
    brandLower && sourceLower.includes(brandLower)
      ? (name || brand)
      : [brand, name].filter(Boolean).join(" ");

  return template + encodeURIComponent(searchTerm);
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

      if (!matchesProduct(item.title || "", brand || "", name || "")) continue;

      const link = buildRetailerLink(source, brand || "", name || "");
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
      if (!seen.has(key) || priceNum < seen.get(key)!.price_num) {
        seen.set(key, entry);
      }
    }

    let results = Array.from(seen.values()).sort((a, b) => a.price_num - b.price_num);
    results = filterScamPrices(results).slice(0, 5);
    if (results.length > 0) results[0].tag = "Best Price";

    console.log(`[prices] Returning ${results.length} retailers`);
    return res.status(200).json({ retailers: results });

  } catch (error: any) {
    console.error("Prices error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
