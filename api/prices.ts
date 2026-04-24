export const config = {
  maxDuration: 10,
};

const BLOCKED_DOMAINS = [
  "ebay.", "poshmark.", "mercari.", "depop.", "thredup.",
  "therealreal.", "vestiaire.", "grailed.", "stockx.",
  "offerup.", "craigslist.", "facebook.com/marketplace",
  "tradesy.", "rebag.", "luxedh.", "fashionphile.",
  "etsy.", "bonanza.", "reverb.", "mercariapp.",
  // Risky / high-variance marketplaces and grey-market sellers
  "senser.", "dhgate.", "aliexpress.", "alibaba.", "joom.",
  "wish.com", "temu.", "shein.", "yupoo.",
];

// Two kinds of entries:
//  - "search:<url>" — append URL-encoded query. Used for dept. stores and
//    multi-brand sites where the search URL pattern is stable.
//  - "home:<url>"   — static homepage. Used for brand-owned sites whose
//    search URL conventions are inconsistent / 404-prone (Prada, LV, etc.).
//    User lands on the brand home, where search is always one click away.
const RETAILER_URLS: Record<string, string> = {
  // Department stores & multi-brand
  "nordstrom": "search:https://www.nordstrom.com/sr?keyword=",
  "saks fifth avenue": "search:https://www.saksfifthavenue.com/search?q=",
  "saks": "search:https://www.saksfifthavenue.com/search?q=",
  "bloomingdale's": "search:https://www.bloomingdales.com/shop/search?keyword=",
  "bloomingdales": "search:https://www.bloomingdales.com/shop/search?keyword=",
  "neiman marcus": "search:https://www.neimanmarcus.com/search.jsp?from=brSearch&q=",
  "bergdorf goodman": "search:https://www.bergdorfgoodman.com/search.jsp?from=brSearch&q=",
  "mytheresa": "search:https://www.mytheresa.com/us/en/search?q=",
  "net-a-porter": "search:https://www.net-a-porter.com/en-us/search?q=",
  "net a porter": "search:https://www.net-a-porter.com/en-us/search?q=",
  "farfetch": "search:https://www.farfetch.com/shopping/search/items.aspx?q=",
  "ssense": "search:https://www.ssense.com/en-us/search?keyword=",
  "24s": "search:https://www.24s.com/en-us/search?q=",
  "moda operandi": "search:https://www.modaoperandi.com/search?q=",
  "shopbop": "search:https://www.shopbop.com/search?q=",
  "revolve": "search:https://www.revolve.com/r/Search.jsp?search=",
  "matchesfashion": "search:https://www.matchesfashion.com/us/search?q=",
  "matches fashion": "search:https://www.matchesfashion.com/us/search?q=",
  "amazon": "search:https://www.amazon.com/s?k=",
  "amazon.com": "search:https://www.amazon.com/s?k=",
  "target": "search:https://www.target.com/s?searchTerm=",
  "walmart": "search:https://www.walmart.com/search?q=",
  "macy's": "search:https://www.macys.com/shop/search?keyword=",
  "macys": "search:https://www.macys.com/shop/search?keyword=",

  // Brand-owned sites — use homepage. Search URL conventions vary and often
  // return 404 for direct query params (e.g. prada.com/us/en/search.html).
  "prada": "home:https://www.prada.com/us/en.html",
  "gucci": "home:https://www.gucci.com/us/en/",
  "louis vuitton": "home:https://us.louisvuitton.com/eng-us/homepage",
  "hermès": "home:https://www.hermes.com/us/en/",
  "hermes": "home:https://www.hermes.com/us/en/",
  "chanel": "home:https://www.chanel.com/us/",
  "dior": "home:https://www.dior.com/en_us",
  "bottega veneta": "home:https://www.bottegaveneta.com/en-us",
  "celine": "home:https://www.celine.com/en-us/",
  "saint laurent": "home:https://www.ysl.com/en-us",
  "ysl": "home:https://www.ysl.com/en-us",
  "balenciaga": "home:https://www.balenciaga.com/en-us",
  "loewe": "home:https://www.loewe.com/usa/en/home",
  "fendi": "home:https://www.fendi.com/us-en/",
  "valentino": "home:https://www.valentino.com/en-us/",
  "miu miu": "home:https://www.miumiu.com/us/en.html",
  "coach": "search:https://www.coach.com/search?q=",
  "michael kors": "search:https://www.michaelkors.com/search?q=",
  "tory burch": "search:https://www.toryburch.com/en-us/search/?q=",
  "kate spade": "search:https://www.katespade.com/search?q=",
  "marc jacobs": "search:https://www.marcjacobs.com/search?q=",
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

function isBlockedUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => lower.includes(d));
}

function isGoogleLink(url: string): boolean {
  if (!url) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "google.com" || host.endsWith(".google.com");
  } catch {
    return false;
  }
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

// Build a link to the retailer's site for this product. Returns null if
// the retailer isn't on our known list (skip rather than risk a 404 or
// a Google redirect).
function buildRetailerLink(source: string, brand: string, name: string, model: string): string | null {
  const sourceLower = source.toLowerCase().trim();
  let entry: string | null = null;

  if (RETAILER_URLS[sourceLower]) {
    entry = RETAILER_URLS[sourceLower];
  } else {
    for (const [k, v] of Object.entries(RETAILER_URLS)) {
      if (sourceLower.includes(k) || k.includes(sourceLower)) {
        entry = v;
        break;
      }
    }
  }
  if (!entry) return null;

  // Homepage entries ignore the product query.
  if (entry.startsWith("home:")) return entry.slice(5);

  if (!entry.startsWith("search:")) return null;
  const template = entry.slice(7);

  // Include model/variant for specificity. Strip accents so "arqué" etc.
  // don't break finicky site search.
  const brandLower = (brand || "").toLowerCase();
  const parts =
    brandLower && sourceLower.includes(brandLower)
      ? [name, model]
      : [brand, name, model];
  const searchTerm = normalize(parts.filter(Boolean).join(" "));

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
      if (isBlockedUrl(item.link || "") || isBlockedUrl(item.product_link || "")) continue;

      if (!matchesProduct(item.title || "", brand || "", name || "")) continue;

      // Prefer SerpAPI's direct retailer URL when it's an actual retailer
      // URL (not Google-routed). Lands the user on the EXACT product page.
      // Fall back to our retailer search-URL map otherwise.
      const rawLink = item.link || "";
      const productLink = item.product_link || "";
      let link: string | null = null;
      if (rawLink && !isGoogleLink(rawLink) && !isBlockedUrl(rawLink)) {
        link = rawLink;
      } else if (productLink && !isGoogleLink(productLink) && !isBlockedUrl(productLink)) {
        link = productLink;
      } else {
        link = buildRetailerLink(source, brand || "", name || "", model || "");
      }
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
