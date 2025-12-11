import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://qupo-api.vercel.app/api";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState();
    let token = state?.auth?.token;

    if (!token) {
      try {
        const raw = localStorage.getItem("auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token;
        }
      } catch {
        // ignore JSON parse error
      }
    }

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
    "User",
  ],
  endpoints: () => ({}),
});
