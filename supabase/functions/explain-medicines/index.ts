import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MedicineInfo {
  name: string;
  category: string;
  indications: string | null;
  dosage: string;
  duration: string;
}

interface SymptomInfo {
  name: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicines, symptoms } = await req.json();
    
    if (!medicines || medicines.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No medicines provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for AI
    const symptomsList = (symptoms as SymptomInfo[])
      .map(s => `${s.name} (${s.severity} severity, ${s.duration} ${s.durationUnit})`)
      .join(', ');

    const medicinesList = (medicines as MedicineInfo[])
      .map((m, i) => `${i + 1}. ${m.name} (${m.category}) - Dosage: ${m.dosage}, Duration: ${m.duration}${m.indications ? `, Indications: ${m.indications}` : ''}`)
      .join('\n');

    const systemPrompt = `आप एक अनुभवी इलेक्ट्रो होम्योपैथी विशेषज्ञ डॉक्टर हैं। आपको मरीज के लक्षणों और सुझाई गई दवाओं के आधार पर हिंदी में सरल भाषा में समझाना है।

आपको हर दवा के लिए निम्नलिखित जानकारी देनी है:
1. यह दवा क्यों दी जा रही है (Why)
2. इसे कैसे लेना है (How to use)
3. कितनी पोटेंसी/मात्रा में लेना है (Potency/Dosage)
4. कोई विशेष सावधानी (Precautions)

जवाब JSON format में दें जहाँ हर medicine का name key हो और value में ये fields हों:
- why: क्यों use हो रही है
- howToUse: कैसे लेनी है
- potency: पोटेंसी/मात्रा
- precautions: सावधानियां
- benefits: फायदे (2-3 points)`;

    const userPrompt = `मरीज के लक्षण: ${symptomsList}

सुझाई गई दवाएं:
${medicinesList}

कृपया हर दवा की हिंदी में विस्तृत जानकारी दें।`;

    console.log('Calling Lovable AI for medicine explanations...');

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
              name: "explain_medicines",
              description: "Provide detailed Hindi explanations for each medicine",
              parameters: {
                type: "object",
                properties: {
                  explanations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        medicineName: { type: "string", description: "Name of the medicine" },
                        why: { type: "string", description: "Why this medicine is prescribed (in Hindi)" },
                        howToUse: { type: "string", description: "How to take this medicine (in Hindi)" },
                        potency: { type: "string", description: "Recommended potency/dosage details (in Hindi)" },
                        precautions: { type: "string", description: "Precautions to take (in Hindi)" },
                        benefits: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Key benefits of this medicine (in Hindi)"
                        }
                      },
                      required: ["medicineName", "why", "howToUse", "potency", "precautions", "benefits"],
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
        tool_choice: { type: "function", function: { name: "explain_medicines" } }
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data).substring(0, 500));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "explain_medicines") {
      throw new Error("Invalid AI response format");
    }

    const explanations = JSON.parse(toolCall.function.arguments);
    console.log('Parsed explanations:', JSON.stringify(explanations).substring(0, 500));

    return new Response(
      JSON.stringify(explanations),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-medicines function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
