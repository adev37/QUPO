// frontend/src/services/itemApi.js
import { baseApi } from "./baseApi";

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: (params) => ({
        url: "/items",
        params,
      }),
      // 🔹 Normalise whatever the backend sends into a plain array
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.items)) return response.items;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result) && result.length > 0
          ? [
              ...result.map((item) => ({
                type: "Item",
                id: item._id,
              })),
              { type: "Item", id: "LIST" },
            ]
          : [{ type: "Item", id: "LIST" }],
    }),

    getItemById: builder.query({
      query: (id) => `/items/${id}`,
      providesTags: (result, error, id) => [{ type: "Item", id }],
    }),

    createItem: builder.mutation({
      query: (body) => ({
        url: "/items",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Item", id: "LIST" }],
    }),

    updateItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/items/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Item", id },
        { type: "Item", id: "LIST" },
      ],
    }),

    deleteItem: builder.mutation({
      query: (id) => ({
        url: `/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Item", id },
        { type: "Item", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemApi;
