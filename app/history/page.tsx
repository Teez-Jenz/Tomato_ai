"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from "lucide-react";
import { storage } from "@/lib/storage";
import { DiagnosisRecord, Farm } from "@/types";
import DiagnosisChat from "@/components/DiagnosisChat";

export default function HistoryPage() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedFarm, setSelectedFarm] = useState<string>("All");
  const [expandedDiagId, setExpandedDiagId] = useState<string | null>(null);
  const [activeChatDiagId, setActiveChatDiagId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setDiagnoses(storage.getDiagnoses());
    setFarms(storage.getFarms());
  };

  const handleToggleTask = (diagId: string, itemId: string) => {
    storage.toggleActionItem(diagId, itemId);
    loadHistory();
  };

  const filteredDiagnoses = diagnoses.filter((d) => {
    const matchesSearch =
      d.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.farm_name && d.farm_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity =
      selectedSeverity === "All" || d.severity === selectedSeverity;

    const matchesFarm =
      selectedFarm === "All" || d.farm_id === selectedFarm || d.farm_name === selectedFarm;

    return matchesSearch && matchesSeverity && matchesFarm;
  });

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tomato Diagnosis History
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review past AI health analyses, track completed action items, and continue conversations with Gemini.
            </p>
          </div>

          <Link
            href="/diagnose"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition self-start"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Diagnosis</span>
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search disease, farm, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold shrink-0">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Farm Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold shrink-0">Farm:</span>
            <select
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="All">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Records List */}
        {filteredDiagnoses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">No diagnosis records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No previous scans match your search or filter parameters.
            </p>
            <div className="pt-2">
              <Link
                href="/diagnose"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Scan a Plant Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiagnoses.map((record) => {
              const isExpanded = expandedDiagId === record.id;
              const isChatOpen = activeChatDiagId === record.id;
              const isHealthy = record.diagnosis.toLowerCase().includes("healthy");

              return (
                <div
                  key={record.id}
                  id={record.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition overflow-hidden"
                >
                  {/* Summary Bar */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900">{record.diagnosis}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            isHealthy
                              ? "bg-emerald-100 text-emerald-800"
                              : record.severity === "Critical"
                              ? "bg-red-100 text-red-800"
                              : record.severity === "High"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {record.severity} Severity ({record.confidence}% match)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{record.farm_name || "Main Farm"}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(record.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1">{record.explanation}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveChatDiagId(isChatOpen ? null : record.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isChatOpen
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isChatOpen ? "Close Chat" : "Ask AI"}</span>
                      </button>

                      <button
                        onClick={() => setExpandedDiagId(isExpanded ? null : record.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Details" : "View Plan"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
                      {/* Image Preview if available */}
                      {record.image_url && (
                        <div className="w-32 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={record.image_url}
                            alt="Sample"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Pathology Breakdown
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                          {record.explanation}
                        </p>
                      </div>

                      {/* Action items checklist */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Action Checklist
                        </h4>
                        <div className="space-y-1.5">
                          {record.action_items?.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleTask(record.id, item.id)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                item.completed
                                  ? "bg-emerald-50/50 border-emerald-200 text-slate-400 line-through"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              {item.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <span>{item.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warning */}
                      {record.warning && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{record.warning}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contextual AI Follow-up Chat Drawer */}
                  {isChatOpen && (
                    <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-100/60">
                      <DiagnosisChat
                        diagnosisContext={{
                          diagnosis: record.diagnosis,
                          severity: record.severity,
                          explanation: record.explanation,
                          action_plan: record.action_plan,
                          symptoms: record.symptoms_detected,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
