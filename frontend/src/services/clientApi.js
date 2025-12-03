// frontend/src/services/clientApi.js
import { baseApi } from "./baseApi";

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // list with optional search
    getClients: builder.query({
      query: (params = {}) => ({
        url: "/clients",
        params,       // { search, email }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Client", id: c._id })),
              { type: "Client", id: "LIST" },
            ]
          : [{ type: "Client", id: "LIST" }],
    }),
    getClientById: builder.query({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),
    createOrUpdateClient: builder.mutation({
      // backend will update existing if email matches
      query: (body) => ({
        url: "/clients",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Client", id: "LIST" }],
    }),
    updateClient: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/clients/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Client", id },
        { type: "Client", id: "LIST" },
      ],
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Client", id },
        { type: "Client", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateOrUpdateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi;
