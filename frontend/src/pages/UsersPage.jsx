// frontend/src/pages/UsersPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../services/userApi";
import { useRegisterMutation } from "../services/authApi";

const PAGE_SIZE = 10;

const UsersPage = () => {
  const { user: currentUser } = useAuth();

  // 🔒 Page-level restriction
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="px-4 lg:px-6 py-4 lg:py-5">
        <h1 className="text-base font-semibold text-slate-800 mb-2">Users</h1>
        <p className="text-sm text-red-600">
          You don&apos;t have permission to view the Users page.
        </p>
      </div>
    );
  }

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUsersQuery();

  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [registerUser, { isLoading: creating }] = useRegisterMutation();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // -------- EDIT MODAL STATE --------
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    role: "user",
    canCreateQuotation: false,
    canCreatePurchaseOrder: false,
  });
  const [saveError, setSaveError] = useState("");

  // -------- CREATE MODAL STATE --------
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [createError, setCreateError] = useState("");

  // reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  // ------- EDIT HANDLERS -------
  const openEdit = (user) => {
    setEditing(user);
    setEditForm({
      role: user.role || "user",
      canCreateQuotation: !!user.canCreateQuotation,
      canCreatePurchaseOrder: !!user.canCreatePurchaseOrder,
    });
    setSaveError("");
  };

  const closeEdit = () => {
    setEditing(null);
    setSaveError("");
  };

  const handleEditChange = (e) => {
    const { name, type, value, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaveError("");
      await updateUser({
        id: editing._id,
        role: editForm.role,
        canCreateQuotation: !!editForm.canCreateQuotation,
        canCreatePurchaseOrder: !!editForm.canCreatePurchaseOrder,
      }).unwrap();
      closeEdit();
    } catch (err) {
      console.error("Update failed", err);
      setSaveError(err?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.email}" ?`)) return;
    try {
      await deleteUser(u._id).unwrap();
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.data?.message || "Failed to delete user");
    }
  };

  // ------- CREATE HANDLERS -------
  const openCreate = () => {
    setCreateForm({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setCreateError("");
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setCreateError("");
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");

    try {
      await registerUser(createForm).unwrap();
      await refetch();
      closeCreate();
    } catch (err) {
      console.error("Create user failed", err);
      setCreateError(err?.data?.message || "Failed to create user");
    }
  };

  const isSaving = updating || deleting;

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-slate-800">Users</h1>
          <p className="text-xs text-slate-500">
            Manage user roles and permissions for creating quotations and
            purchase orders.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
        >
          + Create New User
        </button>
      </div>

      {/* ERROR BANNER */}
      {isError && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error?.data?.message || "Failed to load users."}
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* SEARCH / SUMMARY */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="text-[11px] text-slate-500">
          Total: <span className="font-semibold">{total}</span>
        </div>
      </div>

      {/* ================= MOBILE CARDS (<sm) ================= */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-xs text-slate-500">Loading users...</div>
        ) : pageItems.length === 0 ? (
          <div className="text-xs text-slate-500">No users found.</div>
        ) : (
          pageItems.map((u, idx) => (
            <div
              key={u._id}
              className="border border-slate-200 bg-white rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-slate-600 break-all">
                    {u.email}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
                      #{start + idx + 1}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 capitalize">
                      {u.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-slate-500">Quotation</div>
                <div className="text-right font-medium text-slate-800">
                  {u.canCreateQuotation ? "Allowed" : "Not Allowed"}
                </div>

                <div className="text-slate-500">Purchase Order</div>
                <div className="text-right font-medium text-slate-800">
                  {u.canCreatePurchaseOrder ? "Allowed" : "Not Allowed"}
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-3 text-[11px]">
                <button
                  onClick={() => openEdit(u)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Edit
                </button>

                {u._id !== currentUser._id && (
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={deleting}
                    className="text-red-600 font-semibold hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination (mobile) */}
        <div className="px-3 py-2 border border-slate-200 rounded-lg bg-white flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {total === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, total)}
            </span>{" "}
            of <span className="font-semibold">{total}</span>
          </div>

          <div className="space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE (sm+) ================= */}
      <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden bg-white">
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
                  Email
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Role
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-600">
                  Create Quotation
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-600">
                  Create Purchase Order
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
                    Loading users...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                pageItems.map((u, idx) => (
                  <tr
                    key={u._id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {start + idx + 1}
                    </td>
                    <td className="px-3 py-2 text-slate-800">{u.name}</td>
                    <td className="px-3 py-2 text-slate-700">{u.email}</td>
                    <td className="px-3 py-2 text-slate-700 capitalize">
                      {u.role}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">
                      {u.canCreateQuotation ? "Allowed" : "Not Allowed"}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">
                      {u.canCreatePurchaseOrder ? "Allowed" : "Not Allowed"}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-[11px] text-indigo-600 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      {u._id !== currentUser._id && (
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deleting}
                          className="text-[11px] text-red-600 hover:underline disabled:opacity-60"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION (desktop) */}
        <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {total === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, total)}
            </span>{" "}
            of <span className="font-semibold">{total}</span>
          </div>
          <div className="space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md border border-slate-200 mx-3 px-4 py-4 text-xs">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">
              Edit User – {editing.email}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    value={editing.name}
                    disabled
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    value={editing.email}
                    disabled
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="canCreateQuotation"
                    checked={editForm.canCreateQuotation}
                    onChange={handleEditChange}
                    className="h-3 w-3"
                  />
                  <span className="text-[11px] text-slate-700">
                    Allow this user to create <strong>Quotations</strong>
                  </span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="canCreatePurchaseOrder"
                    checked={editForm.canCreatePurchaseOrder}
                    onChange={handleEditChange}
                    className="h-3 w-3"
                  />
                  <span className="text-[11px] text-slate-700">
                    Allow this user to create <strong>Purchase Orders</strong>
                  </span>
                </label>
              </div>

              {saveError && (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
                  {saveError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md border border-slate-200 mx-3 px-4 py-4 text-xs">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">
              Create New User
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  required
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  required
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  required
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateChange}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <p className="mt-1 text-[10px] text-slate-400">
                  Note: backend will only allow the very first user to be admin
                  directly. You can upgrade others to admin from this Users
                  page.
                </p>
              </div>

              {createError && (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
