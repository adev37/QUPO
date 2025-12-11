// frontend/src/components/layout/MainLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const linkBase =
  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150";

const MainLayout = () => {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const canQuotation = !!user?.canCreateQuotation || isAdmin;
  const canPO = !!user?.canCreatePurchaseOrder || isAdmin;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* SIDEBAR */}
      <aside className="w-60 lg:w-64 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-slate-800">
          <h1 className="text-sm font-semibold tracking-wide">
            Quotations &amp; POs
          </h1>
          <p className="text-[11px] text-slate-400">
            Business Documents Console
          </p>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-slate-800 text-xs">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-slate-400 truncate">{user.email}</p>
            <p className="text-slate-500 capitalize mt-0.5">
              Role: {user.role}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 text-xs">
          {/* OVERVIEW */}
          <div>
            <div className="px-1 mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Overview
            </div>
            <NavLink
              to={ROUTES.DASHBOARD}
              end
              className={({ isActive }) =>
                `${linkBase} ${
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
                  `${linkBase} ${
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
                  `${linkBase} ${
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
                  `${linkBase} ${
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
                  `${linkBase} ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                Supplier/Sales Manager
              </NavLink>

              {isAdmin && (
                <NavLink
                  to={ROUTES.USERS}
                  className={({ isActive }) =>
                    `${linkBase} ${
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

          {/* TRANSACTIONS / DOCUMENTS */}
          <div>
            <div className="px-1 mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Transactions
            </div>
            <div className="space-y-1">
              {canQuotation && (
                <NavLink
                  to={ROUTES.QUOTATIONS_LIST}
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  Quotations
                </NavLink>
              )}

              {canPO && (
                <NavLink
                  to={ROUTES.POS_LIST}
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  Purchase Orders
                </NavLink>
              )}
            </div>
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
          >
            Logout
          </button>
          <div className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} Q&amp;P System
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen bg-slate-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
