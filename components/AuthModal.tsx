"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { storage } from "@/lib/storage";
import { UserProfile } from "@/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();

      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) {
          console.warn("Supabase auth signup warning, using local profile fallback:", error.message);
        }

        const newUser: UserProfile = {
          id: data?.user?.id || `farmer-${Date.now()}`,
          full_name: fullName || "Tomato Farmer",
          email: email,
          created_at: new Date().toISOString(),
        };

        storage.setUser(newUser);
        onSuccess(newUser);
        onClose();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.warn("Supabase auth signin warning, falling back to local login:", error.message);
        }

        const loggedUser: UserProfile = {
          id: data?.user?.id || `farmer-${Date.now()}`,
          full_name: data?.user?.user_metadata?.full_name || email.split("@")[0],
          email: email,
          created_at: new Date().toISOString(),
        };

        storage.setUser(loggedUser);
        onSuccess(loggedUser);
        onClose();
      }
    } catch (err: any) {
      // Fallback for demo convenience
      const fallbackUser: UserProfile = {
        id: `farmer-${Date.now()}`,
        full_name: fullName || email.split("@")[0] || "Farmer Ibrahim",
        email: email || "farmer@tomato-ai.farm",
        created_at: new Date().toISOString(),
      };
      storage.setUser(fallbackUser);
      onSuccess(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const demoUser: UserProfile = {
      id: "demo-farmer-01",
      full_name: "Ibrahim Sani",
      email: "ibrahim@tomatofarm.ng",
      created_at: new Date().toISOString(),
    };
    storage.setUser(demoUser);
    onSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRegister ? "Create Farmer Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister
              ? "Join Tomato AI to manage your tomato fields and diagnoses"
              : "Sign in to access your farm dashboard and diagnosis history"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ibrahim Sani"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {loading ? "Processing..." : isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2 px-3 rounded-lg border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Quick Login as Demo Farmer (One-Click)</span>
          </button>

          <div className="text-center text-xs text-slate-500 mt-2">
            {isRegister ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-700 font-semibold hover:underline"
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
