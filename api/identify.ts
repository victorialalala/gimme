// This runs on Vercel's servers — NOT in the browser.
// It receives a photo (as base64), sends it to GPT-4o,
// and returns a JSON object describing the product.

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body; // base64-encoded image string

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a product identification expert. When shown an image, identify the product as precisely as possible. Return ONLY valid JSON with these fields: brand (string), name (string), category (MUST be exactly one of: beauty, accessories, clothing, art & design, home, technology), description (short string, e.g. 'Powder Compact · Matte Finish · Portable'), estimated_price (string with $ and commas, e.g. '$7,400'), confidence (number 0-100). Category rules: beauty = makeup, skincare, fragrance, haircare, nail polish, beauty tools. accessories = bags, watches, jewelry, sunglasses, scarves, hats, belts. clothing = all garments and shoes. art & design = artwork, prints, books, stationery, design objects. home = furniture, kitchenware, candles, decor, bedding, appliances. technology = electronics, gadgets, phones, laptops, headphones, cameras. If you cannot identify the product, set confidence to 0 and name to 'Unknown Item'.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this product. What brand and model is it? What's the estimated retail price?",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", JSON.stringify(data));
      return res.status(500).json({ error: "AI identification failed", detail: data?.error?.message || "Unknown error" });
    }

    // Parse the JSON from GPT-4o's response
    const text = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (GPT sometimes wraps it in ```json blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Could not parse AI response", raw: text });
    }

    const product = JSON.parse(jsonMatch[0]);
    return res.status(200).json(product);
  } catch (error: any) {
    console.error("Identify error:", error?.message || error);
    return res.status(500).json({ error: "Something went wrong", detail: error?.message });
  }
}
