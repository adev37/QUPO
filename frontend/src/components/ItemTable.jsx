import React, { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";

const ItemTable = ({ items = [], onEdit, onDelete }) => {
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.description?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term)
    );
  });

  const formatMoney = (v) =>
    typeof v === "number"
      ? v.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : "";

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-3">
        <div className="w-64">
          <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filtered.length} of {items.length}
        </div>
      </div>

      <div className="border border-slate-200 rounded overflow-auto bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-2 py-2 border-b text-left">Description</th>
              <th className="px-2 py-2 border-b text-left">Model</th>
              <th className="px-2 py-2 border-b text-left">Unit</th>
              <th className="px-2 py-2 border-b text-right">Price (₹)</th>
              <th className="px-2 py-2 border-b text-right">GST %</th>
              <th className="px-2 py-2 border-b text-left">HSN</th>
              <th className="px-2 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="px-2 py-1 border-b">{item.description}</td>
                <td className="px-2 py-1 border-b">{item.model}</td>
                <td className="px-2 py-1 border-b">{item.unit}</td>
                <td className="px-2 py-1 border-b text-right">{formatMoney(item.price)}</td>
                <td className="px-2 py-1 border-b text-right">{item.gst}</td>
                <td className="px-2 py-1 border-b">{item.hsn}</td>
                <td className="px-2 py-1 border-b text-center">
                  <Button variant="ghost" className="mr-1" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(item)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="px-2 py-4 text-center text-slate-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemTable;
