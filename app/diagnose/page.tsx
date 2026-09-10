"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Camera, 
  Sprout, 
  Droplets, 
  Info, 
  ChevronDown, 
  CheckSquare, 
  Square, 
  History as HistoryIcon,
  ShieldCheck,
  HelpCircle,
  FileText
} from "lucide-react";
import { storage } from "@/lib/storage";
import { Farm, Field, DiagnosisResponse, DiagnosisRecord, SeverityLevel } from "@/types";
import DiagnosisChat from "@/components/DiagnosisChat";

// High-fidelity SVG Leaf Presets for instant testing & school demonstration
const SAMPLE_PRESETS = [
  {
    id: "early-blight-preset",
    name: "Early Blight Leaf",
    subtitle: "Dark target rings on lower foliage",
    symptoms: ["Concentric brown target spots", "Yellow leaf margins", "Lower leaf spotting"],
    growthStage: "Fruiting",
    weatherCondition: "High humidity after rain",
    affectedPart: "Lower leaves",
    notes: "Brown target spots spreading up from bottom leaves after recent showers.",
    svgColor: "#b45309",
    spotPattern: "concentric",
  },
  {
    id: "late-blight-preset",
    name: "Late Blight Outbreak",
    subtitle: "Water-soaked dark lesions with fuzzy underside",
    symptoms: ["Water-soaked dark lesions", "Stem browning", "White fuzzy mold underneath"],
    growthStage: "Flowering",
    weatherCondition: "Cool, damp rainy weather",
    affectedPart: "Upper leaves and stems",
    notes: "Rapidly expanding water-soaked black-brown areas.",
    svgColor: "#4c1d95",
    spotPattern: "soaked",
  },
  {
    id: "tylcv-preset",
    name: "Yellow Leaf Curl Virus",
    subtitle: "Upward cupping leaves & stunted shoot",
    symptoms: ["Upward curling leaves", "Yellow leaf margins", "Stunted growth"],
    growthStage: "Vegetative",
    weatherCondition: "Warm, dry with whiteflies",
    affectedPart: "New shoots and upper leaves",
    notes: "Leaves curling into cup shape, growth stopped.",
    svgColor: "#ca8a04",
    spotPattern: "curled",
  },
  {
    id: "healthy-preset",
    name: "Vigorous Healthy Leaf",
    subtitle: "Clean green foliage, zero spots",
    symptoms: ["Healthy green foliage"],
    growthStage: "Flowering",
    weatherCondition: "Moderate sunshine, drip irrigation",
    affectedPart: "Entire plant",
    notes: "Leaves look vibrant, checking routine vigor.",
    svgColor: "#15803d",
    spotPattern: "clean",
  },
];

export default function DiagnosePage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");

  // Input states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [growthStage, setGrowthStage] = useState<string>("Fruiting");
  const [weatherCondition, setWeatherCondition] = useState<string>("High humidity / recent rain");
  const [affectedPart, setAffectedPart] = useState<string>("Lower leaves");
  const [notes, setNotes] = useState<string>("");

  // Process & Result states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [savedRecord, setSavedRecord] = useState<DiagnosisRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fList = storage.getFarms();
    const fiList = storage.getFields();
    setFarms(fList);
    setFields(fiList);
    if (fList.length > 0) {
      setSelectedFarmId(fList[0].id);
      const farmFields = fiList.filter((f) => f.farm_id === fList[0].id);
      if (farmFields.length > 0) {
        setSelectedFieldId(farmFields[0].id);
      }
    }
  }, []);

  const handleFarmChange = (fId: string) => {
    setSelectedFarmId(fId);
    const farmFields = fields.filter((f) => f.farm_id === fId);
    if (farmFields.length > 0) {
      setSelectedFieldId(farmFields[0].id);
    } else {
      setSelectedFieldId("");
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    // Generate an illustrative canvas leaf dataURL
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 400, 300);

      // Draw leaf shape
      ctx.beginPath();
      ctx.ellipse(200, 150, 140, 90, 0.2, 0, 2 * Math.PI);
      ctx.fillStyle = preset.spotPattern === "clean" ? "#16a34a" : "#65a30d";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#15803d";
      ctx.stroke();

      // Main vein
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(320, 140);
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pattern spots
      if (preset.spotPattern === "concentric") {
        // Target spots
        for (const [x, y, r] of [[150, 130, 22], [240, 160, 28], [210, 110, 16]]) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.fillStyle = "#78350f";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#fef08a";
          ctx.stroke();
          // Inner concentric ring
          ctx.beginPath();
          ctx.arc(x, y, r * 0.5, 0, 2 * Math.PI);
          ctx.strokeStyle = "#451a03";
          ctx.stroke();
        }
      } else if (preset.spotPattern === "soaked") {
        ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
        ctx.beginPath();
        ctx.arc(170, 140, 45, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "rgba(241, 245, 249, 0.4)";
        ctx.beginPath();
        ctx.arc(175, 145, 20, 0, 2 * Math.PI);
        ctx.fill();
      } else if (preset.spotPattern === "curled") {
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    }

    setImagePreview(canvas.toDataURL("image/jpeg"));
    setSelectedSymptoms(preset.symptoms);
    setGrowthStage(preset.growthStage);
    setWeatherCondition(preset.weatherCondition);
    setAffectedPart(preset.affectedPart);
    setNotes(preset.notes);
    setErrorMsg(null);
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleStartDiagnosis = async () => {
    if (!imagePreview && selectedSymptoms.length === 0 && !notes.trim()) {
      setErrorMsg("Please upload a tomato picture or select symptoms to diagnose.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setResult(null);
    setSavedRecord(null);

    try {
      setAnalysisStep("1/3: Analyzing tomato leaf features with Plant.id computer vision...");
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep("2/3: Synthesizing agronomic explanation and action plan via Google Gemini...");
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imagePreview || "",
          symptoms: selectedSymptoms,
          growth_stage: growthStage,
          weather_condition: weatherCondition,
          affected_part: affectedPart,
          notes: notes,
          farm_id: selectedFarmId,
          field_id: selectedFieldId,
        }),
      });

      setAnalysisStep("3/3: Finalizing treatment assessment & recommendations...");
      const data = await res.json();

      if (!res.ok || !data.data) {
        throw new Error(data.error || "Diagnosis failed");
      }

      const diagData: DiagnosisResponse = data.data;
      setResult(diagData);

      // Auto-save to Supabase & local storage
      const currentFarm = farms.find((f) => f.id === selectedFarmId);
      const currentField = fields.find((f) => f.id === selectedFieldId);

      const saved = storage.saveDiagnosis({
        farm_id: selectedFarmId,
        farm_name: currentFarm?.name || "Green Valley Farm",
        field_id: selectedFieldId,
        field_name: currentField?.name || "Field A",
        image_url: imagePreview || undefined,
        diagnosis: diagData.diagnosis,
        severity: diagData.severity,
        confidence: diagData.confidence,
        explanation: diagData.explanation,
        action_plan: diagData.action_plan,
        warning: diagData.warning,
        cultural_controls: diagData.cultural_controls,
        symptoms_detected: diagData.symptoms_detected,
      });

      setSavedRecord(saved);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to complete AI diagnosis. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleToggleTask = (itemId: string) => {
    if (!savedRecord) return;
    storage.toggleActionItem(savedRecord.id, itemId);
    const updated = storage.getDiagnosisById(savedRecord.id);
    if (updated) {
      setSavedRecord({ ...updated });
    }
  };

  const symptomsList = [
    "Concentric brown target spots",
    "Water-soaked dark lesions",
    "Upward curling leaves",
    "Small dark spots with yellow halo",
    "Lower leaf yellowing & dying",
    "White fuzzy mold underneath",
    "Sunken black bottom on fruit (BER)",
    "Daytime wilting with green leaves",
    "Stunted plant growth",
    "Healthy green foliage",
  ];

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plant.id Computer Vision + Google Gemini GenAI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Diagnose Tomato Plant Health
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload a clear photo of infected leaves, stems, or fruits for automated disease detection and action steps.
            </p>
          </div>

          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs self-start"
          >
            <HistoryIcon className="w-4 h-4 text-slate-500" />
            <span>Diagnosis History</span>
          </Link>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* 1-Click Demonstration Presets Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <h3 className="text-sm font-bold text-slate-900">
                School Evaluation / Instant Test Samples
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Click any sample to test immediately</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset)}
                className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: preset.svgColor }}
                  />
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    {preset.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                  {preset.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Form: Left Upload, Right Questionnaire */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Upload Area */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Tomato Plant Image</span>
                </h3>
                {imagePreview && (
                  <button
                    onClick={() => setImagePreview(null)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Clear Photo
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleImageUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative border-2 border-dashed rounded-2xl min-h-[260px] flex flex-col items-center justify-center p-6 text-center transition cursor-pointer overflow-hidden ${
                  imagePreview
                    ? "border-emerald-500 bg-emerald-50/20"
                    : "border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-slate-100/60"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />

                {imagePreview ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Uploaded Tomato Plant"
                      className="max-h-56 max-w-full rounded-xl object-contain shadow-md"
                    />
                    <span className="text-[11px] text-slate-500 mt-2 font-medium">
                      Click or drag a new image to replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Upload Tomato Plant Photo
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Drag and drop, browse from device, or use camera
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600">
                      JPG, PNG, WebP up to 10MB
                    </span>
                  </div>
                )}
              </div>

              {/* Farm and Field Assignment */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Farm</label>
                    <select
                      value={selectedFarmId}
                      onChange={(e) => handleFarmChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {farms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop / Field</label>
                    <select
                      value={selectedFieldId}
                      onChange={(e) => setSelectedFieldId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {fields
                        .filter((f) => !selectedFarmId || f.farm_id === selectedFarmId)
                        .map((fi) => (
                          <option key={fi.id} value={fi.id}>
                            {fi.name} ({fi.crop_type})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Agronomic Questionnaire */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Farmer Field Questions (Helps AI precision)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Answer what you observe in the field to give Plant.id and Gemini vital agronomic context.
                </p>
              </div>

              {/* Observed Symptoms Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Observed Symptoms (Check all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {symptomsList.map((sym) => {
                    const isChecked = selectedSymptoms.includes(sym);
                    return (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => toggleSymptom(sym)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{sym}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plant Growth Stage & Affected Part */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="Seedling / Nursery">Seedling / Nursery</option>
                    <option value="Vegetative Growth">Vegetative Growth</option>
                    <option value="Flowering Stage">Flowering Stage</option>
                    <option value="Fruiting Stage">Fruiting Stage</option>
                    <option value="Harvest Period">Harvest Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Plant Part</label>
                  <select
                    value={affectedPart}
                    onChange={(e) => setAffectedPart(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="Lower leaves">Lower leaves</option>
                    <option value="Upper / new leaves">Upper / new leaves</option>
                    <option value="Main stem & branches">Main stem & branches</option>
                    <option value="Green / ripe fruit">Green / ripe fruit</option>
                    <option value="Entire plant collapsing">Entire plant collapsing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weather / Watering</label>
                  <select
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="High humidity / recent rain">High humidity / Rain</option>
                    <option value="Overhead sprinkler watering">Overhead sprinkler</option>
                    <option value="Drip / Furrow irrigation">Drip / Furrow</option>
                    <option value="Hot dry sun / water stress">Hot dry sun / stress</option>
                  </select>
                </div>
              </div>

              {/* Additional Farmer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Started on 3 plants in row 4, noticed after heavy weekend showers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleStartDiagnosis}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Plant.id & Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Disease Diagnosis</span>
                  </>
                )}
              </button>

              {isAnalyzing && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-pulse">
                  <p className="text-xs font-medium text-emerald-800">{analysisStep}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis Results Display Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Header Ribbon */}
              <div
                className={`p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  result.severity === "Critical"
                    ? "bg-gradient-to-r from-red-700 to-rose-900"
                    : result.severity === "High"
                    ? "bg-gradient-to-r from-rose-600 to-amber-700"
                    : result.severity === "Moderate"
                    ? "bg-gradient-to-r from-amber-600 to-amber-800"
                    : "bg-gradient-to-r from-emerald-600 to-teal-700"
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full">
                    AI Health Assessment Result
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{result.diagnosis}</h2>
                  <p className="text-xs text-white/80 mt-0.5">
                    Plant.id top vision match with Gemini agronomic analysis
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs block text-white/80">Diagnostic Confidence</span>
                    <span className="text-2xl font-black">{result.confidence}%</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-bold uppercase">
                    {result.severity} Severity
                  </div>
                </div>
              </div>

              {/* Result Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Farmer-Friendly Explanation */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Agronomic Explanation</span>
                  </h4>
                  <p className="text-sm text-slate-800 leading-relaxed">{result.explanation}</p>
                </div>

                {/* Prioritized Action Plan Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Recommended Action Plan (Check off as you complete)</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Saved to your Farm Records
                    </span>
                  </div>

                  <div className="space-y-2">
                    {savedRecord?.action_items ? (
                      savedRecord.action_items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleTask(item.id)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                            item.completed
                              ? "bg-emerald-50/50 border-emerald-200 text-slate-500 line-through"
                              : "bg-white border-slate-200 hover:border-emerald-300 text-slate-800"
                          }`}
                        >
                          {item.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className="text-xs sm:text-sm font-medium">{item.action}</span>
                            <span
                              className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.priority === "Immediate"
                                  ? "bg-rose-100 text-rose-800"
                                  : item.priority === "Within 48 hours"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      result.action_plan.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{act}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cultural Controls / Long-term Prevention */}
                {result.cultural_controls && result.cultural_controls.length > 0 && (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                    <h5 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-teal-700" />
                      <span>Long-term Cultural Controls & Prevention</span>
                    </h5>
                    <ul className="text-xs text-teal-950 space-y-1 pl-4 list-disc">
                      {result.cultural_controls.map((ctrl, idx) => (
                        <li key={idx}>{ctrl}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety Warning */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Agricultural Disclaimer: </span>
                    <span>{result.warning}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Context-Aware AI Follow-up Chat */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Ask Gemini Follow-up Questions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Get immediate agronomist guidance specific to this {result.diagnosis} diagnosis.
                  </p>
                </div>
              </div>

              <DiagnosisChat
                diagnosisContext={{
                  diagnosis: result.diagnosis,
                  severity: result.severity,
                  explanation: result.explanation,
                  action_plan: result.action_plan,
                  symptoms: result.symptoms_detected,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
