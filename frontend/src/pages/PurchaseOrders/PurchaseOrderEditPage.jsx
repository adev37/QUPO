// frontend/src/pages/PurchaseOrders/PurchaseOrderEditPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import PurchaseOrderForm from "../../components/purchaseOrders/PurchaseOrderForm";
import { useGetPurchaseOrderByIdQuery } from "../../services/purchaseOrderApi";

const PurchaseOrderEditPage = () => {
  const { id } = useParams();
  const { data: purchaseOrder, isLoading } =
    useGetPurchaseOrderByIdQuery(id);

  if (isLoading) {
    return <p className="text-sm">Loading purchase order...</p>;
  }

  if (!purchaseOrder) {
    return (
      <p className="text-sm text-red-600">
        Purchase order not found.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">
          Edit Purchase Order
        </h1>
        <p className="text-sm text-slate-600">
          Update the purchase order and save changes.
        </p>
      </div>

      <PurchaseOrderForm initialPurchaseOrder={purchaseOrder} />
    </div>
  );
};

export default PurchaseOrderEditPage;
