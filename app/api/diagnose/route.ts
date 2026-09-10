import { NextRequest, NextResponse } from "next/server";
import { identifyPlantHealth } from "@/lib/plantid";
import { generateDiagnosisExplanation } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageBase64 = "";
    let symptoms: string[] = [];
    let growthStage = "";
    let weatherCondition = "";
    let affectedPart = "";
    let notes = "";
    let farmId = "";
    let fieldId = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      if (file) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = file.type || "image/jpeg";
        imageBase64 = `data:${mimeType};base64,${base64}`;
      } else {
        const directBase64 = formData.get("image_base64") as string | null;
        if (directBase64) imageBase64 = directBase64;
      }

      const symptomsStr = formData.get("symptoms") as string | null;
      if (symptomsStr) {
        try {
          symptoms = JSON.parse(symptomsStr);
        } catch {
          symptoms = symptomsStr.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      growthStage = (formData.get("growth_stage") as string) || "";
      weatherCondition = (formData.get("weather_condition") as string) || "";
      affectedPart = (formData.get("affected_part") as string) || "";
      notes = (formData.get("notes") as string) || "";
      farmId = (formData.get("farm_id") as string) || "";
      fieldId = (formData.get("field_id") as string) || "";
    } else {
      const json = await request.json();
      imageBase64 = json.image_base64 || json.image || "";
      symptoms = Array.isArray(json.symptoms) ? json.symptoms : [];
      growthStage = json.growth_stage || "";
      weatherCondition = json.weather_condition || "";
      affectedPart = json.affected_part || "";
      notes = json.notes || "";
      farmId = json.farm_id || "";
      fieldId = json.field_id || "";
    }

    if (!imageBase64 && symptoms.length === 0 && !notes) {
      return NextResponse.json(
        { error: "Please provide a tomato plant image or observed symptoms to diagnose." },
        { status: 400 }
      );
    }

    // Step 1: Plant.id Vision Identification
    const plantIdResult = await identifyPlantHealth(imageBase64, symptoms, notes);

    // Step 2: Gemini Explanation, Severity Assessment & Action Plan
    const diagnosisResponse = await generateDiagnosisExplanation({
      plantIdResult,
      symptoms,
      growthStage,
      weatherCondition,
      affectedPart,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...diagnosisResponse,
        farm_id: farmId,
        field_id: fieldId,
        image_url: imageBase64,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Diagnosis route error:", error);
    return NextResponse.json(
      {
        error: "Failed to process tomato plant diagnosis",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
