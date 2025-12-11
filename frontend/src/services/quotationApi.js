// frontend/src/services/quotationApi.js
import { baseApi } from "./baseApi";

export const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotations: builder.query({
      // args can be { limit, companyCode, search }
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.limit) searchParams.set("limit", params.limit);
        if (params.companyCode) searchParams.set("companyCode", params.companyCode);
        if (params.search) searchParams.set("search", params.search);

        const qs = searchParams.toString();
        return qs ? `/quotations?${qs}` : "/quotations";
      },
      providesTags: (result = []) => [
        "Quotation",
        ...result.map((q) => ({ type: "Quotation", id: q._id })),
      ],
    }),

    getQuotation: builder.query({
      query: (id) => `/quotations/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Quotation", id }],
    }),

    createQuotation: builder.mutation({
      query: (body) => ({
        url: "/quotations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quotation"],
    }),

    updateQuotation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/quotations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        "Quotation",
        { type: "Quotation", id },
      ],
    }),

    deleteQuotation: builder.mutation({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quotation"],
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
