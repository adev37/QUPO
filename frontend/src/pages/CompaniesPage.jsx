// frontend/src/pages/CompaniesPage.jsx
import React, { useMemo, useState } from "react";
import { COMPANY_CONFIGS } from "../config/companyConfig";

const pageSize = 10;

function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Turn static map into array once
  const companies = useMemo(
    () => Object.values(COMPANY_CONFIGS),
    []
  );

  // Filter by name / code / email
  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const term = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [companies, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // reset to first page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-slate-800">
            Companies
          </h1>
          <p className="text-xs text-slate-500">
            Static companies used in Quotations &amp; Purchase Orders.
            Edit them in <code>src/config/companyConfig.js</code>.
          </p>
        </div>
        {/* No “Add Company” button because companies are static */}
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-[11px] text-slate-500">
          Total: <span className="font-semibold">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  #
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Code
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Contact
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  GSTIN
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    No companies found.
                  </td>
                </tr>
              ) : (
                pageItems.map((company, index) => (
                  <tr
                    key={company.code}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {company.name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {company.code}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {company.contact || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {company.email || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {company.gstin || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {total === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, total)}
            </span>{" "}
            of <span className="font-semibold">{total}</span>
          </div>
          <div className="space-x-1">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompaniesPage;
