import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return new Response(JSON.stringify({ error: "No image data provided" }), {
        status: 400,
      });
    }

    // imageData should be base64 string (data:image/png;base64,...)
    // Extract the base64 part
    const base64Match = imageData.match(/base64,(.+)$/);
    const base64Image = base64Match ? base64Match[1] : imageData;

    // Determine image type from data URL
    const typeMatch = imageData.match(/data:image\/(\w+);/);
    const mediaType = typeMatch ? `image/${typeMatch[1]}` : "image/jpeg";

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analyze this receipt image and extract all grocery/food items with quantities.

Return a JSON array with this exact format:
[
  {
    "name": "item name",
    "quantity": 1,
    "unit": "count" or "oz" or "lbs" or "cups" or "g" or "kg",
    "location": "Pantry"
  }
]

Rules:
- Extract only food/grocery items (skip total, subtotal, prices, dates, store names)
- For items without a visible quantity, use quantity: 1 and unit: "count"
- Always default location to "Pantry"
- Return ONLY the JSON array, no other text
- If no items found, return empty array: []`,
            },
          ],
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract JSON from response (Claude might include markdown formatting)
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    const items = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to extract receipt items",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
