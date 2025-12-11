// frontend/src/pages/DashboardPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetQuotationsQuery } from "../services/quotationApi";
import { useGetPurchaseOrdersQuery } from "../services/purchaseOrderApi";
import Button from "../components/common/Button";
import { ROUTES } from "../config/routesConfig";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: quotations = [], isLoading: loadingQ } =
    useGetQuotationsQuery();
  const { data: pos = [], isLoading: loadingP } =
    useGetPurchaseOrdersQuery();

  const canQuotation =
    !!user?.canCreateQuotation || user?.role === "admin";
  const canPO =
    !!user?.canCreatePurchaseOrder || user?.role === "admin";

  const totalQuotations = quotations.length;
  const totalPOs = pos.length;

  const totalClients = new Set(
    quotations.map((q) => q.clientName).filter(Boolean)
  ).size;

  const totalItemsQuoted = quotations.reduce(
    (sum, q) => sum + (q.items?.length || 0),
    0
  );

  const latestQuotations = [...quotations]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  const latestPOs = [...pos]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  const handleNewQuotation = () => {
    navigate(ROUTES.QUOTATIONS_LIST, {
      state: { openCompanySelector: true },
    });
  };

  const handleNewPO = () => {
    navigate(ROUTES.POS_LIST, {
      state: { openCompanyModal: true },
    });
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Quick overview of your quotations &amp; purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canQuotation && (
            <Button size="sm" onClick={handleNewQuotation}>
              + New Quotation
            </Button>
          )}
          {canPO && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleNewPO}
            >
              + New Purchase Order
            </Button>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Quotations
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loadingQ ? "…" : totalQuotations}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            All quotations created in the system.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Purchase Orders
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loadingP ? "…" : totalPOs}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Confirmed POs sent to suppliers.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Unique Clients
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loadingQ ? "…" : totalClients || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on quotation history.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Items Quoted
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loadingQ ? "…" : totalItemsQuoted || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total line items across all quotations.
          </p>
        </div>
      </section>

      {/* TWO COLUMNS – RECENT ACTIVITY */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RECENT QUOTATIONS */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Quotations
            </h2>
            <Link
              to={ROUTES.QUOTATIONS_LIST}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </Link>
          </div>

          {loadingQ && (
            <p className="text-xs text-slate-500">Loading…</p>
          )}

          {!loadingQ && latestQuotations.length === 0 && (
            <p className="text-xs text-slate-500">
              You haven&apos;t created any quotations yet.
            </p>
          )}

          {!loadingQ && latestQuotations.length > 0 && (
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Quotation #</th>
                    <th className="py-2 px-2 text-left">Client</th>
                    <th className="py-2 px-2 text-left">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {latestQuotations.map((q) => (
                    <tr key={q._id} className="border-b last:border-0">
                      <td className="py-1.5 px-2">
                        {q.date ? q.date.slice(0, 10) : "-"}
                      </td>
                      <td className="py-1.5 px-2">
                        {q.quotationNumber}
                      </td>
                      <td className="py-1.5 px-2">{q.clientName}</td>
                      <td className="py-1.5 px-2 truncate max-w-[140px]">
                        {q.subject}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT POS */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Purchase Orders
            </h2>
            <Link
              to={ROUTES.POS_LIST}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </Link>
          </div>

          {loadingP && (
            <p className="text-xs text-slate-500">Loading…</p>
          )}

          {!loadingP && latestPOs.length === 0 && (
            <p className="text-xs text-slate-500">
              No purchase orders have been created yet.
            </p>
          )}

          {!loadingP && latestPOs.length > 0 && (
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">PO #</th>
                    <th className="py-2 px-2 text-left">Supplier</th>
                    <th className="py-2 px-2 text-left">Order Against</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPOs.map((po) => (
                    <tr key={po._id} className="border-b last:border-0">
                      <td className="py-1.5 px-2">
                        {po.date ? po.date.slice(0, 10) : "-"}
                      </td>
                      <td className="py-1.5 px-2">{po.purchaseNumber}</td>
                      <td className="py-1.5 px-2">
                        {po.SalesManagerName || po.supplierName}
                      </td>
                      <td className="py-1.5 px-2 truncate max-w-[140px]">
                        {po.orderAgainst}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
