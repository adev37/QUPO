import React, { useMemo, useState, useEffect } from "react";
import { COMPANY_CONFIGS } from "../config/companyConfig";

const pageSize = 10;

function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const companies = useMemo(() => Object.values(COMPANY_CONFIGS), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const term = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        String(c.contact || "").toLowerCase().includes(term) ||
        String(c.gstin || "").toLowerCase().includes(term)
    );
  }, [companies, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-base font-semibold text-slate-800">Companies</h1>
        <p className="text-xs text-slate-500 mt-1">
          Static companies used in Quotations &amp; Purchase Orders. Edit them in{" "}
          <code className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200">
            src/config/companyConfig.js
          </code>
          .
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, code, email, contact, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between sm:block">
          <span>
            Total: <span className="font-semibold">{total}</span>
          </span>
        </div>
      </div>

      {/* Desktop/Table view */}
      <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 w-12">#</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 min-w-[240px]">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 min-w-[120px]">
                  Code
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 min-w-[140px]">
                  Contact
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 min-w-[220px]">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 min-w-[180px]">
                  GSTIN
                </th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-500">
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
                    <td className="px-3 py-2 text-slate-800">{company.name}</td>
                    <td className="px-3 py-2 text-slate-700">{company.code}</td>
                    <td className="px-3 py-2 text-slate-700">{company.contact || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{company.email || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{company.gstin || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationBar
          total={total}
          startIndex={startIndex}
          pageSize={pageSize}
          safePage={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      {/* Mobile/Card view */}
      <div className="sm:hidden space-y-3">
        {pageItems.length === 0 ? (
          <div className="border border-slate-200 rounded-lg bg-white p-4 text-xs text-slate-500 text-center">
            No companies found.
          </div>
        ) : (
          pageItems.map((company, index) => (
            <div
              key={company.code}
              className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {company.name}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      #{startIndex + index + 1}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {company.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <Row label="Contact" value={company.contact || "-"} />
                <Row label="Email" value={company.email || "-"} />
                <Row label="GSTIN" value={company.gstin || "-"} />
              </div>
            </div>
          ))
        )}

        {/* Pagination (Mobile) */}
        <div className="border border-slate-200 rounded-lg bg-white">
          <PaginationBar
            total={total}
            startIndex={startIndex}
            pageSize={pageSize}
            safePage={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>
    </div>
  );
}

export default CompaniesPage;

/* ---------------- small helpers ---------------- */

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-xs text-slate-800 text-right break-all">{value}</div>
    </div>
  );
}

function PaginationBar({
  total,
  startIndex,
  pageSize,
  safePage,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
      <div>
        Showing{" "}
        <span className="font-semibold">
          {total === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, total)}
        </span>{" "}
        of <span className="font-semibold">{total}</span>
      </div>

      <div className="space-x-1">
        <button
          disabled={safePage === 1}
          onClick={onPrev}
          className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
        >
          Prev
        </button>
        <button
          disabled={safePage === totalPages}
          onClick={onNext}
          className="px-2 py-1 border border-slate-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
