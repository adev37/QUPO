// frontend/src/pages/DashboardPage.jsx
import React from "react";
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
    error: qErrObj,
  } = useGetQuotationsQuery(
    { limit: 5 },
    { skip: !canQuotation || !user }
  );

  const {
    data: purchaseOrders = [],
    isLoading: poLoading,
    isError: poError,
    error: poErrObj,
  } = useGetPurchaseOrdersQuery(
    { limit: 5 },
    { skip: !canPO || !user }
  );

  const totalQuotations = canQuotation ? quotations.length : 0;
  const totalPurchaseOrders = canPO ? purchaseOrders.length : 0;
  const uniqueClients = canQuotation
    ? new Set(quotations.map((q) => q.clientName)).size
    : 0;
  const itemsQuoted = canQuotation
    ? quotations.reduce((sum, q) => sum + (q.items?.length || 0), 0)
    : 0;

  const handleViewAllQuotations = () => {
    navigate(ROUTES.QUOTATIONS_LIST);
  };

  const handleViewAllPOs = () => {
    navigate(ROUTES.POS_LIST);
  };

  const openNewQuotationSelector = () => {
    navigate(ROUTES.QUOTATIONS_LIST, {
      state: { openCompanySelector: true },
    });
  };

  const openNewPOModal = () => {
    navigate(ROUTES.POS_LIST, {
      state: { openCompanyModal: true },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Quick overview of your quotations &amp; purchase orders.
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL QUOTATIONS */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Total Quotations
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {canQuotation ? totalQuotations : "—"}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {canQuotation
              ? "All quotations created in the system."
              : "You don’t have access to quotations."}
          </p>
        </div>

        {/* TOTAL PURCHASE ORDERS */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Total Purchase Orders
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {canPO ? totalPurchaseOrders : "—"}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {canPO
              ? "Confirmed POs sent to suppliers."
              : "You don’t have access to purchase orders."}
          </p>
        </div>

        {/* UNIQUE CLIENTS */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Unique Clients
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {canQuotation ? uniqueClients : "—"}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {canQuotation
              ? "Based on quotation history."
              : "Client metrics require quotation access."}
          </p>
        </div>

        {/* ITEMS QUOTED */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Items Quoted
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {canQuotation ? itemsQuoted : "—"}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {canQuotation
              ? "Total line items across all quotations."
              : "Item metrics require quotation access."}
          </p>
        </div>
      </div>

      {/* Recent sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RECENT QUOTATIONS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Recent Quotations
              </h2>
              <p className="text-xs text-slate-500">
                Last few quotations created in the system.
              </p>
            </div>
            {canQuotation && (
              <button
                type="button"
                onClick={handleViewAllQuotations}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            )}
          </div>

          <div className="px-4 py-3">
            {!canQuotation && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                You don&apos;t have permission to view quotations. Contact
                your admin if you need access.
              </p>
            )}

            {canQuotation && qLoading && (
              <p className="text-xs text-slate-500">Loading…</p>
            )}

            {canQuotation && qError && (
              <p className="text-xs text-red-600">
                Failed to load quotations.
              </p>
            )}

            {canQuotation && !qLoading && !qError && quotations.length === 0 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  You haven&apos;t created any quotations yet.
                </p>
                <button
                  type="button"
                  onClick={openNewQuotationSelector}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  + New quotation
                </button>
              </div>
            )}

            {canQuotation && quotations.length > 0 && (
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1.5 text-left">Date</th>
                      <th className="px-2 py-1.5 text-left">Quotation #</th>
                      <th className="px-2 py-1.5 text-left">Client</th>
                      <th className="px-2 py-1.5 text-left">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q) => (
                      <tr
                        key={q._id}
                        className="border-b last:border-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() =>
                          navigate(`${ROUTES.QUOTATIONS_LIST}/${q._id}/edit`)
                        }
                      >
                        <td className="px-2 py-1.5">
                          {q.date ? q.date.slice(0, 10) : "-"}
                        </td>
                        <td className="px-2 py-1.5">
                          {q.quotationNumber}
                        </td>
                        <td className="px-2 py-1.5">{q.clientName}</td>
                        <td className="px-2 py-1.5 max-w-[220px] truncate">
                          {q.subject}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RECENT PURCHASE ORDERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Recent Purchase Orders
              </h2>
              <p className="text-xs text-slate-500">
                Last few purchase orders created.
              </p>
            </div>
            {canPO && (
              <button
                type="button"
                onClick={handleViewAllPOs}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            )}
          </div>

          <div className="px-4 py-3">
            {!canPO && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                You don&apos;t have permission to view purchase orders. Contact
                your admin if you need access.
              </p>
            )}

            {canPO && poLoading && (
              <p className="text-xs text-slate-500">Loading…</p>
            )}

            {canPO && poError && (
              <p className="text-xs text-red-600">
                Failed to load purchase orders.
              </p>
            )}

            {canPO && !poLoading && !poError && purchaseOrders.length === 0 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  No purchase orders have been created yet.
                </p>
                <button
                  type="button"
                  onClick={openNewPOModal}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  + New PO
                </button>
              </div>
            )}

            {canPO && purchaseOrders.length > 0 && (
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1.5 text-left">Date</th>
                      <th className="px-2 py-1.5 text-left">PO #</th>
                      <th className="px-2 py-1.5 text-left">Supplier</th>
                      <th className="px-2 py-1.5 text-left">Order Against</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => (
                      <tr
                        key={po._id}
                        className="border-b last:border-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() =>
                          navigate(`${ROUTES.POS_LIST}/${po._id}/edit`)
                        }
                      >
                        <td className="px-2 py-1.5">
                          {po.date ? po.date.slice(0, 10) : "-"}
                        </td>
                        <td className="px-2 py-1.5">
                          {po.purchaseNumber}
                        </td>
                        <td className="px-2 py-1.5">
                          {po.SalesManagerName || po.supplierName || "-"}
                        </td>
                        <td className="px-2 py-1.5 max-w-[220px] truncate">
                          {po.orderAgainst}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
