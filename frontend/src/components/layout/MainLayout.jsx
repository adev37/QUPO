// frontend/src/components/layout/MainLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const navLinkBase =
  "flex items-center px-3 py-2 rounded-md text-sm transition-colors";
const navLinkInactive =
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
const navLinkActive =
  "bg-slate-900 text-slate-50 shadow-sm";

const MainLayout = () => {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const canQuotation = !!user?.canCreateQuotation || isAdmin;
  const canPO = !!user?.canCreatePurchaseOrder || isAdmin;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-56 lg:w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Brand */}
        <div className="px-4 py-3 border-b border-slate-200">
          <h1 className="text-sm font-semibold text-slate-900">
            Quotations &amp; POs
          </h1>
          <p className="text-[11px] text-slate-500">
            Business Documents Console
          </p>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs font-medium text-slate-800 truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user.email}
            </p>
            <p className="text-[11px] text-slate-500 capitalize">
              Role: {user.role}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
          <NavLink
            to={ROUTES.DASHBOARD}
            className={({ isActive }) =>
              [
                navLinkBase,
                isActive ? navLinkActive : navLinkInactive,
              ].join(" ")
            }
          >
            Dashboard
          </NavLink>

          <div className="mt-3 mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-3">
            Masters
          </div>

          <NavLink
            to={ROUTES.ITEMS}
            className={({ isActive }) =>
              [
                navLinkBase,
                isActive ? navLinkActive : navLinkInactive,
              ].join(" ")
            }
          >
            Item Master
          </NavLink>

          <NavLink
            to={ROUTES.COMPANIES}
            className={({ isActive }) =>
              [
                navLinkBase,
                isActive ? navLinkActive : navLinkInactive,
              ].join(" ")
            }
          >
            Companies
          </NavLink>

          <NavLink
            to={ROUTES.CLIENTS}
            className={({ isActive }) =>
              [
                navLinkBase,
                isActive ? navLinkActive : navLinkInactive,
              ].join(" ")
            }
          >
            Clients
          </NavLink>

          <NavLink
            to={ROUTES.SALES_MANAGERS}
            className={({ isActive }) =>
              [
                navLinkBase,
                isActive ? navLinkActive : navLinkInactive,
              ].join(" ")
            }
          >
            Sales Managers
          </NavLink>

          {isAdmin && (
            <NavLink
              to={ROUTES.USERS}
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive,
                ].join(" ")
              }
            >
              Users
            </NavLink>
          )}

          <div className="mt-3 mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-3">
            Documents
          </div>

          {/* Quotations visible only if allowed */}
          {canQuotation && (
            <NavLink
              to={ROUTES.QUOTATIONS_LIST}
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive,
                ].join(" ")
              }
            >
              Quotations
            </NavLink>
          )}

          {/* Purchase Orders visible only if allowed */}
          {canPO && (
            <NavLink
              to={ROUTES.POS_LIST}
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive,
                ].join(" ")
              }
            >
              Purchase Orders
            </NavLink>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-slate-200 px-3 py-3 text-xs">
          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
