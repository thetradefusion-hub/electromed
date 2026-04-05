import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, contentType, fileName } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert in Electro Homoeopathy medicine. You extract structured medical knowledge from books, notes, and reference materials.

Your task: Extract symptom-to-medicine mapping rules from the provided content.

Return a JSON array of rules in this EXACT format:
{
  "rules": [
    {
      "name": "Short descriptive rule name in English",
      "description": "Brief description of what this rule covers",
      "symptoms": ["symptom 1", "symptom 2"],
      "symptomCategory": "category like Digestive, Respiratory, Skin, etc.",
      "medicines": ["medicine name 1", "medicine name 2"],
      "medicineCategory": "category like Scrofoloso, Canceroso, Electricities, etc.",
      "dosage": "dosage instructions (e.g., 5 drops 3 times daily)",
      "duration": "treatment duration (e.g., 7 days, 2 weeks)",
      "priority": 5
    }
  ],
  "extractedSymptoms": [
    {
      "name": "Symptom name",
      "category": "Category",
      "description": "Brief description"
    }
  ],
  "extractedMedicines": [
    {
      "name": "Medicine name",
      "category": "Category",
      "indications": "What it's used for",
      "defaultDosage": "Standard dosage"
    }
  ]
}

IMPORTANT GUIDELINES:
- Extract ALL symptom-medicine mappings found in the content
- Use standard Electro Homoeopathy medicine names (S1-S10, C1-C17, F1-F7, etc.)
- Include dosage and duration if mentioned, otherwise use reasonable defaults
- Categorize symptoms properly (Digestive, Respiratory, Skin, Nervous, Circulatory, Urinary, Musculoskeletal, General, etc.)
- Priority should be 1-10 based on how specific/important the rule is
- Extract unique symptoms and medicines separately for database population
- If content is in Hindi, translate symptom/medicine names to English but keep local terms in description`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (contentType === "image") {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Extract all symptom-to-medicine rules from this medical book page/image. File: ${fileName}` },
          {
            type: "image_url",
            image_url: { url: content },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Extract all symptom-to-medicine rules from this medical text content.\n\nFile: ${fileName}\n\nContent:\n${content}`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("Failed to extract knowledge");
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("No response from AI");
    }

    let extracted;
    try {
      extracted = JSON.parse(rawContent);
    } catch {
      extracted = { rules: [], extractedSymptoms: [], extractedMedicines: [], rawText: rawContent };
    }

    return new Response(
      JSON.stringify({ success: true, data: extracted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("extract-book-knowledge error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
