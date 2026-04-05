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
    const { imageBase64, reportType, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert medical report analyzer. Analyze the provided medical report image and extract key findings.

Your response should be in the following JSON format:
{
  "reportType": "detected type of report (e.g., Blood Test, X-Ray, CT Scan, MRI, Sonography, ECG, etc.)",
  "findings": [
    {
      "parameter": "parameter name",
      "value": "observed value",
      "normalRange": "normal range if applicable",
      "status": "normal" | "abnormal" | "critical",
      "interpretation": "brief interpretation"
    }
  ],
  "summary": "Brief summary of overall findings",
  "concernAreas": ["list of areas that need attention"],
  "recommendations": ["list of recommendations based on findings"]
}

Important guidelines:
- Be accurate and precise in your analysis
- Highlight any abnormal or critical values clearly
- Provide helpful interpretations in simple language
- If the image is unclear or not a medical report, indicate that in the summary
- Focus on clinically significant findings`;

    const userPrompt = reportType 
      ? `Analyze this ${reportType} report and provide detailed findings.`
      : `Analyze this medical report and provide detailed findings. First identify what type of report this is.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
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
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "OpenAI API key issue. Please check your API key and billing." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("Failed to analyze report");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = {
        reportType: "Unknown",
        findings: [],
        summary: content,
        concernAreas: [],
        recommendations: [],
      };
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-medical-report error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
