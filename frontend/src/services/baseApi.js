// frontend/src/services/baseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    // 1) try Redux state
    const state = getState();
    let token = state?.auth?.token;

    // 2) fallback to localStorage (for hard refresh / direct open)
    if (!token) {
      try {
        const raw = localStorage.getItem("auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token;
        }
      } catch {
        // ignore
      }
    }

    // 3) final fallback if something still uses qp_token
    if (!token) {
      token = localStorage.getItem("qp_token");
    }

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Company",
    "Client",
    "Item",
    "SalesManager",
    "Quotation",
    "PurchaseOrder",
  ],
  endpoints: () => ({}),
});
