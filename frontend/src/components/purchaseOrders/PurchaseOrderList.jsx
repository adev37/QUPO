import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPurchaseOrdersQuery,
  useDeletePurchaseOrderMutation,
} from "../../services/purchaseOrderApi";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 10;

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search]);

  // ✅ If backend doesn't support page/limit, it's still fine (client fallback below)
  const queryArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page]
  );

  const { data: res, isLoading, isError, error, refetch } =
    useGetPurchaseOrdersQuery(search.trim() ? { search: search.trim() } : {});

  const all = res?.data || res || []; // tolerate different API shapes

  // ✅ client-side filter safety
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return all;

    return all.filter((po) => {
      const supplier = String(
        po.SalesManagerName || po.supplierName || ""
      ).toLowerCase();
      const num = String(po.purchaseNumber || "").toLowerCase();
      const company = String(po.companyName || po.company?.name || "").toLowerCase();
      const against = String(po.orderAgainst || "").toLowerCase();

      return (
        supplier.includes(term) ||
        num.includes(term) ||
        company.includes(term) ||
        against.includes(term)
      );
    });
  }, [all, search]);

  // ✅ client-side pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const [deletePO, { isLoading: isDeleting }] =
    useDeletePurchaseOrderMutation();
  const [deletingId, setDeletingId] = useState(null);

  const handleEdit = (po) => {
    navigate(`${ROUTES.POS_LIST}/${po._id}/edit`);
  };

  const handlePrint = (po) => {
    navigate(`${ROUTES.POS_LIST}/${po._id}/print`);
  };

  const handleDelete = async (po) => {
    if (!isAdmin) return;

    const confirm = window.confirm(
      `Delete purchase order #${po.purchaseNumber}? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      setDeletingId(po._id);
      await deletePO(po._id).unwrap();
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete purchase order:", err);
      setDeletingId(null);
      alert(err?.data?.message || "Failed to delete purchase order. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Purchase Orders</h2>
          <p className="text-xs text-slate-500">
            List, edit, print{isAdmin ? " and delete" : ""} purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier, PO #, order against..."
            className="w-full sm:w-64 border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        {isLoading && <p className="text-xs text-slate-500">Loading purchase orders…</p>}

        {isError && (
          <div className="text-xs text-red-600">
            Failed to load purchase orders.{" "}
            <span className="text-[10px] text-slate-400">
              {error?.data?.message || ""}
            </span>
            <button
              onClick={() => refetch()}
              className="ml-2 underline hover:no-underline text-[11px]"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && total === 0 && (
          <p className="text-xs text-slate-500">No purchase orders found.</p>
        )}

        {/* ✅ MOBILE CARDS */}
        {!isLoading && !isError && total > 0 && (
          <div className="sm:hidden space-y-3">
            {pageItems.map((po) => (
              <div
                key={po._id}
                className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500">
                      {po.date ? po.date.slice(0, 10) : "-"}
                    </div>

                    <div className="text-sm font-semibold text-slate-900">
                      PO #{po.purchaseNumber}
                    </div>

                    <div className="text-[11px] text-slate-600 mt-0.5">
                      <span className="font-semibold">Company:</span>{" "}
                      {po.companyName || po.company?.name || "-"}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold">Supplier:</span>{" "}
                      {po.SalesManagerName || po.supplierName || "-"}
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1">
                      <span className="font-semibold">Order Against:</span>{" "}
                      <span className="break-words">{po.orderAgainst || "-"}</span>
                    </div>
                  </div>

                  <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold">
                    Items: {po.items?.length || 0}
                  </span>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(po)}
                    className="px-3 py-1.5 rounded-md border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrint(po)}
                    className="px-3 py-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Print
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(po)}
                      disabled={isDeleting && deletingId === po._id}
                      className="px-3 py-1.5 rounded-md border border-red-200 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {isDeleting && deletingId === po._id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="px-3 py-2 border border-slate-200 rounded-lg bg-white flex items-center justify-between text-[11px] text-slate-600">
              <div>
                Showing{" "}
                <span className="font-semibold">
                  {total === 0 ? 0 : startIndex + 1}-
                  {Math.min(startIndex + PAGE_SIZE, total)}
                </span>{" "}
                of <span className="font-semibold">{total}</span>
              </div>

              <div className="space-x-1">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ TABLE (sm+) */}
        {!isLoading && !isError && total > 0 && (
          <div className="hidden sm:block">
            <div className="mt-1 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1.5 text-left">Date</th>
                    <th className="px-2 py-1.5 text-left">PO #</th>
                    <th className="px-2 py-1.5 text-left">Company</th>
                    <th className="px-2 py-1.5 text-left">Supplier</th>
                    <th className="px-2 py-1.5 text-left">Order Against</th>
                    <th className="px-2 py-1.5 text-center">Total Items</th>
                    <th className="px-2 py-1.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageItems.map((po) => (
                    <tr
                      key={po._id}
                      className="border-b last:border-0 hover:bg-slate-50/80"
                    >
                      <td className="px-2 py-1.5">
                        {po.date ? po.date.slice(0, 10) : "-"}
                      </td>

                      <td className="px-2 py-1.5 font-medium text-slate-800">
                        {po.purchaseNumber}
                      </td>

                      <td className="px-2 py-1.5">
                        {po.companyName || po.company?.name || "-"}
                      </td>

                      <td className="px-2 py-1.5">
                        {po.SalesManagerName || po.supplierName || "-"}
                      </td>

                      <td className="px-2 py-1.5 max-w-[260px] truncate">
                        {po.orderAgainst || "-"}
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        {po.items?.length || 0}
                      </td>

                      <td className="px-2 py-1.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(po)}
                            className="px-3 py-1.5 rounded-md border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrint(po)}
                            className="px-3 py-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Print
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(po)}
                              disabled={isDeleting && deletingId === po._id}
                              className="px-3 py-1.5 rounded-md border border-red-200 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {isDeleting && deletingId === po._id
                                ? "Deleting…"
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div>
                Showing{" "}
                <span className="font-semibold">
                  {total === 0 ? 0 : startIndex + 1}-
                  {Math.min(startIndex + PAGE_SIZE, total)}
                </span>{" "}
                of <span className="font-semibold">{total}</span>
              </div>

              <div className="space-x-1">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderList;
