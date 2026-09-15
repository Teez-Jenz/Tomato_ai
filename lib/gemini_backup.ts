/*
import { GoogleGenAI } from "@google/genai";
import { DiagnosisResponse, PlantIdResult, SeverityLevel } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Google GenAI client if key exists
function getGeminiClient(): GoogleGenAI | null {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length === 0) {
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
 * Generates an agronomic explanation, severity rating, and action plan based on Plant.id diagnosis
 */
/*export async function generateDiagnosisExplanation(input: DiagnosisInput): Promise<DiagnosisResponse> {
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

            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                },
            });

            const responseText = response.text;
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
            console.warn("Gemini API call failed or timed out, falling back to expert rule engine:", error);
        }
    }

    // Resilient expert agronomic fallback engine
    return generateFallbackExplanation(topMatch, confidencePercent, input);
}

/**
 * Handles conversational follow-up questions from the farmer grounded in the diagnosis context
 */
/*export async function generateFarmerChatReply(
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
            const systemPrompt = `
You are the Tomato AI Farm Assistant, a friendly, practical, and highly knowledgeable agronomist supporting smallholder and commercial tomato farmers.
The farmer has a current diagnosis:
- Disease: ${diagnosisContext?.diagnosis || "Tomato Plant Health Inquiry"}
- Severity: ${diagnosisContext?.severity || "Unknown"}
- Explanation: ${diagnosisContext?.explanation || "None"}
- Recommended Action Plan: ${diagnosisContext?.action_plan?.join("; ") || "General crop maintenance"}

Give direct, practical advice. Use simple agricultural terms, mention organic or easily accessible remedies (like neem oil, baking soda wash, copper fungicides, proper spacing, mulching, drip irrigation), and address tropical and temperate climate farming contexts where appropriate. Keep answers concise (2-4 paragraphs max).
`;

            const contents = [
                { role: "user", parts: [{ text: `${systemPrompt}\n\nFarmer asks: ${userMessage}` }] },
            ];

            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
            });

            if (response.text) {
                return response.text;
            }
        } catch (err) {
            console.warn("Gemini chat error, using conversational fallback:", err);
        }
    }

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
    const q = question.toLowerCase();
    const diag = diagnosisContext?.diagnosis || "tomato issue";

    if (q.includes("harvest") || q.includes("eat") || q.includes("safe")) {
        return `Regarding harvesting with **${diag}**: You can safely harvest and eat undamaged, firm green or red tomatoes from the plant, provided they show no rotten sunken spots or mold. Always wash harvested tomatoes thoroughly. Any fruits showing signs of decay or fungal lesions should be discarded.`;
    }

    if (q.includes("spray") || q.includes("chemical") || q.includes("organic") || q.includes("fungicide")) {
        return `For treating **${diag}**, here are effective options:\n\n1. **Organic Solution:** Neem oil spray (5ml per liter of water with a drop of mild dish soap) helps control insect vectors and mild fungal pathogens. Baking soda spray (1 tablespoon baking soda + 1 tablespoon vegetable oil in 4 liters of water) helps curb fungal spread.\n\n2. **Standard Fungicide:** Fixed copper fungicides (such as copper hydroxide or copper oxychloride) are widely accessible and effective for both early blight and bacterial spots when applied proactively on dry foliage.\n\nAlways spray early in the morning or late afternoon to prevent leaf burn!`;
    }

    if (q.includes("water") || q.includes("rain") || q.includes("irrigation")) {
        return `Water management is critical for **${diag}**. Fungal spores require moisture to germinate on leaf surfaces. \n\n- **Crucial Rule:** Always water at the root base using furrow or drip irrigation, never overhead with sprinklers or hoses splashing soil onto lower foliage.\n- **Mulch:** Add 5–8cm of dry grass, straw, or wood shavings to keep soil moisture uniform and prevent rain splash.`;
    }

    if (q.includes("spread") || q.includes("neighbor") || q.includes("field")) {
        return `To prevent **${diag}** from spreading across your entire tomato field:\n\n1. Remove and destroy affected leaves immediately—do not drop them into field walkways.\n2. Wash and sanitize your pruning tools in 70% alcohol or diluted bleach between plants.\n3. Create buffer spacing if planting density is high to maximize sunlight and rapid drying after morning dew.`;
    }

    return `For your tomato plants affected by **${diag}** (severity: ${diagnosisContext?.severity || "Moderate"}), the top priority is prompt sanitation and moisture control. Ensure you remove the infected plant parts, apply a protective copper or bio-spray, and water strictly at soil level. If you have any specific question about pruning, organic sprays, or field spacing, feel free to ask!`;
}
*/