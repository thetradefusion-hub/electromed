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

    const systemPrompt = `आप एक बहुत अनुभवी इलेक्ट्रो-होम्योपैथी विशेषज्ञ हैं जो डॉक्टरों को उनके रोगियों का उपचार सारांश बनाने में मदद करते हैं।

भाषा के बारे में: सारा जवाब सरल, बोलचाल की हिंदी में दें — जैसे एक अनुभवी डॉक्टर दूसरे डॉक्टर को बताता है। कठिन संस्कृत शब्दों से बचें। जैसे "समझना आवश्यक है" की जगह "समझना जरूरी है", "औषधियाँ" की जगह "दवाएं", "जमाव" की जगह "जमना" आदि।

EXACTLY नीचे दिया गया format follow करें। हर section का heading बिल्कुल वैसा ही रखें:

INTRO_SECTION:
इलेक्ट्रो-होम्योपैथी में किसी भी बीमारी का इलाज शुरू करने से पहले यह जानना जरूरी है कि वह Positive (धनात्मक) है या Negative (ऋणात्मक)।

[रोगी का नाम और उम्र] की जो तकलीफ है — [लक्षणों का सरल विवरण] — उसे देखकर हम कह सकते हैं:

**रोग की अवस्था: Positive (धनात्मक)** [या Negative — जो सही हो]

इलेक्ट्रो-होम्योपैथी में जब शरीर में [लक्षणों के आधार पर सरल कारण], तो इसे Positive Condition कहते हैं।

क्यों? क्योंकि [सरल भाषा में कारण — जैसे डॉक्टर मरीज को समझाए]।

**इलाज का तरीका:** Positive बीमारी में हमेशा Negative (ऋणात्मक) दवाएं या ज्यादा dilution (जैसे D6, D10, D30) दी जाती हैं, ताकि शरीर की बढ़ी हुई स्थिति को शांत किया जा सके।

---SECTION_BREAK---

**उपचार का सारांश**:
[हर दवा क्या काम करेगी — सरल भाषा में, बिना जटिल शब्दों के। जैसे: "S6 किडनी की सफाई करेगी और यूरिक एसिड बाहर निकालेगी।"]

---SECTION_BREAK---

**दवाओं का मिश्रण और खुराक तालिका**:

मिश्रण A (खाने से पहले): [दवाओं के नाम]
Potency: [D6/D10/D30]
Dosage: [बूंदों की संख्या]

मिश्रण B (खाने के बाद): [दवाओं के नाम]
Potency: [D6/D10/D30]

| समय | मिश्रण/दवा | फायदा |
|-----|------------|-------|
| सुबह (खाली पेट) | [दवा] | [फायदा] |
| नाश्ते के बाद | [दवा] | [फायदा] |
| दोपहर (खाने से पहले) | [दवा] | [फायदा] |
| दोपहर (खाने के बाद) | [दवा] | [फायदा] |
| रात (खाने से पहले) | [दवा] | [फायदा] |
| रात (खाने के बाद) | [दवा] | [फायदा] |

---SECTION_BREAK---

**रोगी के लिए जरूरी बातें**:
[बहुत आसान भाषा में — जैसे आप मरीज को खुद समझा रहे हों। खाने-पीने की सलाह, क्या करें, क्या न करें।]

जरूरी नियम:
1. हर section को ---SECTION_BREAK--- से अलग करें
2. INTRO_SECTION: से शुरू करें
3. Section headings बिल्कुल ऊपर दिए format में रखें
4. पूरा जवाब सरल बोलचाल की हिंदी में — संस्कृत/साहित्यिक हिंदी नहीं
5. डॉक्टर के नोट्स को ध्यान में रखकर सारांश बनाएं`;

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
