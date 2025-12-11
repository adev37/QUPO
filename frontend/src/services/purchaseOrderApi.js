// frontend/src/services/purchaseOrderApi.js
import { baseApi } from "./baseApi";

export const purchaseOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      // args can be { limit, companyCode, search }
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.limit) searchParams.set("limit", params.limit);
        if (params.companyCode) searchParams.set("companyCode", params.companyCode);
        if (params.search) searchParams.set("search", params.search);

        const qs = searchParams.toString();
        return qs ? `/purchase-orders?${qs}` : "/purchase-orders";
      },
      providesTags: (result = []) => [
        "PurchaseOrder",
        ...result.map((po) => ({ type: "PurchaseOrder", id: po._id })),
      ],
    }),

    getPurchaseOrderById: builder.query({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: "PurchaseOrder", id }],
    }),

    createPurchaseOrder: builder.mutation({
      query: (body) => ({
        url: "/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),

    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        "PurchaseOrder",
        { type: "PurchaseOrder", id },
      ],
    }),

    deletePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/purchase-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseOrder"],
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
