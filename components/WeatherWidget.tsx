"use client";

import React, { useState, useEffect } from "react";
import { CloudRain, Sun, Droplets, Wind, AlertTriangle, CheckCircle } from "lucide-react";

export default function WeatherWidget() {
  const [weather] = useState({
    location: "Kano Tomato Belt",
    temp: 28,
    humidity: 78,
    condition: "High Humidity & Intermittent Showers",
    windSpeed: "12 km/h",
    riskLevel: "High" as "Low" | "Moderate" | "High",
    riskDescription: "Favorable fungal sporulation window for Early & Late Blight. Delay overhead watering.",
  });

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 shadow-lg border border-emerald-800/50 relative overflow-hidden">
      {/* Decorative leaf water drop background effect */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-300 bg-emerald-800/60 px-2 py-0.5 rounded-full">
            Microclimate & Crop Risk
          </span>
          <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
            <span>{weather.location}</span>
          </h3>
          <p className="text-xs text-emerald-200/80">{weather.condition}</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-end gap-1">
            <Sun className="w-6 h-6 text-amber-400 inline" />
            <span>{weather.temp}°C</span>
          </div>
          <span className="text-[11px] text-emerald-200">Feels like 30°C</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-800/60 text-center">
        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs">
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </div>
          <p className="text-sm font-bold text-white mt-0.5">{weather.humidity}%</p>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs">
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Risk</span>
          </div>
          <p className="text-sm font-bold text-white mt-0.5">65%</p>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs">
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </div>
          <p className="text-sm font-bold text-white mt-0.5">{weather.windSpeed}</p>
        </div>
      </div>

      <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-amber-300">Blight Warning: </span>
          <span className="text-amber-100">{weather.riskDescription}</span>
        </div>
      </div>
    </div>
  );
}
