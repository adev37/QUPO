// frontend/src/components/purchaseOrders/PurchaseOrderList.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPurchaseOrdersQuery,
  useDeletePurchaseOrderMutation,
} from "../../services/purchaseOrderApi";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");

  const queryArgs = useMemo(
    () => (search.trim() ? { search: search.trim() } : {}),
    [search]
  );

  const {
    data: purchaseOrders = [],
    isLoading,
    isError,
    error,
  } = useGetPurchaseOrdersQuery(queryArgs);

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
      alert(
        err?.data?.message ||
          "Failed to delete purchase order. Please try again."
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* header + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Purchase Orders
          </h2>
          <p className="text-xs text-slate-500">
            View, edit, print{isAdmin ? " and delete" : ""} purchase
            orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier, PO #, order against..."
            className="w-48 md:w-64 border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        {isLoading && (
          <p className="text-xs text-slate-500">
            Loading purchase orders…
          </p>
        )}

        {isError && (
          <p className="text-xs text-red-600">
            Failed to load purchase orders.{" "}
            <span className="text-[10px] text-slate-400">
              {error?.data?.message || ""}
            </span>
          </p>
        )}

        {!isLoading && !isError && purchaseOrders.length === 0 && (
          <p className="text-xs text-slate-500">
            No purchase orders found. Use the “+ New PO” button to
            create one.
          </p>
        )}

        {!isLoading && !isError && purchaseOrders.length > 0 && (
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
                {purchaseOrders.map((po) => (
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
                      {po.orderAgainst}
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
                            disabled={
                              isDeleting && deletingId === po._id
                            }
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
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderList;
