import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const linkBase =
  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const canQuotation = !!user?.canCreateQuotation || isAdmin;
  const canPO = !!user?.canCreatePurchaseOrder || isAdmin;

  const navSections = useMemo(() => {
    return [
      {
        title: "Overview",
        items: [{ label: "Dashboard", to: ROUTES.DASHBOARD, end: true }],
      },
      {
        title: "Masters",
        items: [
          { label: "Items", to: ROUTES.ITEMS },
          { label: "Companies", to: ROUTES.COMPANIES },
          { label: "Clients", to: ROUTES.CLIENTS },
          { label: "Supplier/Sales Manager", to: ROUTES.SALES_MANAGERS },
          ...(isAdmin ? [{ label: "Users", to: ROUTES.USERS }] : []),
        ],
      },
      {
        title: "Transactions",
        items: [
          ...(canQuotation
            ? [{ label: "Quotations", to: ROUTES.QUOTATIONS_LIST }]
            : []),
          ...(canPO ? [{ label: "Purchase Orders", to: ROUTES.POS_LIST }] : []),
        ],
      },
    ];
  }, [isAdmin, canQuotation, canPO]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* MOBILE TOPBAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 active:bg-slate-200"
            aria-label="Open menu"
          >
            <span className="block w-5">
              <span className="block h-0.5 bg-slate-900 mb-1.5" />
              <span className="block h-0.5 bg-slate-900 mb-1.5" />
              <span className="block h-0.5 bg-slate-900" />
            </span>
          </button>

          <div className="text-sm font-semibold text-slate-900">
            Quotations &amp; POs
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-72 bg-slate-950 text-slate-200 border-r border-slate-800 flex-col">
          <SidebarContent
            navSections={navSections}
            onNavigate={() => {}}
            onLogout={logout}
            showFooter
          />
        </aside>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu backdrop"
            />
            <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-wide truncate">
                    Quotations &amp; POs
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                    Business Documents Console
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/15"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <SidebarContent
                navSections={navSections}
                onNavigate={() => setMobileOpen(false)}
                onLogout={logout}
                showFooter
              />
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 min-h-screen">
          {/* ✅ FULL WIDTH ALWAYS (fix mobile narrow/center issue) */}
          <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

function SidebarContent({ navSections, onNavigate, onLogout, showFooter = true }) {
  return (
    <>
      {/* Brand */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <span className="text-indigo-200 font-black">Q</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-wide truncate">
              Quotations &amp; POs
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              Business Documents Console
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 text-xs overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              {section.title}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <span className="h-5 w-1.5 rounded-full bg-white/0 group-hover:bg-white/20" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {showFooter && (
        <div className="px-4 py-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 text-slate-100 hover:bg-white/15 border border-white/10"
          >
            Logout
          </button>

          <div className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} Q&amp;P System
          </div>
        </div>
      )}
    </>
  );
}
