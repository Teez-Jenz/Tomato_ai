"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Building2, 
  Sprout, 
  ScanSearch, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  X
} from "lucide-react";
import { storage } from "@/lib/storage";
import { Farm, Field, DiagnosisRecord, UserProfile } from "@/types";
import WeatherWidget from "@/components/WeatherWidget";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);

  // Modals
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmLocation, setNewFarmLocation] = useState("");
  const [newFarmAcres, setNewFarmAcres] = useState<number>(2.5);

  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [selectedFarmIdForField, setSelectedFarmIdForField] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newCropType, setNewCropType] = useState("Roma VF");
  const [newPlantCount, setNewPlantCount] = useState(1000);
  const [newPlantingDate, setNewPlantingDate] = useState("2026-06-01");

  useEffect(() => {
    setUser(storage.getUser());
    loadData();
  }, []);

  const loadData = () => {
    const fList = storage.getFarms();
    const fiList = storage.getFields();
    const dList = storage.getDiagnoses();
    setFarms(fList);
    setFields(fiList);
    setDiagnoses(dList);
    if (fList.length > 0 && !selectedFarmIdForField) {
      setSelectedFarmIdForField(fList[0].id);
    }
  };

  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName.trim()) return;

    storage.addFarm({
      user_id: user?.id || "demo-user",
      name: newFarmName.trim(),
      location: newFarmLocation.trim() || "Local Agricultural Region",
      size_acres: Number(newFarmAcres) || 1,
    });

    setNewFarmName("");
    setNewFarmLocation("");
    setIsAddFarmOpen(false);
    loadData();
  };

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !selectedFarmIdForField) return;

    storage.addField({
      farm_id: selectedFarmIdForField,
      name: newFieldName.trim(),
      crop_type: newCropType,
      plant_count: Number(newPlantCount),
      planting_date: newPlantingDate,
    });

    setNewFieldName("");
    setIsAddFieldOpen(false);
    loadData();
  };

  const highSeverityCount = diagnoses.filter(
    (d) => d.severity === "High" || d.severity === "Critical"
  ).length;

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Farmer Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-800">{user?.full_name || "Ibrahim Sani"}</strong>. Managing {farms.length} farms and {fields.length} tomato plots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddFarmOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>New Farm</span>
            </button>

            <Link
              href="/diagnose"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <ScanSearch className="w-4 h-4" />
              <span>Scan Tomato Plant</span>
            </Link>
          </div>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Farms</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{farms.length}</h3>
              <p className="text-xs text-emerald-700 mt-1 font-medium">All active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tomato Fields / Crops</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{fields.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Roma, Cherry, Beefsteak</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Diagnoses</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{diagnoses.length}</h3>
              <p className="text-xs text-emerald-700 mt-1 font-medium">Plant.id + Gemini verified</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Disease Alerts</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{highSeverityCount}</h3>
              <p className="text-xs text-rose-700 mt-1 font-medium">Requires field treatment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Content Split: Weather & Farms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Farms and Crops */}
          <div className="lg:col-span-8 space-y-8">
            {/* Farms Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Farms & Locations</h2>
                  <p className="text-xs text-slate-500">Manage soil zones and acreages</p>
                </div>
                <button
                  onClick={() => setIsAddFarmOpen(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Farm</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map((f) => {
                  const farmFields = fields.filter((fi) => fi.farm_id === f.id);
                  return (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{f.location}</span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {f.size_acres || 1} Acres
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                        <span className="text-slate-500">{farmFields.length} Tomato Plots</span>
                        <button
                          onClick={() => {
                            setSelectedFarmIdForField(f.id);
                            setIsAddFieldOpen(true);
                          }}
                          className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Field</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tomato Fields & Crops Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Active Tomato Crops & Fields</h2>
                  <p className="text-xs text-slate-500">Track variety, planting date, and plant counts</p>
                </div>
                <button
                  onClick={() => setIsAddFieldOpen(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Crop Field</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {fields.map((fi) => {
                  const parentFarm = farms.find((f) => f.id === fi.farm_id);
                  return (
                    <div key={fi.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          🍅
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{fi.name}</h4>
                          <p className="text-xs text-slate-500">
                            {parentFarm?.name || "Main Farm"} • <span className="text-emerald-700 font-medium">{fi.crop_type}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-600 sm:text-right">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Planting Date</span>
                          <span className="font-semibold">{fi.planting_date || "2026-06-01"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Plant Count</span>
                          <span className="font-semibold">{fi.plant_count?.toLocaleString() || 1000} plants</span>
                        </div>
                        <Link
                          href={`/diagnose?farm=${fi.farm_id}&field=${fi.id}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1 transition"
                        >
                          <ScanSearch className="w-3.5 h-3.5" />
                          <span>Scan</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Diagnoses Feed */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Plant Health Diagnoses</h2>
                  <p className="text-xs text-slate-500">Latest assessments and action plans</p>
                </div>
                <Link
                  href="/history"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <span>View Full History</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {diagnoses.slice(0, 4).map((d) => {
                  const isHealthy = d.diagnosis.toLowerCase().includes("healthy");
                  const isHigh = d.severity === "High" || d.severity === "Critical";

                  return (
                    <div
                      key={d.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{d.diagnosis}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isHealthy
                                ? "bg-emerald-100 text-emerald-800"
                                : isHigh
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {d.severity} ({d.confidence}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{d.explanation}</p>
                        <p className="text-[11px] text-slate-400">
                          {d.farm_name || "Green Valley Farm"} • {new Date(d.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/history#${d.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                        >
                          View Plan
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Weather Widget & Quick Help */}
          <div className="lg:col-span-4 space-y-6">
            <WeatherWidget />

            {/* Quick Tips for Tomato Cultivation */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Agronomist Tip of the Week</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                During high humidity periods, tomato early blight spores spread through soil splash when rainwater bounces off bare earth. Mulch your tomato beds with dry rice straw or clean dry grass to prevent bottom leaf contact!
              </p>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/diagnose"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <ScanSearch className="w-4 h-4 text-emerald-600" />
                  <span>Scan A Plant Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Farm */}
      {isAddFarmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setIsAddFarmOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Farm</h3>
            <p className="text-xs text-slate-500 mb-4">Add your farm location to organize tomato crops.</p>

            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Organic Farm"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Zaria Agricultural Basin"
                  value={newFarmLocation}
                  onChange={(e) => setNewFarmLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Size (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newFarmAcres}
                  onChange={(e) => setNewFarmAcres(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFarmOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20"
                >
                  Create Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Field */}
      {isAddFieldOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setIsAddFieldOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Tomato Field / Crop</h3>
            <p className="text-xs text-slate-500 mb-4">Register a tomato plot under your farm.</p>

            <form onSubmit={handleCreateField} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Farm</label>
                <select
                  value={selectedFarmIdForField}
                  onChange={(e) => setSelectedFarmIdForField(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Field / Plot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field C - Plum Tomatoes"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tomato Variety</label>
                  <select
                    value={newCropType}
                    onChange={(e) => setNewCropType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="Roma VF (Determinate)">Roma VF</option>
                    <option value="Sweet Cherry">Sweet Cherry</option>
                    <option value="Beefsteak Heirloom">Beefsteak</option>
                    <option value="Local Nigerian Variety (UTC)">Local UTC</option>
                    <option value="Rio Grande">Rio Grande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Plants</label>
                  <input
                    type="number"
                    value={newPlantCount}
                    onChange={(e) => setNewPlantCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Planting Date</label>
                <input
                  type="date"
                  value={newPlantingDate}
                  onChange={(e) => setNewPlantingDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFieldOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
