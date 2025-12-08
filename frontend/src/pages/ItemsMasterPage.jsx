// frontend/src/pages/ItemsMasterPage.jsx
import React, { useState } from "react";
import {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from "../services/itemApi";
import ItemForm from "../components/items/ItemForm";
import ItemTable from "../components/items/ItemTable";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";

const ItemsMasterPage = () => {
  const {
    data: items = [],
    isLoading,
    isError,
    error: queryError,
  } = useGetItemsQuery();

  const [createItem, { isLoading: creating }] = useCreateItemMutation();
  const [updateItem, { isLoading: updating }] = useUpdateItemMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");

  if (isError && queryError) {
    // This will help you see exact backend error in console
    // (4xx/5xx, CORS, network, etc.)
    console.error("getItems error:", queryError);
  }

  const openNewItemModal = () => {
    setEditingItem(null);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setError("");
    setModalOpen(true);
  };

  const handleSaveItem = async (payload) => {
    try {
      setError("");

      if (payload._id) {
        const { _id, ...body } = payload;
        await updateItem({ id: _id, ...body }).unwrap();
      } else {
        const { _id, ...body } = payload;
        await createItem(body).unwrap();
      }

      setModalOpen(false);
    } catch (err) {
      console.error("save item error:", err);
      setError(err?.data?.message || "Failed to save item");
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      setError("");
      await deleteItem(item._id).unwrap();
    } catch (err) {
      console.error("delete item error:", err);
      setError(err?.data?.message || "Failed to delete item");
    }
  };

  const submitting = creating || updating || deleting;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Item Master</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain the catalogue of all items used in quotations and purchase
            orders.
          </p>
        </div>

        <Button onClick={openNewItemModal}>+ New Item</Button>
      </div>

      {/* Status messages */}
      {isError && (
        <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          Failed to load items. Please check backend /items API.
        </p>
      )}
      {error && (
        <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-sm text-slate-600">Loading items...</div>
      ) : (
        <ItemTable
          items={items}
          onEdit={openEditModal}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Modal for create / edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Item" : "New Item"}
        footer={null}
      >
        <ItemForm
          initialItem={editingItem}
          onSubmit={handleSaveItem}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};

export default ItemsMasterPage;
