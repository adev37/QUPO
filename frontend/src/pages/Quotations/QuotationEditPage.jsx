// frontend/src/pages/quotations/QuotationEditPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useGetQuotationQuery } from "../../services/quotationApi";
import QuotationForm from "../../components/quotations/QuotationForm";
import { useAuth } from "../../hooks/useAuth";

const QuotationEditPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetQuotationQuery(id);
  const { user } = useAuth();

  const canQuotation =
    !!user?.canCreateQuotation || user?.role === "admin";

  if (!user || !canQuotation) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-2">
          Edit Quotation
        </h1>
        <p className="text-sm text-red-600">
          You do not have permission to edit quotations.
        </p>
      </div>
    );
  }

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
