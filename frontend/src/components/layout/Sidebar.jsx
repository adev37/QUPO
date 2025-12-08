// frontend/src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const baseLink =
  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150";

const Sidebar = () => {
  const { user } = useAuth(); // ✅ get logged-in user

  return (
    // 🔴 no-print so it disappears in print, plus Tailwind print:hidden
    <aside className="no-print print:hidden w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
      {/* App title */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="text-base font-semibold tracking-wide">
          Quotations &amp; POs
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Business Documents Console
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 text-xs">
        {/* DASHBOARD */}
        <div>
          <div className="px-1 mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Overview
          </div>
          <NavLink
            to={ROUTES.DASHBOARD}
            end
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Dashboard
          </NavLink>
        </div>

        {/* MASTERS */}
        <div>
          <div className="px-1 mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Masters
          </div>
          <div className="space-y-1">
            <NavLink
              to={ROUTES.ITEMS}
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              Items
            </NavLink>
            <NavLink
              to={ROUTES.COMPANIES}
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              Companies
            </NavLink>
            <NavLink
              to={ROUTES.CLIENTS}
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              Clients
            </NavLink>
            <NavLink
              to={ROUTES.SALES_MANAGERS}
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              Sales Managers
            </NavLink>

            {/* ✅ Admin-only Users link */}
            {user?.role === "admin" && (
              <NavLink
                to={ROUTES.USERS}
                className={({ isActive }) =>
                  `${baseLink} ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                Users
              </NavLink>
            )}
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div>
          <div className="px-1 mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Transactions
          </div>
          <div className="space-y-1">
            <NavLink
              to={ROUTES.QUOTATIONS_LIST}
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              Quotations
            </NavLink>
            <NavLink
              to={ROUTES.POS_LIST}
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              Purchase Orders
            </NavLink>
          </div>
        </div>
      </nav>

      {/* subtle footer */}
      <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500">
        © {new Date().getFullYear()} Q&amp;P System
      </div>
    </aside>
  );
};

export default Sidebar;
