import { baseApi } from "./baseApi";

export const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotations: builder.query({
      query: () => "/quotations",
      providesTags: (result) =>
        result
          ? [
              ...result.map((q) => ({ type: "Quotation", id: q._id })),
              { type: "Quotation", id: "LIST" },
            ]
          : [{ type: "Quotation", id: "LIST" }],
    }),

    getQuotation: builder.query({
      query: (id) => `/quotations/${id}`,
      providesTags: (result, error, id) => [
        { type: "Quotation", id },
      ],
    }),

    createQuotation: builder.mutation({
      query: (body) => ({
        url: "/quotations",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Quotation", id: "LIST" }],
    }),

    updateQuotation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/quotations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
      ],
    }),

    deleteQuotation: builder.mutation({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationApi;
