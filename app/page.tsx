"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ScanSearch, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Sprout, 
  Activity, 
  Layers, 
  HelpCircle,
  Database,
  ChevronRight
} from "lucide-react";

export default function HomePage() {
  const commonDiseases = [
    {
      name: "Early Blight",
      pathogen: "Alternaria solani",
      badge: "High Risk in Rain",
      badgeColor: "bg-rose-100 text-rose-800",
      description: "Characterized by brown concentric target rings on lower leaves, spreading upward rapidly during wet periods.",
      actionHint: "Prune lower foliage, avoid sprinkler watering, apply copper fungicide.",
    },
    {
      name: "Tomato Yellow Leaf Curl",
      pathogen: "Begomovirus (TYLCV)",
      badge: "Vector: Whiteflies",
      badgeColor: "bg-amber-100 text-amber-800",
      description: "Upward cupping and chlorotic margins on young leaves, causing stunted growth and severe fruit drop.",
      actionHint: "Deploy yellow sticky cards, apply organic neem extract, rogue stunted plants.",
    },
    {
      name: "Blossom End Rot",
      pathogen: "Physiological / Calcium",
      badge: "Nutrient Stress",
      badgeColor: "bg-blue-100 text-blue-800",
      description: "Dark, sunken, leathery bottom on tomato fruits caused by erratic moisture fluctuation and localized calcium deficit.",
      actionHint: "Establish consistent drip irrigation, apply foliar calcium, mulch soil bed.",
    },
    {
      name: "Late Blight",
      pathogen: "Phytophthora infestans",
      badge: "Critical Outbreak",
      badgeColor: "bg-purple-100 text-purple-800",
      description: "Water-soaked dark lesions with pale white mildew underneath foliage under cool, high-humidity weather.",
      actionHint: "Destroy infected plants immediately; protect healthy rows with bio-fungicide.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Next.js + Supabase + Plant.id + Gemini Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Protect Your <span className="text-emerald-700">Tomato Crops</span> with Dual-Engine AI
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Empowering smallholder tomato farmers with precision plant vision. Upload a photo of your leaf or fruit to receive instant disease identification from <strong className="text-slate-800">Plant.id</strong> and a clear, farmer-friendly action plan from <strong className="text-slate-800">Google Gemini</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/diagnose"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition group cursor-pointer"
                >
                  <ScanSearch className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Diagnose a Tomato Plant</span>
                  <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-base shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Open Farmer Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 font-medium leading-tight">Plant.id Computer Vision</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 font-medium leading-tight">Gemini Agronomic Plans</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 font-medium leading-tight">Field & Farm Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-emerald-950/10">
                {/* Visual badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍅</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Live AI Diagnostic Model</h4>
                      <p className="text-[11px] text-slate-500">Field A • Roma Tomatoes</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
                    Moderate Severity
                  </span>
                </div>

                {/* Simulated image scan box */}
                <div className="relative mt-4 h-48 rounded-2xl bg-gradient-to-tr from-emerald-950 to-slate-900 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  {/* Scan beam */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-scan-beam" />
                  
                  <div className="relative z-10 text-center space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <Sprout className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-medium text-emerald-100">Computer Vision Scanning Target...</p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-300/80">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-700">89% Match</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-700">Alternaria solani</span>
                    </div>
                  </div>
                </div>

                {/* Output breakdown */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Identified Disease:</span>
                    <span className="font-bold text-rose-600">Early Blight</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    &quot;Concentric target rings observed on lower leaves. Spores spreading via soil splash.&quot;
                  </p>
                  
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Gemini Generated Action Plan:</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">1.</span>
                        <span>Prune infected lower foliage immediately</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">2.</span>
                        <span>Switch from sprinklers to drip root watering</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Architecture Pipeline */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">School Project Architecture</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Dual-AI Academic Workflow
            </h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Separating specialized computer vision from generative reasoning ensures precise disease diagnosis with practical, human-comprehensible advisory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Image Upload</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Farmer captures or uploads a leaf or fruit picture along with optional crop age, watering notes, and symptom flags.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg mb-4 shadow-md shadow-emerald-600/20">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Plant.id Vision Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialized botanical AI analyzes pathogens, leaf tissue lesions, and probability ratings without bias.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-lg mb-4 shadow-md shadow-teal-600/20">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Google Gemini Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Synthesizes Plant.id findings into a plain-language explanation, severity gauge, and prioritized actionable checklist.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-extrabold text-lg mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Supabase & AI Chat</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Saves to diagnosis history and opens a contextual chat so the farmer can ask direct questions about remedies and harvesting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Tomato Diseases Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Knowledge Base</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">Common Tomato Diseases Covered</h3>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                The model is tuned for both tropical and temperate tomato cultivation threats.
              </p>
            </div>
            <Link
              href="/diagnose"
              className="mt-4 md:mt-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <span>Test with a sample diagnosis</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {commonDiseases.map((d, i) => (
              <div key={i} className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">🍅</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${d.badgeColor}`}>
                      {d.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{d.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400 italic mb-2">{d.pathogen}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Recommended Action</span>
                  <p className="text-xs font-medium text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">{d.actionHint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to inspect your tomato field?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base">
            Upload an image or select one of our built-in leaf disease samples to watch the Plant.id and Gemini dual-engine in action.
          </p>
          <div className="pt-2">
            <Link
              href="/diagnose"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-base shadow-lg transition"
            >
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Start Free Diagnosis</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
