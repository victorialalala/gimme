// Cascade product identification:
// 1) Google Lens (via SerpAPI) — best for recognizing exact branded products
// 2) Claude claude-sonnet-4-6 Vision fallback — with structured prompt for precise output
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

// ── Upload image temporarily to Supabase to get a public URL for Google Lens ──
async function uploadTempImage(base64: string): Promise<{ url: string; path: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yawnmnibzpctxokzsqce.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) return null; // Can't upload without service key

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const fileName = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

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
// Returns { result, visualMatches } so callers don't rely on module-level state
async function tryGoogleLens(imageUrl: string): Promise<{
  result: ProductResult | null;
  visualMatches: any[];
}> {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) return { result: null, visualMatches: [] };

  try {
    const url = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&api_key=${serpApiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("Google Lens error:", JSON.stringify(data));
      return { result: null, visualMatches: [] };
    }

    const visualMatches = data.visual_matches || [];

    // Check knowledge_graph first — means Lens recognized a specific product
    const kg = data.knowledge_graph;
    if (kg && kg.length > 0) {
      const topResult = kg[0];
      const title = topResult.title || "";
      const subtitle = topResult.subtitle || "";

      const brand = subtitle || title.split(" ")[0] || "Unknown";
      const name = title;

      if (name && name !== "Unknown") {
        return {
          result: {
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
          },
          visualMatches,
        };
      }
    }

    // Check visual_matches — look for consistent product identification
    if (visualMatches.length >= 2) {
      const topMatch = visualMatches[0];
      const title = topMatch.title || "";
      const source = topMatch.source || "";

      const titleWords = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      let agreementCount = 0;

      for (let i = 1; i < Math.min(visualMatches.length, 5); i++) {
        const otherTitle = (visualMatches[i].title || "").toLowerCase();
        const matchingWords = titleWords.filter((w: string) => otherTitle.includes(w));
        if (matchingWords.length >= 2) agreementCount++;
      }

      if (agreementCount >= 2) {
        const brand = extractBrandFromTitle(title);
        const price = topMatch.price?.value || extractPriceFromLens(data);

        return {
          result: {
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
          },
          visualMatches,
        };
      }

      if (visualMatches.length >= 3) {
        const brand = extractBrandFromTitle(title);
        const price = topMatch.price?.value || "";

        return {
          result: {
            brand,
            name: cleanProductTitle(title, brand),
            model: "",
            color: "",
            category: guessCategory(title),
            description: `Visual match from ${source}`,
            estimated_price: price,
            confidence: 55, // Below threshold — will trigger Claude refinement
            match_source: "lens",
            search_query: title,
          },
          visualMatches,
        };
      }
    }

    return { result: null, visualMatches };
  } catch (err) {
    console.error("Google Lens failed:", err);
    return { result: null, visualMatches: [] };
  }
}

// ── Step 2: GPT-4o Vision (structured prompt) ──
async function identifyWithGPT(
  base64: string,
  lensHint?: ProductResult | null
): Promise<ProductResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  let contextHint = "";
  if (lensHint) {
    contextHint = `\nA visual search suggests this might be: "${lensHint.name}" by ${lensHint.brand}. Verify or correct this identification.`;
  }

  const systemPrompt = `You are an expert product identification system used in a shopping app. Your job is to identify exactly what product is in a photo so users can find it and compare prices.${contextHint}

## How to identify

1. **Scan for brand signals first**: logos, text printed on the product, tags, labels, packaging, hardware (e.g. "CC" on Chanel, swoosh on Nike, bitten apple on Apple). These are the most reliable signals.
2. **Use shape + materials**: silhouette, material (leather vs canvas vs plastic), stitching, sole shape, cap shape, bottle shape — these narrow down brand and line.
3. **Use context clues**: what else is in the photo (a makeup counter = beauty product, a sneaker shelf = footwear).
4. **Be specific, never vague**: say "Nike Air Force 1 Low White" not "white sneaker". Say "Chanel Classic Flap Medium" not "quilted handbag". Say "Stanley Quencher 40oz" not "tumbler".
5. **Confidence calibration**:
   - 90–100: you can see the brand AND the specific product name/model clearly
   - 70–89: brand is certain, product name is very likely
   - 50–69: brand is likely, product name is a good guess
   - 30–49: you can see what TYPE of product it is but brand/name is uncertain
   - 0–29: you can barely make out what it is

Return ONLY valid JSON with these exact fields:
{
  "brand": "exact brand name (e.g. 'Nike', 'Apple', 'Chanel', 'Stanley', 'Diptyque')",
  "name": "specific product name without the brand prefix (e.g. 'Air Force 1 Low', 'MacBook Pro 14-inch', 'Classic Flap Medium', 'Baies Candle')",
  "model": "model number, colorway code, or collection if visible (e.g. 'CW2288-111', 'M3 Pro', '2024'). Empty string if unknown.",
  "color": "primary color or colorway name (e.g. 'Triple White', 'Black Caviar', 'Midnight Blue'). Empty string if unclear.",
  "category": "MUST be exactly one of: beauty, accessories, clothing, art & design, home, technology",
  "description": "2–4 key product attributes separated by · that someone would use to search (e.g. 'Low Top Sneaker · Leather · Perforated Toe Box')",
  "estimated_price": "typical retail price as a string with $ sign (e.g. '$120', '$2,800', '$38'). Use your knowledge of typical retail pricing.",
  "confidence": number 0–100 per the calibration above,
  "search_query": "clean concise shopping query to find this on Google Shopping e.g. 'Nike Air Force 1 Low Triple White CW2288-111'"
}

Category rules:
- beauty: makeup, skincare, fragrance, haircare, nail polish, beauty tools
- accessories: bags, watches, jewelry, sunglasses, scarves, hats, belts, wallets
- clothing: all garments and footwear including sneakers and boots
- art & design: artwork, prints, books, stationery, design objects
- home: furniture, kitchenware, candles, decor, bedding, appliances
- technology: electronics, gadgets, phones, laptops, headphones, cameras`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look carefully at this image. First identify any brand logos, text, or distinctive design elements you can see. Then output the JSON identifying the exact product.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
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

  const queryParts = [product.brand, product.name, product.model].filter(Boolean);
  const searchQuery = product.search_query || queryParts.join(" ");

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

  return title.split(/\s+/)[0] || "Unknown";
}

function cleanProductTitle(title: string, brand: string): string {
  const re = new RegExp(`^${brand}\\s*[-–—:]?\\s*`, "i");
  return title.replace(re, "").trim() || title;
}

function extractPriceFromLens(data: any): string {
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
    let lensVisualMatches: any[] = [];

    // ── Run Google Lens (upload + lens) and Claude IN PARALLEL ──
    // Lens often beats Claude for branded goods; Claude is the reliable fallback.
    // Racing them cuts latency ~40-50% vs sequential cascade.
    const lensPromise = (async () => {
      const tempImage = await uploadTempImage(image);
      if (!tempImage) return { result: null, visualMatches: [] };
      tempImagePath = tempImage.path;
      return tryGoogleLens(tempImage.url);
    })();

    const claudePromise = identifyWithGPT(image, null).catch((e) => {
      console.error("[identify] Claude error:", e?.message);
      return null;
    });

    const lensOutput = await lensPromise;
    lensVisualMatches = lensOutput.visualMatches;
    const lensResult = lensOutput.result;

    // If Lens gave a high-confidence result (≥70%), use it — don't wait on Claude
    if (lensResult && lensResult.confidence >= 70) {
      result = lensResult;
      console.log(`[identify] Lens match: "${result.name}" (${result.confidence}%)`);
    } else {
      const claudeResult = await claudePromise;
      if (!claudeResult) throw new Error("Identification failed");

      // If we had a weak Lens hint and Claude agrees, boost confidence
      if (lensResult && claudeResult.brand.toLowerCase() === lensResult.brand.toLowerCase()) {
        claudeResult.confidence = Math.min(95, claudeResult.confidence + 15);
        claudeResult.match_source = "lens"; // Credit the cross-validated Lens match
      }

      result = claudeResult;
      console.log(`[identify] Claude result: "${result.name}" by ${result.brand} (${result.confidence}%)`);
    }

    // Clean up temp image
    if (tempImagePath) {
      deleteTempImage(tempImagePath); // Fire-and-forget
    }

    // If confidence is below 70%, build similar items from Lens visual matches
    let similar_items: SimilarItem[] = [];
    if (result.confidence < 70 && lensVisualMatches.length > 0) {
      similar_items = lensVisualMatches
        .filter((m: any) => m.title && m.link && (m.image || m.thumbnail))
        .slice(0, 3)
        .map((m: any) => ({
          title: m.title,
          brand: extractBrandFromTitle(m.title),
          price: m.price?.value || (m.price?.extracted_value ? `$${m.price.extracted_value}` : "See price"),
          link: m.link,
          thumbnail: m.image || m.thumbnail,
        }));
      console.log(`[identify] Low confidence (${result.confidence}%) — returning ${similar_items.length} similar items`);
    }

    return res.status(200).json({ ...result, similar_items });
  } catch (error: any) {
    if (tempImagePath) deleteTempImage(tempImagePath);

    console.error("Identify error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
