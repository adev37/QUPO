// frontend/src/pages/quotations/QuotationEditPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useGetQuotationQuery } from "../../services/quotationApi";
import QuotationForm from "../../components/quotations/QuotationForm";

const QuotationEditPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetQuotationQuery(id);

  if (isLoading) {
    return <p className="text-sm">Loading quotation...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        Failed to load quotation.
      </p>
    );
  }

  return <QuotationForm initialQuotation={data} />;
};

export default QuotationEditPage;
