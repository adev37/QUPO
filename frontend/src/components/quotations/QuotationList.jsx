import React from "react";
import { Link } from "react-router-dom";
import {
  useGetQuotationsQuery,
  useDeleteQuotationMutation,
} from "../../services/quotationApi";
import Button from "../common/Button";
import { getCompanyConfig } from "../../config/companyConfig";

const QuotationList = () => {
  const { data: quotations = [], isLoading } = useGetQuotationsQuery();
  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationMutation();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quotation?")) return;
    try {
      await deleteQuotation(id).unwrap();
    } catch (err) {
      console.error("Failed to delete quotation", err);
      alert("Failed to delete quotation.");
    }
  };

  if (isLoading) {
    return <p className="text-sm">Loading quotations...</p>;
  }

  if (!quotations.length) {
    return (
      <p className="text-sm text-slate-600">
        No quotations yet. Create your first quotation.
      </p>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <table className="w-full text-xs md:text-sm">
        <thead className="border-b text-left">
          <tr>
            <th className="py-2 pr-2">Date</th>
            <th className="py-2 pr-2">Quotation No</th>
            <th className="py-2 pr-2">Company</th>
            <th className="py-2 pr-2">Client</th>
            <th className="py-2 pr-2">Subject</th>
            <th className="py-2 pr-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((q) => {
            const cfg = getCompanyConfig(q.companyCode);

            return (
              <tr key={q._id} className="border-b last:border-0">
                <td className="py-2 pr-2">
                  {q.date ? q.date.slice(0, 10) : "-"}
                </td>
                <td className="py-2 pr-2">{q.quotationNumber}</td>
                <td className="py-2 pr-2">{cfg.name}</td>
                <td className="py-2 pr-2">{q.clientName}</td>
                <td className="py-2 pr-2 max-w-xs truncate">
                  {q.subject}
                </td>
                <td className="py-2 pr-2 text-right space-x-2">
                  <Link to={`/quotations/${q._id}/print`}>
                    <Button size="xs" variant="ghost">
                      View
                    </Button>
                  </Link>
                  <Link to={`/quotations/${q._id}/edit`}>
                    <Button size="xs" variant="ghost">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => handleDelete(q._id)}
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

export default QuotationList;
