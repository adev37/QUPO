// frontend/src/components/layout/Topbar.jsx
import React from "react";
import { useAuth } from "../../hooks/useAuth";

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    // 🔴 no-print so it disappears in print, plus Tailwind print:hidden
    <header className="no-print print:hidden h-14 flex items-center justify-between bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6">
      <div className="font-medium text-slate-800 text-sm md:text-base">
        Quotation &amp; Purchase Order System
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-xs md:text-sm text-slate-700 border border-slate-200">
            <span className="font-medium mr-1">{user.email}</span>
            <span className="text-slate-400 text-[11px]">({user.role})</span>
          </div>
        )}
        <button
          onClick={logout}
          className="text-xs md:text-sm px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
