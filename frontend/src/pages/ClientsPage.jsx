// frontend/src/pages/ClientsPage.jsx
import { useState, useMemo, useEffect } from "react";
import {
  useGetClientsQuery,
  useCreateOrUpdateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} from "../services/clientApi";

const pageSize = 10;

// Local modal (same pattern as Companies page)
function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xs"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Client form (create + edit)
function ClientForm({ initialValues, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    gstin: "",
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        address: initialValues.address || "",
        contact: initialValues.contact || "",
        email: initialValues.email || "",
        gstin: initialValues.gstin || "",
      });
    } else {
      setForm({
        name: "",
        address: "",
        contact: "",
        email: "",
        gstin: "",
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend only requires name; everything else is optional.
    if (!form.name.trim()) {
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ajay Kumar"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Contact
          </label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Phone / Mobile"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="client@example.com"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            If an existing client has the same email, it will be updated
            automatically.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Address
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={2}
          placeholder="Address used in quotations"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            GSTIN
          </label>
          <input
            name="gstin"
            value={form.gstin}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

const ClientsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: clients = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClientsQuery();

  const [createOrUpdateClient, { isLoading: isCreating }] =
    useCreateOrUpdateClientMutation();
  const [updateClient, { isLoading: isUpdating }] =
    useUpdateClientMutation();
  const [deleteClient, { isLoading: isDeleting }] =
    useDeleteClientMutation();

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const term = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.contact?.toLowerCase().includes(term)
    );
  }, [clients, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreateModal = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedClient) {
        // explicit update by id
        await updateClient({ id: selectedClient._id, ...values }).unwrap();
      } else {
        // create or upsert by email as per backend logic
        await createOrUpdateClient(values).unwrap();
      }
      closeModal();
    } catch (e) {
      console.error("Failed to save client", e);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.name}"?`)) return;
    try {
      await deleteClient(client._id).unwrap();
    } catch (e) {
      console.error("Failed to delete client", e);
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-slate-800">Clients</h1>
          <p className="text-xs text-slate-500">
            List & manage clients, reuse in quotations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
        >
          + Add Client
        </button>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error?.data?.message || "Failed to load clients."}
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-[11px] text-slate-500">
          Total: <span className="font-semibold">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  #
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Address
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Contact
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  GSTIN
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
                    colSpan={7}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    Loading clients...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    No clients found.
                  </td>
                </tr>
              ) : (
                pageItems.map((client, index) => (
                  <tr
                    key={client._id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {client.name}
                    </td>
                    <td className="px-3 py-2 text-slate-700 max-w-xs">
                      <div className="line-clamp-2">
                        {client.address || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {client.contact || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {client.email || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {client.gstin || "-"}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-[11px] text-indigo-600 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        disabled={isDeleting}
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

        {/* Pagination */}
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
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedClient ? "Edit Client" : "Add Client"}
      >
        <ClientForm
          initialValues={selectedClient}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={isSaving}
        />
      </Modal>
    </div>
  );
};

export default ClientsPage;
