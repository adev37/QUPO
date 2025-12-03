// frontend/src/components/items/ItemTable.jsx
import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";

const PAGE_SIZE = 10;

const ItemTable = ({ items = [], onEdit, onDelete }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.description?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term)
    );
  });

  // 🔢 Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const pageItems = filtered.slice(startIndex, endIndex);

  // Reset to first page if search text or items change
  useEffect(() => {
    setPage(1);
  }, [search, items.length]);

  const formatMoney = (v) =>
    typeof v === "number"
      ? v.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : "";

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-3">
        <div className="w-64">
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-500 mt-6">
          Showing {totalItems === 0 ? 0 : startIndex + 1}–
          {endIndex} of {items.length}
        </div>
      </div>

      <div className="border border-slate-200 rounded overflow-auto bg-white">
        <table className="min-w-full text-sm text-slate-800">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="px-3 py-2 border-b text-left font-semibold">
                Description
              </th>
              <th className="px-3 py-2 border-b text-left font-semibold">
                Model
              </th>
              <th className="px-3 py-2 border-b text-left font-semibold">
                Unit
              </th>
              <th className="px-3 py-2 border-b text-right font-semibold">
                Price (₹)
              </th>
              <th className="px-3 py-2 border-b text-right font-semibold">
                GST %
              </th>
              <th className="px-3 py-2 border-b text-left font-semibold">
                HSN
              </th>
              <th className="px-3 py-2 border-b text-center font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-3 py-2 border-b text-slate-800">
                  {item.description}
                </td>
                <td className="px-3 py-2 border-b text-slate-800">
                  {item.model}
                </td>
                <td className="px-3 py-2 border-b text-slate-800">
                  {item.unit}
                </td>
                <td className="px-3 py-2 border-b text-right text-slate-800">
                  {formatMoney(item.price)}
                </td>
                <td className="px-3 py-2 border-b text-right text-slate-800">
                  {item.gst}
                </td>
                <td className="px-3 py-2 border-b text-slate-800">
                  {item.hsn}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  <Button
                    variant="ghost"
                    className="mr-1"
                    onClick={() => onEdit?.(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onDelete?.(item)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {pageItems.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border text-xs ${
              currentPage === 1
                ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                : "border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
            }`}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border text-xs ${
              currentPage === totalPages
                ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                : "border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemTable;
