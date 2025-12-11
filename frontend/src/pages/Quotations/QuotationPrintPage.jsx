// frontend/src/pages/quotations/QuotationPrintPage.jsx
import React from "react";
import QuotationPrint from "../../components/quotations/QuotationPrint";
import { useAuth } from "../../hooks/useAuth";

const QuotationPrintPage = () => {
  const { user } = useAuth();

  const canQuotation =
    !!user?.canCreateQuotation || user?.role === "admin";

  if (!user || !canQuotation) {
    return (
      <div className="p-4 no-print">
        <p className="text-sm text-red-600">
          You do not have permission to view or print quotations.
        </p>
      </div>
    );
  }

  return <QuotationPrint />;
};

export default QuotationPrintPage;
