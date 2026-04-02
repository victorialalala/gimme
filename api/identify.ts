// This runs on Vercel's servers — NOT in the browser.
// It receives a photo (as base64), sends it to GPT-4o,
// and returns a JSON object describing the product.

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
              "You are a product identification expert. When shown an image, identify the product as precisely as possible. Return ONLY valid JSON with these fields: brand (string), name (string), category (one of: watches, bags, sneakers, shoes, jewelry, clothing, accessories, electronics, home, other), description (short string, e.g. 'Automatic Watch · Steel · 35mm · Silver dial'), estimated_price (string with $ and commas, e.g. '$7,400'), confidence (number 0-100). If you cannot identify the product, set confidence to 0 and name to 'Unknown Item'.",
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
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "AI identification failed" });
    }

    // Parse the JSON from GPT-4o's response
    const text = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (GPT sometimes wraps it in ```json blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Could not parse AI response" });
    }

    const product = JSON.parse(jsonMatch[0]);
    return res.status(200).json(product);
  } catch (error) {
    console.error("Identify error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
