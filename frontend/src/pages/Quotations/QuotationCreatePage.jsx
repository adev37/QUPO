// frontend/src/pages/quotations/QuotationCreatePage.jsx
import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import QuotationForm from "../../components/quotations/QuotationForm";

const QuotationCreatePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateCode =
    location.state?.selectedCompanyCode || location.state?.companyCode;

  const queryCode =
    searchParams.get("company") || searchParams.get("companyCode");

  const defaultCompanyCode = stateCode || queryCode || "BRBIO";

  return <QuotationForm defaultCompanyCode={defaultCompanyCode} />;
};

export default QuotationCreatePage;
