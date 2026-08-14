import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { properties } from "@/lib/properties";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages, preferences } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    // Format the property listings for Gemini
    const propertySummary = properties
      .map(
        (p) => `- ID: ${p.id}
  Name: ${p.name}
  Location: ${p.location} (City: ${p.city})
  Price: $${p.price.toLocaleString()}
  Specs: ${p.beds} Beds / ${p.baths} Baths, ${p.size} sqm
  Sustainability Index: +${p.sustainabilityIndex}%
  Description: ${p.description}
  Key Sustainable Features: ${p.features.join(", ")}
  Type: ${p.type}`
      )
      .join("\n\n");

    const systemInstruction = `You are "Pigma AI Concierge", an ultra-exclusive, sophisticated AI real estate consultant and sustainability expert representing "Pigma Luxury Estates" in Thailand (specializing in Phuket and Koh Samui).

Your goal is to guide prospective ultra-high-net-worth buyers in finding their perfect sustainable tropical residence or villa.
You have access to our direct developer listings:
${propertySummary}

HOW TO BEHAVE:
1. Speak with elegant, warm, refined, and professional hospitality. Use luxury-hospitality terminology (e.g. "my pleasure", "bespoke residency", "ecological sanctuary", "unparalleled craftsmanship").
2. Answer queries intelligently about sustainable building tech (solar microgrids, rammed-earth thermal walls, bio-climatic ventilation, aquifer recharging).
3. Whenever appropriate, suggest 1 or 2 specific properties from our listings that match the user's budget, location preference (Phuket vs Samui), or lifestyle. ALWAYS mention why that specific property's ecological features are outstanding.
4. Keep answers concise, highly scannable, formatted beautifully in Markdown with subtle emphasis (no messy walls of text!).
5. If they express interest in a viewing or quote, cordially invite them to fill out the "Request a Quote / Request Brochure" forms on our website or provide their email/phone so we can schedule a private helicopter or yacht viewing.

Do not recommend properties that are not on our official list, but you can speak generally about local attractions in Phuket (Kamala, Surin, Bangtao) and Koh Samui (Chaweng, Bophut). Always maintain high trust and professional authority.`;

    // Map messages array to standard contents parts for @google/genai SDK
    const formattedContents = messages.map((m: any) => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      };
    });

    // Optional: Include user parameters if sent in preferences
    if (preferences) {
      formattedContents.unshift({
        role: "user",
        parts: [{ text: `Hello. My current preferences: Budget limit: $${preferences.budget || "No limit"}, Location: ${preferences.location || "Any"}, Beds: ${preferences.beds || "Any"}. Please greet me and recommend a starting match.` }],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, but I could not process that request at this moment. How else may I assist your estate search?";
    return NextResponse.json({ content: reply });
  } catch (error: any) {
    console.error("Gemini API Error in Pigma Concierge Route:", error);
    return NextResponse.json(
      { error: "Our exclusive concierge is momentarily occupied. Please contact our main desk directly.", details: error.message },
      { status: 500 }
    );
  }
}
