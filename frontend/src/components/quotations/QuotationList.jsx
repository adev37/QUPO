// frontend/src/components/quotations/QuotationList.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetQuotationsQuery,
  useDeleteQuotationMutation,
} from "../../services/quotationApi";
import { ROUTES } from "../../config/routesConfig";
import { useAuth } from "../../hooks/useAuth";

const QuotationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // simple search (optional)
  const [search, setSearch] = useState("");

  const queryArgs = useMemo(
    () => (search.trim() ? { search: search.trim() } : {}),
    [search]
  );

  const {
    data: quotations = [],
    isLoading,
    isError,
    error,
  } = useGetQuotationsQuery(queryArgs);

  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationMutation();
  const [deletingId, setDeletingId] = useState(null);

  const handleEdit = (quotation) => {
    navigate(`${ROUTES.QUOTATIONS_LIST}/${quotation._id}/edit`);
  };

  const handlePrint = (quotation) => {
    navigate(`${ROUTES.QUOTATIONS_LIST}/${quotation._id}/print`);
  };

  const handleDelete = async (quotation) => {
    if (!isAdmin) return;

    const confirm = window.confirm(
      `Delete quotation #${quotation.quotationNumber}? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      setDeletingId(quotation._id);
      await deleteQuotation(quotation._id).unwrap();
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete quotation:", err);
      setDeletingId(null);
      alert(
        err?.data?.message ||
          "Failed to delete quotation. Please try again."
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* header + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Quotations
          </h2>
          <p className="text-xs text-slate-500">
            List, edit, print{isAdmin ? " and delete" : ""} quotations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, subject, number..."
            className="w-48 md:w-64 border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        {isLoading && (
          <p className="text-xs text-slate-500">Loading quotations…</p>
        )}

        {isError && (
          <p className="text-xs text-red-600">
            Failed to load quotations.{" "}
            <span className="text-[10px] text-slate-400">
              {error?.data?.message || ""}
            </span>
          </p>
        )}

        {!isLoading && !isError && quotations.length === 0 && (
          <p className="text-xs text-slate-500">
            No quotations found. Create a new one from the top right
            button.
          </p>
        )}

        {!isLoading && !isError && quotations.length > 0 && (
          <div className="mt-1 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-1.5 text-left">Date</th>
                  <th className="px-2 py-1.5 text-left">Quotation #</th>
                  <th className="px-2 py-1.5 text-left">Company</th>
                  <th className="px-2 py-1.5 text-left">Client</th>
                  <th className="px-2 py-1.5 text-left">Subject</th>
                  <th className="px-2 py-1.5 text-center">Total Items</th>
                  <th className="px-2 py-1.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr
                    key={q._id}
                    className="border-b last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-2 py-1.5">
                      {q.date ? q.date.slice(0, 10) : "-"}
                    </td>
                    <td className="px-2 py-1.5 font-medium text-slate-800">
                      {q.quotationNumber}
                    </td>
                    <td className="px-2 py-1.5">{q.companyName}</td>
                    <td className="px-2 py-1.5">{q.clientName}</td>
                    <td className="px-2 py-1.5 max-w-[260px] truncate">
                      {q.subject}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {q.items?.length || 0}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(q)}
                          className="px-3 py-1.5 rounded-md border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(q)}
                          className="px-3 py-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Print
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(q)}
                            disabled={
                              isDeleting && deletingId === q._id
                            }
                            className="px-3 py-1.5 rounded-md border border-red-200 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {isDeleting && deletingId === q._id
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

export default QuotationList;
