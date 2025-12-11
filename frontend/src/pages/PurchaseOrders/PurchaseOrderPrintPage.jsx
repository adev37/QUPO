// frontend/src/pages/PurchaseOrders/PurchaseOrderPrintPage.jsx
import React from "react";
import PurchaseOrderPrint from "../../components/purchaseOrders/PurchaseOrderPrint";
import { useAuth } from "../../hooks/useAuth";

const PurchaseOrderPrintPage = () => {
  const { user } = useAuth();

  const canPO =
    !!user?.canCreatePurchaseOrder || user?.role === "admin";

  if (!user || !canPO) {
    return (
      <div className="p-4 no-print">
        <p className="text-sm text-red-600">
          You do not have permission to view or print purchase orders.
        </p>
      </div>
    );
  }

  return <PurchaseOrderPrint />;
};

export default PurchaseOrderPrintPage;
