// frontend/src/services/purchaseOrderApi.js
import { baseApi } from "./baseApi";

export const purchaseOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: (params = {}) => ({
        url: "/purchase-orders",
        params, // { search, companyCode }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((po) => ({ type: "PurchaseOrder", id: po._id })),
              { type: "PurchaseOrder", id: "LIST" },
            ]
          : [{ type: "PurchaseOrder", id: "LIST" }],
    }),
    getPurchaseOrderById: builder.query({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseOrder", id }],
    }),
    createPurchaseOrder: builder.mutation({
      query: (body) => ({
        url: "/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PurchaseOrder", id },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),
    deletePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/purchase-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PurchaseOrder", id },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrderApi;
