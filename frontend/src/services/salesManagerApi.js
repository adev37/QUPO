// frontend/src/services/salesManagerApi.js
import { baseApi } from "./baseApi";

export const salesManagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesManagers: builder.query({
      query: (params = {}) => ({
        url: "/sales-managers",
        params, // { search }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: "SalesManager", id: m._id })),
              { type: "SalesManager", id: "LIST" },
            ]
          : [{ type: "SalesManager", id: "LIST" }],
    }),
    getSalesManagerById: builder.query({
      query: (id) => `/sales-managers/${id}`,
      providesTags: (result, error, id) => [{ type: "SalesManager", id }],
    }),
    createOrUpdateSalesManager: builder.mutation({
      // backend updates if email already exists
      query: (body) => ({
        url: "/sales-managers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SalesManager", id: "LIST" }],
    }),
    updateSalesManager: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sales-managers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SalesManager", id },
        { type: "SalesManager", id: "LIST" },
      ],
    }),
    deleteSalesManager: builder.mutation({
      query: (id) => ({
        url: `/sales-managers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SalesManager", id },
        { type: "SalesManager", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSalesManagersQuery,
  useGetSalesManagerByIdQuery,
  useCreateOrUpdateSalesManagerMutation,
  useUpdateSalesManagerMutation,
  useDeleteSalesManagerMutation,
} = salesManagerApi;
