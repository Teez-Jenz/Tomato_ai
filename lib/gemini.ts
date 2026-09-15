import { GoogleGenAI } from "@google/genai";
import { DiagnosisResponse, PlantIdResult, SeverityLevel } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// List of supported Gemini models in order of priority
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
];

// Initialize Google GenAI client if key exists
function getGeminiClient(): GoogleGenAI | null {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length === 0) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

interface DiagnosisInput {
  plantIdResult: PlantIdResult;
  symptoms?: string[];
  growthStage?: string;
  weatherCondition?: string;
  affectedPart?: string;
  notes?: string;
}

/**
 * Sanitizes chat history so it strictly conforms to Gemini API requirements:
 * 1. The first turn MUST be 'user' (removes any leading 'model' welcome message).
 * 2. Roles MUST strictly alternate (user -> model -> user).
 * 3. Empty messages are omitted.
 */
function buildSanitizedContents(
  history: { role: "user" | "model"; parts: string }[] | undefined,
  userMessage: string
) {
  const rawList = [
    ...(history || []).map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("model" as const),
      text: typeof h.parts === "string" ? h.parts : "",
    })),
    { role: "user" as const, text: userMessage },
  ];

  // 1. Remove leading model messages (e.g. static UI greetings)
  while (rawList.length > 0 && rawList[0].role === "model") {
    rawList.shift();
  }

  // 2. Ensure strictly alternating user/model turns
  const sanitized: { role: "user" | "model"; parts: [{ text: string }] }[] = [];
  for (const item of rawList) {
    const trimmed = item.text.trim();
    if (!trimmed) continue;

    if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === item.role) {
      sanitized[sanitized.length - 1].parts[0].text += `\n\n${trimmed}`;
    } else {
      sanitized.push({
        role: item.role,
        parts: [{ text: trimmed }],
      });
    }
  }

  // Fallback: at least send current user message
  if (sanitized.length === 0) {
    sanitized.push({
      role: "user",
      parts: [{ text: userMessage.trim() || "Hello" }],
    });
  }

  return sanitized;
}

/**
 * Helper to call Gemini generateContent with automatic model fallback
 */
async function callGeminiWithFallback(
  client: GoogleGenAI,
  params: {
    contents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"];
    config?: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["config"];
  }
) {
  let lastError: unknown = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: unknown) {
      console.warn(`Gemini model ${model} attempt failed:`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }
  throw lastError || new Error("All candidate Gemini models failed to respond.");
}

/**
 * Generates an agronomic explanation, severity rating, and action plan based on Plant.id diagnosis
 */
export async function generateDiagnosisExplanation(input: DiagnosisInput): Promise<DiagnosisResponse> {
  const topMatch = input.plantIdResult.suggestions[0]?.name || "Unidentified Condition";
  const confidencePercent = Math.min(99, Math.round((input.plantIdResult.suggestions[0]?.probability || 0.85) * 100));
  const isHealthy = input.plantIdResult.is_healthy || topMatch.toLowerCase().includes("healthy");

  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `
You are an expert agronomist specializing in tomato farming.
Plant.id (the specialized plant vision diagnostic engine) has identified the following condition:
- Diagnosis from Plant.id: "${topMatch}" (Confidence: ${confidencePercent}%)
- Observed farmer symptoms: ${input.symptoms?.join(", ") || "None specified"}
- Plant Growth Stage: ${input.growthStage || "Not specified"}
- Weather/Watering Conditions: ${input.weatherCondition || "Not specified"}
- Affected Plant Part: ${input.affectedPart || "Not specified"}
- Farmer Notes: ${input.notes || "None"}

IMPORTANT INSTRUCTION:
Do not override Plant.id's primary diagnosis. Your role is to explain Plant.id's diagnosis in clear, practical, farmer-friendly terms, assess the severity, and provide an actionable, prioritized management plan.

Return your response strictly as valid JSON with these exact fields:
{
  "diagnosis": "${topMatch}",
  "severity": "Low" | "Moderate" | "High" | "Critical",
  "confidence": ${confidencePercent},
  "explanation": "2-3 plain-language sentences explaining the condition and why it matches the symptoms",
  "action_plan": [
    "Immediate action step 1",
    "Action step 2",
    "Action step 3",
    "Action step 4"
  ],
  "cultural_controls": [
    "Preventative cultural measure 1",
    "Preventative cultural measure 2"
  ],
  "symptoms_detected": [
    "symptom 1",
    "symptom 2"
  ],
  "warning": "This is an AI-assisted assessment. If symptoms worsen, consult an agricultural professional or local extension agent."
}
Only output the JSON object, with no extra markdown ticks or surrounding text.
`;

      const response = await callGeminiWithFallback(client, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response?.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          diagnosis: parsed.diagnosis || topMatch,
          severity: parsed.severity || determineSeverity(topMatch, isHealthy),
          confidence: parsed.confidence || confidencePercent,
          explanation: parsed.explanation || `The image and reported symptoms are consistent with ${topMatch}.`,
          action_plan: Array.isArray(parsed.action_plan) ? parsed.action_plan : getDefaultActionPlan(topMatch),
          warning: parsed.warning || "This is an AI-assisted assessment. If symptoms worsen, consult an agricultural professional.",
          symptoms_detected: parsed.symptoms_detected || input.symptoms || [],
          cultural_controls: parsed.cultural_controls || getDefaultCulturalControls(topMatch),
          plant_id_raw: {
            top_match: topMatch,
            probability: input.plantIdResult.suggestions[0]?.probability || 0.85,
          },
        };
      }
    } catch (error) {
      console.warn("Gemini diagnosis API call failed, falling back to expert rule engine:", error);
    }
  }

  // Resilient expert agronomic fallback engine
  return generateFallbackExplanation(topMatch, confidencePercent, input);
}

/**
 * Handles conversational follow-up questions from the farmer with flexible, conversational intelligence
 */
export async function generateFarmerChatReply(
  userMessage: string,
  diagnosisContext?: {
    diagnosis: string;
    severity: SeverityLevel;
    explanation: string;
    action_plan: string[];
    symptoms?: string[];
  },
  history?: { role: "user" | "model"; parts: string }[]
): Promise<string> {
  const client = getGeminiClient();

  if (client) {
    try {
      const diagnosis = diagnosisContext?.diagnosis || "General Tomato Health";
      const severity = diagnosisContext?.severity || "Unspecified";

      const systemInstruction = `You are Tomato AI Assistant & Agronomist, a friendly, helpful, and highly knowledgeable agricultural companion.

CURRENT DIAGNOSIS CONTEXT:
- Condition: ${diagnosis}
- Severity: ${severity}
- Overview: ${diagnosisContext?.explanation || "No previous diagnosis summary available."}
- Recommended Actions: ${diagnosisContext?.action_plan?.join("; ") || "Standard tomato care practices"}
- Detected Symptoms: ${diagnosisContext?.symptoms?.join(", ") || "None"}

CORE PRINCIPLES:
1. **Be Flexible & Responsive**: Answer WHATEVER the user asks. If the user asks you to explain the disease, asks a question about causes, symptoms, sprays, fertilizers, watering, spacing, varieties, or says hello, respond thoroughly, naturally, and warmly.
2. **Context Awareness**: Use the current plant diagnosis context when relevant to their question, but do NOT force it if the user is asking about an unrelated gardening or farming topic.
3. **Clear & Actionable Advice**: When answering agronomic questions, provide practical, step-by-step, easy-to-understand solutions with dosage guidelines, safety precautions, and preventative measures.
4. **Accessible Language**: Keep explanations clear for farmers and home gardeners of all skill levels. If technical terms are used (like pathogens or chlorosis), explain what they mean in simple words.
5. **Formatting**: Use clean Markdown formatting (headings, bullet points, bold highlights, concise numbered steps) to make advice easy to scan and read.`;

      // Build sanitized conversation contents with alternating turns starting with 'user'
      const contents = buildSanitizedContents(history, userMessage);

      const response = await callGeminiWithFallback(client, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      });

      if (response?.text) {
        return response.text.trim();
      }

      throw new Error("Gemini returned an empty response.");
    } catch (err) {
      console.error("Gemini chat API error (falling back to rule engine):", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.warn("Gemini client unavailable or API failed - using conversational fallback");

  // Conversational Agronomist Fallback
  return getConversationalFallback(userMessage, diagnosisContext);
}

function determineSeverity(diagnosis: string, isHealthy: boolean): SeverityLevel {
  if (isHealthy) return "Low";
  const lower = diagnosis.toLowerCase();
  if (lower.includes("late blight") || lower.includes("fusarium")) return "Critical";
  if (lower.includes("early blight") || lower.includes("virus") || lower.includes("tylcv")) return "High";
  if (lower.includes("bacterial spot") || lower.includes("septoria") || lower.includes("blossom end rot")) return "Moderate";
  return "Low";
}

function getDefaultActionPlan(diagnosis: string): string[] {
  const lower = diagnosis.toLowerCase();
  if (lower.includes("early blight")) {
    return [
      "Prune and safely destroy lower leaves exhibiting dark target-like spots.",
      "Avoid overhead watering; switch to furrow or drip irrigation to keep foliage dry.",
      "Apply organic copper-based fungicide or bio-fungicide (Trichoderma) across unaffected foliage.",
      "Apply clean straw or plastic mulch around the plant base to stop soil splash.",
    ];
  }
  if (lower.includes("late blight")) {
    return [
      "Immediately rogue and bury/burn heavily infected plants to stop rapid airborne spore spread.",
      "Do not compost infected tomato debris.",
      "Apply protective copper hydroxide or systemic fungicide to all nearby healthy tomatoes.",
      "Ensure maximum airflow between rows and delay any overhead irrigation.",
    ];
  }
  if (lower.includes("curl virus") || lower.includes("tylcv")) {
    return [
      "Control silverleaf whitefly populations using yellow sticky traps and neem oil sprays.",
      "Uproot and destroy severely stunted plants to prevent transmission to the rest of the field.",
      "Intercrop with repellent plants (like basil or African marigold).",
      "For future plantings, select certified TYLCV-resistant tomato cultivars.",
    ];
  }
  if (lower.includes("blossom end rot")) {
    return [
      "Establish a consistent, regular watering schedule to avoid alternating soil drought and soaking.",
      "Perform a foliar spray of calcium chloride or soluble calcium nitrate during fruit set.",
      "Mulch beds deeply to retain steady soil moisture levels.",
      "Avoid excessive high-nitrogen fertilizers that promote rapid leafy growth at the expense of calcium uptake.",
    ];
  }
  if (lower.includes("healthy")) {
    return [
      "Maintain current watering and balanced fertilization regimen.",
      "Continue weekly scouting for early insect vectors (whiteflies, aphids).",
      "Ensure proper plant staking and ventilation as foliage develops.",
    ];
  }
  return [
    "Isolate affected plants and monitor adjacent rows daily.",
    "Remove and dispose of diseased plant tissue away from the field.",
    "Ensure adequate spacing and water directly at the base of plants.",
    "Consult with local agricultural extension workers if symptoms intensify.",
  ];
}

function getDefaultCulturalControls(diagnosis: string): string[] {
  const lower = diagnosis.toLowerCase();
  if (lower.includes("blight")) {
    return [
      "Practice 3-to-4 year crop rotation away from solanaceous plants (tomatoes, peppers, eggplants).",
      "Sterilize shears with 70% rubbing alcohol between each plant.",
      "Apply 5-8cm of mulch to eliminate soil splash during rainfall.",
    ];
  }
  return [
    "Practice 3-year crop rotation (do not plant tomatoes, peppers, or potatoes consecutively).",
    "Disinfect pruning shears with a 10% bleach or rubbing alcohol solution between plants.",
    "Promote healthy soil biology with well-rotted compost and balanced organic matter.",
  ];
}

function generateFallbackExplanation(
  topMatch: string,
  confidence: number,
  input: DiagnosisInput
): DiagnosisResponse {
  const isHealthy = topMatch.toLowerCase().includes("healthy");
  const severity = determineSeverity(topMatch, isHealthy);
  const actionPlan = getDefaultActionPlan(topMatch);
  const culturalControls = getDefaultCulturalControls(topMatch);

  let explanation = `Based on the visual patterns and the reported symptoms (${input.symptoms?.join(", ") || "observed spots/changes"}), the plant exhibits hallmark characteristics of ${topMatch}.`;
  if (isHealthy) {
    explanation = "The plant demonstrates strong vegetative vigor with clean green foliage and no visible indicators of destructive fungal or bacterial pathogens.";
  }

  return {
    diagnosis: topMatch,
    severity,
    confidence,
    explanation,
    action_plan: actionPlan,
    cultural_controls: culturalControls,
    symptoms_detected: input.symptoms && input.symptoms.length > 0 ? input.symptoms : ["Leaf discoloration", "Tissue spotting"],
    warning: "This is an AI-assisted assessment. If symptoms worsen or spread quickly across your tomato crop, consult an agricultural extension officer.",
    plant_id_raw: {
      top_match: topMatch,
      probability: confidence / 100,
    },
  };
}

function getConversationalFallback(
  question: string,
  diagnosisContext?: {
    diagnosis: string;
    severity: SeverityLevel;
    explanation: string;
    action_plan: string[];
    symptoms?: string[];
  }
): string {
  const q = question.toLowerCase().trim();
  const diag = diagnosisContext?.diagnosis || "tomato plant issue";
  const lowerDiag = diag.toLowerCase();

  // Greetings & casual check-ins
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)/i.test(q) || q === "hello" || q === "hi") {
    return `Hello! 👋 I'm your Tomato AI Assistant.\n\nI'm here to help with your current diagnosis (**${diag}**), as well as any questions about watering, fertilization, organic sprays, pruning, pest control, or general tomato farming.\n\nWhat would you like to know?`;
  }

  // Explanations, identification, causes, and disease details
  if (q.includes("explain") || q.includes("what is") || q.includes("tell me about") || q.includes("cause") || q.includes("symptom") || q.includes("why")) {
    if (lowerDiag.includes("early blight") || q.includes("early blight")) {
      return `### Understanding Early Blight (*Alternaria solani*)\n\n**Early Blight** is a widespread fungal disease that primarily attacks older, lower tomato foliage first:\n\n- **Hallmark Symptom:** Dark brown or black circular spots with distinctive **concentric rings** (a "bullseye" pattern), surrounded by a yellow halo.\n- **How It Spreads:** Fungal spores survive in the soil and on crop debris, splashing onto lower leaves during rainfall or overhead watering.\n- **Management:** Prune off affected lower leaves immediately, mulch the ground to prevent soil splash, avoid wetting foliage, and apply a protective copper-based or bio-fungicide spray.`;
    }
    if (lowerDiag.includes("late blight") || q.includes("late blight")) {
      return `### Understanding Late Blight (*Phytophthora infestans*)\n\n**Late Blight** is an aggressive, water-mold pathogen that can destroy entire tomato crops rapidly:\n\n- **Hallmark Symptom:** Large, water-soaked dark brown or purplish-black lesions that spread quickly across leaves and stems, often with white fungal fuzz underneath in humid weather.\n- **How It Spreads:** Airborne spores travel on the wind during cool, damp, rainy periods.\n- **Management:** Rogue and destroy heavily infected plants immediately, keep leaves dry, and spray surrounding healthy plants with protective copper or systemic fungicides.`;
    }
    if (lowerDiag.includes("virus") || lowerDiag.includes("tylcv") || q.includes("virus")) {
      return `### Understanding Tomato Yellow Leaf Curl Virus (TYLCV)\n\n- **Hallmark Symptom:** Upward curling and yellowing of leaf margins, severe plant stunting, and bushy growth with poor fruit set.\n- **How It Spreads:** Transmitted by silverleaf whiteflies (*Bemisia tabaci*).\n- **Management:** Control whiteflies with yellow sticky traps and neem oil, pull out severely infected plants, and plant resistant varieties in subsequent seasons.`;
    }
    if (lowerDiag.includes("blossom end rot") || q.includes("blossom end rot")) {
      return `### Understanding Blossom End Rot\n\n- **Cause:** A physiological calcium deficiency in developing fruits, almost always triggered by irregular watering (alternating soil drying and heavy soaking).\n- **Hallmark Symptom:** A sunken, leathery, dark black spot at the blossom end (bottom) of ripening fruits.\n- **Management:** Maintain consistent soil moisture, mulch the root zone, and apply foliar calcium if soil testing confirms low calcium availability.`;
    }
    return `### About **${diag}**\n\n- **Severity:** ${diagnosisContext?.severity || "Moderate"}\n- **Summary:** ${diagnosisContext?.explanation || "This condition affects tomato foliage and fruit vigor."}\n- **Key Actions:** ${diagnosisContext?.action_plan?.join("; ") || "Remove diseased leaves, sanitize tools, and water strictly at the soil level."}`;
  }

  // Harvesting & food safety
  if (q.includes("harvest") || q.includes("eat") || q.includes("safe") || q.includes("fruit") || q.includes("consumption")) {
    return `Regarding harvesting with **${diag}**:\n\n- **Safe Fruits:** You can safely harvest and consume firm, healthy tomatoes from the plant that show no signs of rot, spots, or fungal lesions. Wash thoroughly before eating.\n- **Infected Fruits:** Discard any fruits showing dark lesions, sunken watery spots, or rot—do not eat or compost them.\n- **Early Harvest:** If disease pressure is high in your area, consider harvesting mature green tomatoes and ripening them indoors.`;
  }

  // Sprays, fungicides, organic remedies
  if (q.includes("spray") || q.includes("chemical") || q.includes("organic") || q.includes("fungicide") || q.includes("pesticide") || q.includes("neem") || q.includes("baking soda")) {
    return `Treatment and spray recommendations for **${diag}**:\n\n1. **Organic Neem Oil:** Mix 5ml cold-pressed neem oil + 1 tsp mild liquid soap per liter of water. Spray top and underside of leaves every 7–10 days.\n2. **Baking Soda Spray (Preventative):** 1 tablespoon baking soda + 1 tablespoon vegetable oil + a few drops of dish soap in 4 liters of water.\n3. **Copper-based Fungicides:** Fixed copper (copper hydroxide/oxychloride) helps protect uninfected leaves against fungal and bacterial spread.\n\n*Tip:* Always spray early in the morning or late afternoon when sun is low to prevent leaf scorching.`;
  }

  // Watering & Irrigation
  if (q.includes("water") || q.includes("rain") || q.includes("irrigation") || q.includes("moisture") || q.includes("drought")) {
    return `Water management guidelines for **${diag}**:\n\n- **Water at the Base:** Always irrigate at the soil level (drip or furrow). Avoid overhead sprinklers or watering leaves directly, as leaf wetness accelerates disease.\n- **Timing:** Water in the early morning so any accidental splashes dry quickly.\n- **Mulching:** Spread 5–8cm of organic mulch (dry straw, leaves) around plants to stabilize soil moisture and prevent fungal spores from splashing up from the soil.`;
  }

  // Fertilizers & Soil
  if (q.includes("fertiliz") || q.includes("manure") || q.includes("compost") || q.includes("npk") || q.includes("calcium") || q.includes("soil")) {
    return `Fertilization and soil recommendations:\n\n- **Balanced Nutrition:** For vegetative growth, use a balanced organic compost or 10-10-10 fertilizer. During flowering and fruiting, shift to higher potassium (K) and phosphorus (P) to support fruit set.\n- **Calcium & Magnesium:** Ensure adequate calcium (such as bone meal or calcium nitrate) to prevent Blossom End Rot.\n- **Avoid Excess Nitrogen:** Too much nitrogen produces leafy green foliage but makes plants more susceptible to fungal attacks and insect pests.`;
  }

  // Spread & Prevention
  if (q.includes("spread") || q.includes("neighbor") || q.includes("field") || q.includes("prevent") || q.includes("protect")) {
    return `To prevent **${diag}** from spreading:\n\n1. **Pruning:** Remove and safely dispose of infected foliage (burn or seal in trash, do not compost).\n2. **Disinfect Tools:** Clean pruning shears with 70% alcohol or diluted bleach between plants.\n3. **Airflow:** Maintain adequate spacing between plants (45–60cm) to allow air circulation and fast leaf drying.\n4. **Scout Daily:** Inspect nearby healthy plants regularly to catch early signs promptly.`;
  }

  // General fallback
  return `Regarding your inquiry about **${diag}** (severity: ${diagnosisContext?.severity || "Moderate"}):\n\nKey steps to manage your crop effectively:\n1. **Sanitation:** Remove and dispose of noticeably diseased leaves promptly.\n2. **Moisture Control:** Keep foliage dry and irrigate strictly at the soil base.\n3. **Protection:** Apply protective organic neem or copper-based spray as appropriate.\n\nFeel free to ask more specific questions about fungicides, watering schedules, organic recipes, fertilizers, or pruning!`;
}
