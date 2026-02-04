import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SymptomInfo {
  id: string;
  name: string;
  category: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();
    
    if (!symptoms || symptoms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No symptoms provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const symptomsList = (symptoms as SymptomInfo[])
      .map((s, i) => `${i + 1}. ${s.name} (Category: ${s.category}, Severity: ${s.severity}, Duration: ${s.duration} ${s.durationUnit})`)
      .join('\n');

    const systemPrompt = `You are an expert medical encyclopedia and clinical reference specialist. Your task is to provide precise, authoritative medical descriptions for symptoms in formal medical English.

For each symptom, provide a comprehensive medical description (~100 words) that includes:
1. Medical Definition: Precise clinical definition using proper medical terminology
2. Pathophysiology: Brief explanation of underlying mechanisms
3. Associated Conditions: Common diseases/conditions where this symptom appears
4. Clinical Significance: When this symptom indicates serious concern
5. Differential Considerations: What the symptom may indicate

Use formal medical/dictionary language. Be accurate and clinically relevant.

Return JSON with each symptom's name as key and the description as value.`;

    const userPrompt = `Provide detailed medical encyclopedia-style descriptions for these symptoms:

${symptomsList}

Return a JSON object where keys are symptom names and values are the medical descriptions (~100 words each).`;

    console.log('Calling Lovable AI for symptom explanations...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "explain_symptoms",
              description: "Provide medical encyclopedia descriptions for symptoms in formal English",
              parameters: {
                type: "object",
                properties: {
                  explanations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        symptomName: { type: "string", description: "Name of the symptom" },
                        medicalDefinition: { type: "string", description: "Clinical definition of the symptom" },
                        pathophysiology: { type: "string", description: "Underlying mechanisms causing this symptom" },
                        associatedConditions: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Common conditions where this symptom appears"
                        },
                        clinicalSignificance: { type: "string", description: "When this symptom indicates serious concern" },
                        differentialConsiderations: { type: "string", description: "What the symptom may indicate" }
                      },
                      required: ["symptomName", "medicalDefinition", "pathophysiology", "associatedConditions", "clinicalSignificance", "differentialConsiderations"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["explanations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "explain_symptoms" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data).substring(0, 500));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "explain_symptoms") {
      throw new Error("Invalid AI response format");
    }

    const explanations = JSON.parse(toolCall.function.arguments);
    console.log('Parsed explanations:', JSON.stringify(explanations).substring(0, 500));

    return new Response(
      JSON.stringify(explanations),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-symptoms function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
