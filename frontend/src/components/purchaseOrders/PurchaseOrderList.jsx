import React from "react";
import { Link } from "react-router-dom";
import {
  useGetPurchaseOrdersQuery,
  useDeletePurchaseOrderMutation,
} from "../../services/purchaseOrderApi";
import Button from "../common/Button";
import { getCompanyConfig } from "../../config/companyConfig";

const PurchaseOrderList = () => {
  const { data: pos = [], isLoading } = useGetPurchaseOrdersQuery();
  const [deletePO, { isLoading: isDeleting }] =
    useDeletePurchaseOrderMutation();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase order?")) return;
    try {
      await deletePO(id).unwrap();
    } catch (err) {
      console.error("Failed to delete purchase order", err);
      alert("Failed to delete purchase order.");
    }
  };

  if (isLoading) {
    return <p className="text-sm">Loading purchase orders...</p>;
  }

  if (!pos.length) {
    return (
      <p className="text-sm text-slate-600">
        No purchase orders yet. Create your first PO.
      </p>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <table className="w-full text-xs md:text-sm">
        <thead className="border-b text-left">
          <tr>
            <th className="py-2 pr-2">Date</th>
            <th className="py-2 pr-2">PO No</th>
            <th className="py-2 pr-2">Company</th>
            <th className="py-2 pr-2">Supplier</th>
            <th className="py-2 pr-2">Order Against</th>
            <th className="py-2 pr-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pos.map((po) => {
            const cfg = getCompanyConfig(po.companyCode);

            return (
              <tr key={po._id} className="border-b last:border-0">
                <td className="py-2 pr-2">
                  {po.date ? po.date.slice(0, 10) : "-"}
                </td>
                <td className="py-2 pr-2">{po.purchaseNumber}</td>
                <td className="py-2 pr-2">{cfg.name}</td>
                <td className="py-2 pr-2">
                  {po.SalesManagerName || po.supplierName}
                </td>
                <td className="py-2 pr-2 max-w-xs truncate">
                  {po.orderAgainst}
                </td>
                <td className="py-2 pr-2 text-right space-x-2">
                  <Link to={`/purchase-orders/${po._id}/print`}>
                    <Button size="xs" variant="ghost">
                      View
                    </Button>
                  </Link>
                  <Link to={`/purchase-orders/${po._id}/edit`}>
                    <Button size="xs" variant="ghost">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => handleDelete(po._id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderList;
