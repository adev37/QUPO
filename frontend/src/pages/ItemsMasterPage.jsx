import React, { useEffect, useMemo, useState } from "react";
import {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from "../services/itemApi";
import ItemForm from "../components/items/ItemForm";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";

const pageSize = 10;

const ItemsMasterPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [localError, setLocalError] = useState("");

  const {
    data: items = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useGetItemsQuery();

  const [createItem, { isLoading: creating }] = useCreateItemMutation();
  const [updateItem, { isLoading: updating }] = useUpdateItemMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();

  const submitting = creating || updating || deleting;

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (isError && queryError) {
    console.error("getItems error:", queryError);
  }

  // ---------- normalize fields (so UI never breaks) ----------
  const normalizeItem = (it) => {
    const description = it?.description || it?.name || "-";
    const model = it?.model || it?.modelNo || it?.modelNumber || "-";
    const unit = it?.unit || "-";
    const price = it?.rate ?? it?.price ?? it?.unitPrice ?? "-";
    const gst = it?.gst ?? it?.gstPercent ?? it?.gstRate ?? "-";
    const hsn = it?.hsn || "-";

    return { ...it, description, model, unit, price, gst, hsn };
  };

  // ---------- Filter ----------
  const filtered = useMemo(() => {
    const list = items.map(normalizeItem);

    if (!search.trim()) return list;
    const term = search.toLowerCase();

    return list.filter((it) => {
      return (
        String(it.description).toLowerCase().includes(term) ||
        String(it.model).toLowerCase().includes(term) ||
        String(it.unit).toLowerCase().includes(term) ||
        String(it.hsn).toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  // ---------- Pagination ----------
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // ---------- Modal controls ----------
  const openNewItemModal = () => {
    setEditingItem(null);
    setLocalError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setLocalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  // ---------- CRUD ----------
  const handleSaveItem = async (payload) => {
    try {
      setLocalError("");

      if (payload?._id) {
        const { _id, ...body } = payload;
        await updateItem({ id: _id, ...body }).unwrap();
      } else {
        const { _id, ...body } = payload || {};
        await createItem(body).unwrap();
      }

      closeModal();
    } catch (err) {
      console.error("save item error:", err);
      setLocalError(err?.data?.message || "Failed to save item");
    }
  };

  const handleDeleteItem = async (item) => {
    if (
      !window.confirm(`Delete item "${item?.description || "this item"}"?`)
    )
      return;

    try {
      setLocalError("");
      await deleteItem(item._id).unwrap();
    } catch (err) {
      console.error("delete item error:", err);
      setLocalError(err?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-base font-semibold text-slate-800">Item Master</h1>
          <p className="text-xs text-slate-500">
            Maintain the catalogue of all items used in quotations &amp; purchase
            orders.
          </p>
        </div>

        <div className="shrink-0">
          <Button onClick={openNewItemModal}>+ New Item</Button>
        </div>
      </div>

      {/* Error banners */}
      {isError && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {queryError?.data?.message ||
            "Failed to load items. Please check backend /items API."}
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {localError && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {localError}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by description, model, unit, or HSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-[11px] text-slate-500">
          Total: <span className="font-semibold">{total}</span>
        </div>
      </div>

      {/* ✅ MOBILE CARDS (shows only on <sm) */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-xs text-slate-500">Loading items...</div>
        ) : pageItems.length === 0 ? (
          <div className="text-xs text-slate-500">No items found.</div>
        ) : (
          pageItems.map((item, index) => (
            <div
              key={item._id}
              className="border border-slate-200 bg-white rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.description}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
                      #{startIndex + index + 1}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                      {item.model}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                      {item.unit}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Price</div>
                  <div className="text-sm font-semibold text-slate-900">
                    ₹ {item.price}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-slate-500">GST %</div>
                <div className="text-right text-slate-800 font-medium">
                  {item.gst}
                </div>

                <div className="text-slate-500">HSN</div>
                <div className="text-right text-slate-800 font-medium">
                  {item.hsn}
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-3 text-[11px]">
                <button
                  onClick={() => openEditModal(item)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(item)}
                  disabled={deleting}
                  className="text-red-600 font-semibold hover:underline disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination (mobile) */}
        <div className="px-3 py-2 border border-slate-200 rounded-lg bg-white flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {total === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, total)}
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

      {/* ✅ TABLE (shows only on sm+) */}
      <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  #
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Description
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Model
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Unit
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Price (₹)
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  GST %
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  HSN
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    Loading items...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    No items found.
                  </td>
                </tr>
              ) : (
                pageItems.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {item.description}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{item.model}</td>
                    <td className="px-3 py-2 text-slate-700">{item.unit}</td>
                    <td className="px-3 py-2 text-slate-700">{item.price}</td>
                    <td className="px-3 py-2 text-slate-700">{item.gst}</td>
                    <td className="px-3 py-2 text-slate-700">{item.hsn}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-[11px] text-indigo-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        disabled={deleting}
                        className="text-[11px] text-red-600 hover:underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (desktop/tablet) */}
        <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {total === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, total)}
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

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Item" : "New Item"}
        footer={null}
      >
        <ItemForm
          initialItem={editingItem}
          onSubmit={handleSaveItem}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};

export default ItemsMasterPage;
