// frontend/src/pages/quotations/QuotationCreatePage.jsx
import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import QuotationForm from "../../components/quotations/QuotationForm";
import { useAuth } from "../../hooks/useAuth";

const QuotationCreatePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const canQuotation =
    !!user?.canCreateQuotation || user?.role === "admin";

  if (!user || !canQuotation) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-2">
          Create Quotation
        </h1>
        <p className="text-sm text-red-600">
          You do not have permission to create quotations.
        </p>
      </div>
    );
  }

  const stateCode =
    location.state?.selectedCompanyCode || location.state?.companyCode;

  const queryCode =
    searchParams.get("company") || searchParams.get("companyCode");

  const defaultCompanyCode = stateCode || queryCode || "BRBIO";

  return <QuotationForm defaultCompanyCode={defaultCompanyCode} />;
};

export default QuotationCreatePage;
