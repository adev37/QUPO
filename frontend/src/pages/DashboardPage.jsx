import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../config/routesConfig";
import { useGetQuotationsQuery } from "../services/quotationApi";
import { useGetPurchaseOrdersQuery } from "../services/purchaseOrderApi";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const canQuotation = !!user?.canCreateQuotation || isAdmin;
  const canPO = !!user?.canCreatePurchaseOrder || isAdmin;

  // 👉 Only call APIs when allowed
  const {
    data: quotations = [],
    isLoading: qLoading,
    isError: qError,
  } = useGetQuotationsQuery({ limit: 5 }, { skip: !canQuotation || !user });

  const {
    data: purchaseOrders = [],
    isLoading: poLoading,
    isError: poError,
  } = useGetPurchaseOrdersQuery({ limit: 5 }, { skip: !canPO || !user });

  const metrics = useMemo(() => {
    const totalQuotations = canQuotation ? quotations.length : 0;
    const totalPurchaseOrders = canPO ? purchaseOrders.length : 0;

    const uniqueClients = canQuotation
      ? new Set(quotations.map((q) => q.clientName).filter(Boolean)).size
      : 0;

    const itemsQuoted = canQuotation
      ? quotations.reduce((sum, q) => sum + (q.items?.length || 0), 0)
      : 0;

    return { totalQuotations, totalPurchaseOrders, uniqueClients, itemsQuoted };
  }, [canQuotation, canPO, quotations, purchaseOrders]);

  const handleViewAllQuotations = () => navigate(ROUTES.QUOTATIONS_LIST);
  const handleViewAllPOs = () => navigate(ROUTES.POS_LIST);

  const openNewQuotationSelector = () => {
    navigate(ROUTES.QUOTATIONS_LIST, { state: { openCompanySelector: true } });
  };

  const openNewPOModal = () => {
    navigate(ROUTES.POS_LIST, { state: { openCompanyModal: true } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-5 sm:px-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Dashboard
              </h1>
              <p className="text-sm text-slate-200 mt-1">
                Quick overview of your quotations &amp; purchase orders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={openNewQuotationSelector}
                disabled={!canQuotation}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition border
                  ${
                    canQuotation
                      ? "bg-white text-slate-900 border-white hover:bg-slate-50"
                      : "bg-white/10 text-white/60 border-white/10 cursor-not-allowed"
                  }`}
              >
                + New Quotation
              </button>

              <button
                type="button"
                onClick={openNewPOModal}
                disabled={!canPO}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition border
                  ${
                    canPO
                      ? "bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600"
                      : "bg-white/10 text-white/60 border-white/10 cursor-not-allowed"
                  }`}
              >
                + New Purchase Order
              </button>
            </div>
          </div>
        </div>

        {/* mini user strip */}
        <div className="px-5 py-3 sm:px-6 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-slate-600">
              Signed in as{" "}
              <span className="font-semibold text-slate-900">
                {user?.name || user?.email || "User"}
              </span>{" "}
              <span className="ml-2 inline-flex items-center rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>

            <div className="text-xs text-slate-600 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold
                  ${
                    canQuotation
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
              >
                Quotations: {canQuotation ? "Enabled" : "No access"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold
                  ${
                    canPO
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
              >
                Purchase Orders: {canPO ? "Enabled" : "No access"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Quotations"
          value={canQuotation ? metrics.totalQuotations : "—"}
          subtitle={
            canQuotation
              ? "All quotations created in the system."
              : "You don’t have access to quotations."
          }
          badge={canQuotation ? "Active" : "Restricted"}
          badgeTone={canQuotation ? "success" : "warning"}
        />

        <KpiCard
          title="Total Purchase Orders"
          value={canPO ? metrics.totalPurchaseOrders : "—"}
          subtitle={
            canPO
              ? "Confirmed POs sent to suppliers."
              : "You don’t have access to purchase orders."
          }
          badge={canPO ? "Active" : "Restricted"}
          badgeTone={canPO ? "success" : "warning"}
        />

        <KpiCard
          title="Unique Clients"
          value={canQuotation ? metrics.uniqueClients : "—"}
          subtitle={
            canQuotation
              ? "Based on quotation history."
              : "Client metrics require quotation access."
          }
          badge="Insights"
          badgeTone="info"
        />

        <KpiCard
          title="Items Quoted"
          value={canQuotation ? metrics.itemsQuoted : "—"}
          subtitle={
            canQuotation
              ? "Total line items across all quotations."
              : "Item metrics require quotation access."
          }
          badge="Overview"
          badgeTone="neutral"
        />
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Quotations */}
        <SectionCard
          title="Recent Quotations"
          subtitle="Last few quotations created in the system."
          actionLabel={canQuotation ? "View all" : null}
          onAction={handleViewAllQuotations}
        >
          {!canQuotation ? (
            <InfoBanner>
              You don&apos;t have permission to view quotations. Contact your
              admin if you need access.
            </InfoBanner>
          ) : qLoading ? (
            <TableSkeleton />
          ) : qError ? (
            <ErrorBanner>Failed to load quotations.</ErrorBanner>
          ) : quotations.length === 0 ? (
            <EmptyState
              title="No quotations yet"
              subtitle="Create your first quotation to start tracking client activity."
              actionLabel="+ New quotation"
              onAction={openNewQuotationSelector}
            />
          ) : (
            <DataTable
              head={["Date", "Quotation #", "Client", "Subject"]}
              rows={quotations.map((q) => ({
                key: q._id,
                cols: [
                  q.date ? String(q.date).slice(0, 10) : "-",
                  q.quotationNumber || "-",
                  q.clientName || "-",
                  q.subject || "-",
                ],
                onClick: () =>
                  navigate(`${ROUTES.QUOTATIONS_LIST}/${q._id}/edit`),
              }))}
            />
          )}
        </SectionCard>

        {/* Recent Purchase Orders */}
        <SectionCard
          title="Recent Purchase Orders"
          subtitle="Last few purchase orders created."
          actionLabel={canPO ? "View all" : null}
          onAction={handleViewAllPOs}
        >
          {!canPO ? (
            <InfoBanner>
              You don&apos;t have permission to view purchase orders. Contact
              your admin if you need access.
            </InfoBanner>
          ) : poLoading ? (
            <TableSkeleton />
          ) : poError ? (
            <ErrorBanner>Failed to load purchase orders.</ErrorBanner>
          ) : purchaseOrders.length === 0 ? (
            <EmptyState
              title="No purchase orders yet"
              subtitle="Create a PO when you’re ready to confirm supplier requirements."
              actionLabel="+ New PO"
              onAction={openNewPOModal}
            />
          ) : (
            <DataTable
              head={["Date", "PO #", "Supplier", "Order Against"]}
              rows={purchaseOrders.map((po) => ({
                key: po._id,
                cols: [
                  po.date ? String(po.date).slice(0, 10) : "-",
                  po.purchaseNumber || "-",
                  po.SalesManagerName || po.supplierName || "-",
                  po.orderAgainst || "-",
                ],
                onClick: () => navigate(`${ROUTES.POS_LIST}/${po._id}/edit`),
              }))}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardPage;

/* --------------------------- UI helpers --------------------------- */

function SectionCard({ title, subtitle, actionLabel, onAction, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, badge, badgeTone = "neutral" }) {
  const tone = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    info: "bg-indigo-100 text-indigo-700 border-indigo-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  }[badgeTone];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}
        >
          {badge}
        </span>
      </div>

      <div className="mt-2 text-3xl font-bold text-slate-900 leading-none">
        {value}
      </div>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>

      {/* tiny progress strip (purely visual, looks premium) */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full w-[62%] rounded-full bg-indigo-500" />
      </div>
    </div>
  );
}

function DataTable({ head = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-[11px] uppercase tracking-wide text-slate-500">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 text-left whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.key}
              onClick={r.onClick}
              className="border-b last:border-0 hover:bg-slate-50 cursor-pointer"
            >
              {r.cols.map((c, idx) => (
                <td
                  key={idx}
                  className={`px-3 py-2 ${
                    idx === r.cols.length - 1 ? "max-w-[260px] truncate" : ""
                  }`}
                  title={String(c)}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="text-xs text-slate-600 mt-1">{subtitle}</div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function InfoBanner({ children }) {
  return (
    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      {children}
    </div>
  );
}

function ErrorBanner({ children }) {
  return (
    <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      {children}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
      <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
      <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
      <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
    </div>
  );
}
