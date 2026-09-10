"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sprout, 
  LayoutDashboard, 
  ScanSearch, 
  History, 
  User, 
  LogOut, 
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { storage } from "@/lib/storage";
import { UserProfile } from "@/types";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(storage.getUser());
  }, []);

  const handleLogout = () => {
    storage.setUser(null);
    setUser(null);
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Sprout },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/diagnose", label: "Diagnose Plant", icon: ScanSearch },
    { href: "/history", label: "Diagnosis History", icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-emerald-950/10 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🍅</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Tomato<span className="text-rose-600">AI</span></span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Assistant
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Plant.id + Gemini Dual Intelligence</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/diagnose"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm hover:shadow transition-all group"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>Scan Plant</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {user.full_name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500">Farmer</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/diagnose"
              className="p-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
            >
              Scan
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-600" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 mt-2 border-t border-slate-200">
              {user ? (
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 font-medium px-2 py-1 rounded bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(loggedUser) => setUser(loggedUser)}
        />
      )}
    </>
  );
}
