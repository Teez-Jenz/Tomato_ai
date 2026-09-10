"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, HelpCircle, Loader2 } from "lucide-react";
import { ChatMessage, SeverityLevel } from "@/types";

interface DiagnosisChatProps {
  diagnosisContext: {
    diagnosis: string;
    severity: SeverityLevel;
    explanation: string;
    action_plan: string[];
    symptoms?: string[];
  };
}

export default function DiagnosisChat({ diagnosisContext }: DiagnosisChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: `Hello! I'm your Tomato AI Agronomist. I have reviewed the assessment for **${diagnosisContext.diagnosis}** (Severity: ${diagnosisContext.severity}). What questions do you have about treatment, watering, organic remedies, or preventing crop spread?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "Can I harvest and eat unaffected tomatoes?",
    "What organic fungicide or neem spray works best?",
    "How does overhead watering affect this disease?",
    "Will this spread to my bell peppers or potatoes?",
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          diagnosis_context: diagnosisContext,
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "assistant",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to generate reply");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "assistant",
          text: "I couldn't reach the AI service right now. Generally for this condition, ensure you isolate diseased leaves, keep foliage dry, and apply a protective copper or neem spray.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[460px] rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">AI Agronomist Follow-up</h4>
            <p className="text-[11px] text-emerald-200">Context: {diagnosisContext.diagnosis}</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-900/80 px-2 py-0.5 rounded-full text-emerald-300 border border-emerald-700">
          Powered by Gemini
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                m.sender === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-teal-100 text-teal-800 border border-teal-200"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.sender === "user"
                  ? "bg-emerald-600 text-white rounded-tr-xs"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              <span
                className={`block text-[9px] mt-1 text-right ${
                  m.sender === "user" ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Consulting agronomic knowledge base...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 font-semibold shrink-0">Quick questions:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about treatment, fungicides, watering..."
          disabled={loading}
          className="flex-1 text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
