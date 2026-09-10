import { NextRequest, NextResponse } from "next/server";
import { generateFarmerChatReply } from "@/lib/gemini";
import { ChatRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "A message is required for the AI chat assistant." },
        { status: 400 }
      );
    }

    const reply = await generateFarmerChatReply(
      body.message,
      body.diagnosis_context,
      body.history
    );

    return NextResponse.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
