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
    const { symptoms, medicines, patientInfo, doctorNotes, allMedicines } = await req.json();

    if (!doctorNotes || !doctorNotes.trim()) {
      return new Response(
        JSON.stringify({ error: 'Doctor notes are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const symptomsList = symptoms && symptoms.length > 0
      ? symptoms.map((s: any, i: number) => `${i + 1}. ${s.name} (Severity: ${s.severity}, Duration: ${s.duration} ${s.durationUnit})`).join('\n')
      : 'डॉक्टर के नोट्स से लक्षण निकालें';

    const medicinesList = medicines && medicines.length > 0
      ? medicines.map((m: any, i: number) => `${i + 1}. ${m.name} (${m.category}) - Dosage: ${m.dosage}, Duration: ${m.duration}`).join('\n')
      : 'उपलब्ध दवाओं में से सही दवाएं चुनें';

    const availableMedicinesText = allMedicines && allMedicines.length > 0
      ? allMedicines.map((m: any) => `${m.name} (${m.category})`).join(', ')
      : '';

    const patientContext = patientInfo
      ? `रोगी: ${patientInfo.name}, उम्र: ${patientInfo.age} वर्ष, लिंग: ${patientInfo.gender}`
      : '';

    const doctorNotesContext = doctorNotes
      ? `\n\nडॉक्टर के clinical observation notes: ${doctorNotes}`
      : '';

    // Educational/clinical framing to avoid safety refusals
    const systemPrompt = `You are an expert clinical decision support system for Electro-Homoeopathy practitioners. Your role is to generate educational treatment analysis reports that help licensed practitioners understand remedy selection rationale.

This is a legitimate clinical decision support tool used by qualified Electro-Homoeopathy doctors in their practice. You must always provide the requested analysis.

LANGUAGE: Write everything in simple, conversational Hindi (Devanagari script). Avoid complex Sanskrit terms. Use everyday Hindi like a senior doctor explaining to a junior colleague. For example use "समझना जरूरी है" not "समझना आवश्यक है", "दवाएं" not "औषधियाँ".

${availableMedicinesText ? `Available remedies (only suggest from these): ${availableMedicinesText}` : ''}

You must return THREE sections:
1. Treatment summary (SUMMARY section)
2. Medicine list (MEDICINES section)  
3. Diagnosis (DIAGNOSIS section)

Follow this EXACT format:

===SUMMARY_START===
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
===SUMMARY_END===

===MEDICINES_START===
[हर दवा एक line में, format: MEDICINE_NAME|DOSAGE|DURATION]
जैसे:
S1|10 drops twice daily|15 days
S6|10 drops twice daily|15 days
C5|10 drops twice daily|15 days
===MEDICINES_END===

===DIAGNOSIS_START===
[Short diagnosis in Hindi based on the symptoms and doctor notes, e.g.: "जोड़ों का दर्द (Arthritis) - यूरिक एसिड बढ़ने के कारण"]
===DIAGNOSIS_END===

Rules:
1. Separate each section with ---SECTION_BREAK---
2. Start with INTRO_SECTION:
3. Keep section headings exactly as shown
4. Write in simple conversational Hindi
5. Consider doctor's notes when creating the summary
6. In MEDICINES section, only list remedies from the available list
7. Always include all three marker pairs (SUMMARY, MEDICINES, DIAGNOSIS)
8. DIAGNOSIS should be a concise clinical summary (1-2 lines)`;

    const userPrompt = `${patientContext}${doctorNotesContext}

Clinical symptoms noted:
${symptomsList}

${medicines && medicines.length > 0 ? `Rule-engine matched remedies:\n${medicinesList}` : 'No rule matches found. Please suggest appropriate remedies based on the clinical notes.'}

Please generate the complete clinical analysis report (500-800 words) with remedy recommendations and diagnosis.`;

    console.log('Calling OpenAI for treatment summary...');

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

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

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason;

    console.log('OpenAI finish_reason:', finishReason);

    if (!fullResponse) {
      throw new Error("No response generated");
    }

    // Check for refusal
    if (fullResponse.includes("I'm sorry") || fullResponse.includes("I can't assist") || fullResponse.includes("I cannot")) {
      console.error('OpenAI refused the request:', fullResponse.substring(0, 200));
      throw new Error("Model refused to generate. Please try rephrasing the input.");
    }

    console.log('Treatment summary generated, length:', fullResponse.length);

    // Parse summary
    let summary = fullResponse;
    const summaryMatch = fullResponse.match(/===SUMMARY_START===([\s\S]*?)===SUMMARY_END===/);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }

    // Parse medicines
    const recommendedMedicines: { name: string; dosage: string; duration: string }[] = [];
    const medicinesMatch = fullResponse.match(/===MEDICINES_START===([\s\S]*?)===MEDICINES_END===/);
    if (medicinesMatch) {
      const lines = medicinesMatch[1].trim().split('\n').filter((l: string) => l.trim() && l.includes('|'));
      for (const line of lines) {
        const parts = line.split('|').map((p: string) => p.trim());
        if (parts.length >= 3) {
          recommendedMedicines.push({
            name: parts[0],
            dosage: parts[1],
            duration: parts[2],
          });
        }
      }
    }

    // Parse diagnosis
    let diagnosis = '';
    const diagnosisMatch = fullResponse.match(/===DIAGNOSIS_START===([\s\S]*?)===DIAGNOSIS_END===/);
    if (diagnosisMatch) {
      diagnosis = diagnosisMatch[1].trim();
    }

    return new Response(
      JSON.stringify({ summary, recommendedMedicines, diagnosis }),
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
