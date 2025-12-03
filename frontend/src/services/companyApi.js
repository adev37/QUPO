// frontend/src/services/companyApi.js
import { baseApi } from "./baseApi";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: () => "/companies",
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Company", id: c._id })),
              { type: "Company", id: "LIST" },
            ]
          : [{ type: "Company", id: "LIST" }],
    }),
    getCompany: builder.query({
      query: (id) => `/companies/${id}`,
      providesTags: (result, error, id) => [{ type: "Company", id }],
    }),
    createCompany: builder.mutation({
      query: (body) => ({
        url: "/companies",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Company", id: "LIST" }],
    }),
    updateCompany: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/companies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Company", id },
        { type: "Company", id: "LIST" },
      ],
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Company", id },
        { type: "Company", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companyApi;
