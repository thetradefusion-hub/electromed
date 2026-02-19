import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, medicines, patientInfo, doctorNotes } = await req.json();

    if (!symptoms || symptoms.length === 0 || !medicines || medicines.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Symptoms and medicines are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const symptomsList = symptoms
      .map((s: any, i: number) => `${i + 1}. ${s.name} (Severity: ${s.severity}, Duration: ${s.duration} ${s.durationUnit})`)
      .join('\n');

    const medicinesList = medicines
      .map((m: any, i: number) => `${i + 1}. ${m.name} (${m.category}) - Dosage: ${m.dosage}, Duration: ${m.duration}`)
      .join('\n');

    const patientContext = patientInfo
      ? `रोगी: ${patientInfo.name}, उम्र: ${patientInfo.age} वर्ष, लिंग: ${patientInfo.gender}`
      : '';

    const doctorNotesContext = doctorNotes
      ? `\n\nडॉक्टर के अवलोकन (बोलचाल की भाषा में): ${doctorNotes}`
      : '';

    const systemPrompt = `आप एक अत्यंत अनुभवी इलेक्ट्रो-होम्योपैथी विशेषज्ञ और वरिष्ठ चिकित्सक हैं। आपको रोगी के लक्षणों और सुझाई गई दवाओं के आधार पर एक विस्तृत उपचार सारांश (Treatment Summary) तैयार करना है।

यह सारांश 500-800 शब्दों में हिंदी में होना चाहिए और इलेक्ट्रो-होम्योपैथी के सिद्धांतों पर आधारित होना चाहिए।

सारांश में निम्नलिखित भाग अवश्य होने चाहिए:

1. **रोग की अवस्था (Positive/Negative Classification)**:
   - इलेक्ट्रो-होम्योपैथी के अनुसार रोग Positive (धनात्मक) है या Negative (ऋणात्मक)
   - यह क्यों Positive या Negative है, इसका वैज्ञानिक कारण
   - उपचार का सिद्धांत (Positive रोग के लिए Negative औषधियाँ या vice versa)

2. **उपचार का सारांश**:
   - हर दवा कैसे कार्य करेगी
   - दवाओं का Positive/Negative प्रभाव
   - दवाओं का संयोजन क्यों चुना गया

3. **दवाओं का मिश्रण और खुराक तालिका**:
   - मिश्रण A (भोजन से पहले) और मिश्रण B (भोजन के बाद)
   - Potency (D6, D10, D30 आदि)
   - Dosage (बूंदों की संख्या)
   - एक समय तालिका (सुबह, दोपहर, रात)

4. **रोगी के लिए विशेष निर्देश**:
   - सरल भाषा में रोगी को समझाने योग्य बात
   - खान-पान और जीवनशैली संबंधी सलाह
   - क्या करें और क्या न करें

जवाब पूरी तरह हिंदी में होना चाहिए, औपचारिक लेकिन समझने योग्य भाषा में।
डॉक्टर ने जो बोलचाल की भाषा में नोट्स लिखे हैं, उन्हें भी ध्यान में रखकर सारांश तैयार करें।`;

    const userPrompt = `${patientContext}${doctorNotesContext}

रोगी के लक्षण:
${symptomsList}

सुझाई गई दवाएं:
${medicinesList}

कृपया इलेक्ट्रो-होम्योपैथी के सिद्धांतों के अनुसार विस्तृत उपचार सारांश तैयार करें (500-800 शब्द)।`;

    console.log('Calling Lovable AI for treatment summary...');

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
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    console.log('Treatment summary generated, length:', summary.length);

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-treatment-summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
