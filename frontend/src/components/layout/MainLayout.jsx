import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routesConfig";

const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear any stored auth – adjust if you use something custom
    localStorage.clear();
    navigate(ROUTES.LOGIN);
    window.location.reload();
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          to: ROUTES.DASHBOARD,
          label: "Dashboard",
        },
      ],
    },
    {
      title: "MASTERS",
      items: [
        { to: ROUTES.ITEMS, label: "Items" },
        { to: ROUTES.COMPANIES, label: "Companies" },
        { to: ROUTES.CLIENTS, label: "Clients" },
        { to: ROUTES.SALES_MANAGERS, label: "Sales Managers" },
      ],
    },
    {
      title: "TRANSACTIONS",
      items: [
        { to: ROUTES.QUOTATIONS_LIST, label: "Quotations" },
        { to: ROUTES.POS_LIST, label: "Purchase Orders" },
      ],
    },
  ];

  const navLinkClasses = ({ isActive }) =>
    [
      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
      isActive
        ? "bg-indigo-500 text-white shadow-sm"
        : "text-slate-200 hover:bg-slate-800 hover:text-white",
    ].join(" ");

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-60 bg-slate-950 text-slate-100 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div>
            <h1 className="text-sm font-semibold tracking-wide">
              Quotations &amp; POs
            </h1>
            <p className="text-[11px] text-slate-400">
              Business Documents Console
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
          {navSections.map((section) => (
            <div key={section.title} className="px-3 space-y-1">
              <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
          <p className="mb-2">© {new Date().getFullYear()} Q &amp; P System</p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-center text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md py-1.5"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Quotation &amp; Purchase Order System
            </h2>
            <p className="text-xs text-slate-500">
              Manage quotations, purchase orders, masters and more.
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 px-6 py-5 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
