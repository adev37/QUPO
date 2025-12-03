// frontend/src/pages/PurchaseOrders/PurchaseOrderCreatePage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import PurchaseOrderForm from "../../components/purchaseOrders/PurchaseOrderForm";

const PurchaseOrderCreatePage = () => {
  const location = useLocation();
  const defaultCompanyCode = location.state?.selectedCompanyCode || "";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">
          Create Purchase Order
        </h1>
        <p className="text-sm text-slate-600">
          Select company and fill in PO details.
        </p>
      </div>

      <PurchaseOrderForm defaultCompanyCode={defaultCompanyCode} />
    </div>
  );
};

export default PurchaseOrderCreatePage;
