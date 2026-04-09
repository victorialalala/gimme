// Cascade product identification:
// 1) Google Lens (via SerpAPI) — best for recognizing exact branded products
// 2) GPT-4o Vision fallback — with structured prompt for precise output
// Returns structured JSON for optimal SERP price queries

import { createClient } from "@supabase/supabase-js";

export const config = {
  maxDuration: 30,
};

type ProductResult = {
  brand: string;
  name: string;
  model: string;
  color: string;
  category: string;
  description: string;
  estimated_price: string;
  confidence: number;
  match_source: "lens" | "ai";
  search_query: string; // pre-built query for price search
};

type SimilarItem = {
  title: string;
  brand: string;
  price: string;
  link: string;
  thumbnail: string;
};

// Module-level cache for Lens visual matches (used for similar items on low confidence)
let _lastLensVisualMatches: any[] = [];

// ── Upload image temporarily to Supabase to get a public URL for Google Lens ──
async function uploadTempImage(base64: string): Promise<{ url: string; path: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yawnmnibzpctxokzsqce.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) return null; // Can't upload without service key

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const fileName = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64, "base64");

    const { error } = await supabase.storage
      .from("item-images")
      .upload(fileName, buffer, { contentType: "image/jpeg" });

    if (error) {
      console.error("Temp upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("item-images")
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, path: fileName };
  } catch (err) {
    console.error("Temp upload failed:", err);
    return null;
  }
}

// ── Clean up temp image ──
async function deleteTempImage(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yawnmnibzpctxokzsqce.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return;

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    await supabase.storage.from("item-images").remove([path]);
  } catch {
    // Not critical
  }
}

// ── Step 1: Google Lens via SerpAPI ──
async function tryGoogleLens(imageUrl: string): Promise<ProductResult | null> {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) return null;

  try {
    const url = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&api_key=${serpApiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("Google Lens error:", JSON.stringify(data));
      return null;
    }

    // Check knowledge_graph first — this means Lens recognized a specific product
    const kg = data.knowledge_graph;
    if (kg && kg.length > 0) {
      const topResult = kg[0];
      const title = topResult.title || "";
      const subtitle = topResult.subtitle || "";

      // Try to extract brand from subtitle or title
      const brand = subtitle || title.split(" ")[0] || "Unknown";
      const name = title;

      if (name && name !== "Unknown") {
        return {
          brand,
          name,
          model: "",
          color: "",
          category: guessCategory(name + " " + subtitle),
          description: subtitle,
          estimated_price: extractPriceFromLens(data),
          confidence: 90,
          match_source: "lens",
          search_query: `${brand} ${name}`.trim(),
        };
      }
    }

    // Check visual_matches — look for consistent product identification
    const matches = data.visual_matches || [];
    _lastLensVisualMatches = matches; // Cache for similar items fallback
    if (matches.length >= 2) {
      // Find the most common product name across matches
      const topMatch = matches[0];
      const title = topMatch.title || "";
      const source = topMatch.source || "";

      // Check if multiple matches agree on the product
      const titleWords = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      let agreementCount = 0;

      for (let i = 1; i < Math.min(matches.length, 5); i++) {
        const otherTitle = (matches[i].title || "").toLowerCase();
        const matchingWords = titleWords.filter((w: string) => otherTitle.includes(w));
        if (matchingWords.length >= 2) agreementCount++;
      }

      // If 2+ other results agree, this is likely the right product
      if (agreementCount >= 2) {
        const brand = extractBrandFromTitle(title);
        const price = topMatch.price?.value || extractPriceFromLens(data);

        return {
          brand,
          name: cleanProductTitle(title, brand),
          model: "",
          color: "",
          category: guessCategory(title),
          description: `Found on ${source}`,
          estimated_price: price,
          confidence: 80,
          match_source: "lens",
          search_query: title,
        };
      }

      // Even weak Lens results can hint — return with lower confidence
      if (matches.length >= 3) {
        const brand = extractBrandFromTitle(title);
        const price = topMatch.price?.value || "";

        return {
          brand,
          name: cleanProductTitle(title, brand),
          model: "",
          color: "",
          category: guessCategory(title),
          description: `Visual match from ${source}`,
          estimated_price: price,
          confidence: 55, // Below threshold — will trigger GPT-4o refinement
          match_source: "lens",
          search_query: title,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("Google Lens failed:", err);
    return null;
  }
}

// ── Step 2: GPT-4o Vision (structured prompt) ──
async function identifyWithGPT(
  base64: string,
  lensHint?: ProductResult | null
): Promise<ProductResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  // Build a more targeted prompt, optionally seeded with Lens hint
  let contextHint = "";
  if (lensHint) {
    contextHint = `\nA visual search suggests this might be: "${lensHint.name}" by ${lensHint.brand}. Verify or correct this identification.`;
  }

  const systemPrompt = `You are a product identification expert with deep knowledge of luxury goods, fashion, electronics, beauty, and home products. Identify the product in the image with maximum precision.${contextHint}

Return ONLY valid JSON with these exact fields:
{
  "brand": "exact brand name (e.g. 'Nike', 'Apple', 'Chanel')",
  "name": "full product name without brand (e.g. 'Air Force 1 Low')",
  "model": "specific model, style number, or collection name if known (e.g. 'CW2288-111', 'Classic Flap', 'Series 9'). Empty string if unknown.",
  "color": "color/colorway if visible (e.g. 'White/White', 'Black Caviar', 'Midnight'). Empty string if unclear.",
  "category": "MUST be exactly one of: beauty, accessories, clothing, art & design, home, technology",
  "description": "short factual description with key details separated by · (e.g. 'Leather Sneaker · Low Top · Perforated')",
  "estimated_price": "retail price as string with $ (e.g. '$120', '$7,400')",
  "confidence": "number 0-100 — use 90+ only if you can name the exact brand AND product"
}

Category rules:
- beauty: makeup, skincare, fragrance, haircare, nail polish, beauty tools
- accessories: bags, watches, jewelry, sunglasses, scarves, hats, belts, wallets
- clothing: all garments and shoes/sneakers
- art & design: artwork, prints, books, stationery, design objects
- home: furniture, kitchenware, candles, decor, bedding, appliances
- technology: electronics, gadgets, phones, laptops, headphones, cameras

IMPORTANT: If you recognize a specific branded product, state the exact brand and product name. Do not be vague — say "Nike Air Max 90" not "athletic sneaker". If you truly cannot identify it, set confidence below 30.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this product. What is the exact brand, product name, and model? What's the estimated retail price?",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 400,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI error:", JSON.stringify(data));
    throw new Error(data?.error?.message || "AI identification failed");
  }

  const text = data.choices?.[0]?.message?.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse AI response");

  const product = JSON.parse(jsonMatch[0]);

  // Build an optimized search query: brand + name + model (skip empty parts)
  const queryParts = [product.brand, product.name, product.model].filter(Boolean);
  const searchQuery = queryParts.join(" ");

  return {
    brand: product.brand || "Unknown",
    name: product.name || "Unknown Item",
    model: product.model || "",
    color: product.color || "",
    category: product.category || "other",
    description: product.description || "",
    estimated_price: product.estimated_price || "",
    confidence: product.confidence || 50,
    match_source: "ai",
    search_query: searchQuery,
  };
}

// ── Helpers ──

function extractBrandFromTitle(title: string): string {
  // Common brand patterns — first word is often the brand
  const known = [
    "Nike", "Adidas", "Apple", "Samsung", "Sony", "Chanel", "Louis Vuitton",
    "Gucci", "Prada", "Hermès", "Hermes", "Dior", "Balenciaga", "Fendi",
    "Burberry", "Versace", "Coach", "Tiffany", "Cartier", "Rolex", "Omega",
    "Zara", "H&M", "Uniqlo", "Lululemon", "Dyson", "Bose", "Canon", "Nikon",
    "Lego", "Nintendo", "PlayStation", "Xbox", "New Balance", "Converse",
    "Vans", "Puma", "Reebok", "Jordan", "Supreme", "Off-White", "Yeezy",
    "Le Creuset", "Muji", "IKEA", "Tom Ford", "MAC", "NARS", "Charlotte Tilbury",
    "Glossier", "Aesop", "Diptyque", "Byredo", "Jo Malone",
  ];

  const titleLower = title.toLowerCase();
  for (const brand of known) {
    if (titleLower.includes(brand.toLowerCase())) return brand;
  }

  // Fall back to first word
  return title.split(/\s+/)[0] || "Unknown";
}

function cleanProductTitle(title: string, brand: string): string {
  // Remove brand from the beginning of the title to avoid duplication
  const re = new RegExp(`^${brand}\\s*[-–—:]?\\s*`, "i");
  return title.replace(re, "").trim() || title;
}

function extractPriceFromLens(data: any): string {
  // Try to find a price in visual matches
  const matches = data.visual_matches || [];
  for (const m of matches) {
    if (m.price?.value) return m.price.value;
  }
  return "";
}

function guessCategory(text: string): string {
  const t = text.toLowerCase();

  if (/\b(sneaker|shoe|boot|sandal|heel|loafer|slipper|jordan|air max|air force)\b/.test(t)) return "clothing";
  if (/\b(jacket|dress|shirt|pants|jeans|coat|hoodie|sweater|skirt|top|shorts)\b/.test(t)) return "clothing";
  if (/\b(bag|handbag|purse|wallet|tote|clutch|backpack)\b/.test(t)) return "accessories";
  if (/\b(watch|rolex|omega|cartier|timepiece)\b/.test(t)) return "accessories";
  if (/\b(jewelry|necklace|ring|bracelet|earring)\b/.test(t)) return "accessories";
  if (/\b(sunglasses|glasses|eyewear|scarf|hat|belt)\b/.test(t)) return "accessories";
  if (/\b(lipstick|mascara|foundation|perfume|fragrance|skincare|serum|cream|makeup|beauty|nail)\b/.test(t)) return "beauty";
  if (/\b(phone|iphone|laptop|macbook|headphone|airpod|camera|tablet|ipad|speaker|tv|monitor|console)\b/.test(t)) return "technology";
  if (/\b(candle|vase|lamp|chair|table|sofa|pillow|blanket|mug|plate|kitchen|decor)\b/.test(t)) return "home";
  if (/\b(book|print|art|poster|stationery|pen|notebook)\b/.test(t)) return "art & design";

  return "accessories"; // Safe default
}

// ── Main handler ──

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  let tempImagePath: string | null = null;

  try {
    let result: ProductResult | null = null;

    // ── Run Google Lens (upload + lens) and GPT-4o IN PARALLEL ──
    // Lens often beats GPT for branded goods; GPT is the reliable fallback.
    // Racing them cuts latency ~40-50% vs sequential cascade.
    const lensPromise: Promise<ProductResult | null> = (async () => {
      const tempImage = await uploadTempImage(image);
      if (!tempImage) return null;
      tempImagePath = tempImage.path;
      return tryGoogleLens(tempImage.url);
    })();

    const gptPromise = identifyWithGPT(image, null).catch((e) => {
      console.error("[identify] GPT error:", e?.message);
      return null;
    });

    const lensHint = await lensPromise;

    // If Lens gave a high-confidence result (≥70%), use it — don't wait on GPT
    if (lensHint && lensHint.confidence >= 70) {
      result = lensHint;
      console.log(`[identify] Lens match: "${result.name}" (${result.confidence}%)`);
    } else {
      const gptResult = await gptPromise;
      if (!gptResult) throw new Error("Identification failed");

      // If we had a weak Lens hint and GPT-4o agrees, boost confidence
      if (lensHint && gptResult.brand.toLowerCase() === lensHint.brand.toLowerCase()) {
        gptResult.confidence = Math.min(95, gptResult.confidence + 15);
        gptResult.match_source = "lens"; // Credit the cross-validated Lens match
      }

      result = gptResult;
      console.log(`[identify] GPT-4o result: "${result.name}" by ${result.brand} (${result.confidence}%)`);
    }

    // Clean up temp image
    if (tempImagePath) {
      deleteTempImage(tempImagePath); // Fire-and-forget
    }

    // If confidence is below 70%, build similar items from Lens visual matches
    let similar_items: SimilarItem[] = [];
    if (result.confidence < 70 && _lastLensVisualMatches.length > 0) {
      similar_items = _lastLensVisualMatches
        .filter((m: any) => m.title && m.link && (m.image || m.thumbnail))
        .slice(0, 3)
        .map((m: any) => ({
          title: m.title,
          brand: extractBrandFromTitle(m.title),
          price: m.price?.value || (m.price?.extracted_value ? `$${m.price.extracted_value}` : "See price"),
          link: m.link,
          thumbnail: m.image || m.thumbnail, // Prefer full-res image over thumbnail
        }));
      console.log(`[identify] Low confidence (${result.confidence}%) — returning ${similar_items.length} similar items`);
    }

    return res.status(200).json({ ...result, similar_items });
  } catch (error: any) {
    // Clean up on error too
    if (tempImagePath) deleteTempImage(tempImagePath);

    console.error("Identify error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
