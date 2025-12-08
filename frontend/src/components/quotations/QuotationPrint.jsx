import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetQuotationQuery } from "../../services/quotationApi";
import SpecsBlock from "../specs/SpecsBlock";
import { numberToIndianWords } from "../../utils/numberToIndianWords";
import Button from "../common/Button";
import { getCompanyConfig } from "../../config/companyConfig";

const QuotationPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useGetQuotationQuery(id);

  const handlePrint = useCallback(() => {
    const printRoot = document.getElementById("quotation-print-root");
    if (!printRoot) {
      window.print();
      return;
    }

    const customTitle = `Quotation-${quotation?.quotationNumber || ""}`;
    const content = printRoot.innerHTML;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${customTitle}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 8mm 12mm 12mm 12mm;
            }

            body {
              margin: 0;
              padding: 0;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .no-print {
              display: none !important;
              visibility: hidden !important;
            }

            .print\\:table-header-group {
              display: table-header-group !important;
            }

            .print\\:table-footer-group {
              display: table-footer-group !important;
            }

            .quotation-table {
              border-collapse: collapse !important;
              width: 100%;
            }

            .quotation-table th,
            .quotation-table td {
              border: 1px solid #cbd5e0;
            }

            .specs-html ul { 
              list-style: disc; 
              padding-left: 18px; 
              margin: 0; 
            }

            .specs-html li { 
              margin: 0; 
            }

            .client-box p { 
              margin: 0 !important; 
              padding: 0 !important; 
            }

            .break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 150);">
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
  }, [quotation]);

  if (isLoading) {
    return <p className="text-sm">Loading quotation...</p>;
  }

  if (!quotation) {
    return <p className="text-sm text-red-600">Quotation not found.</p>;
  }

  const items = quotation.items || [];

  // 🔹 Always compute totals from items only
  const subTotal = items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price ?? it.unitPrice ?? 0);
    return sum + qty * price;
  }, 0);

  const totalGST = items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price ?? it.unitPrice ?? 0);
    const gst = Number(it.gst ?? it.gstPercent ?? 0);
    return sum + (qty * price * gst) / 100;
  }, 0);

  const grandTotal = subTotal + totalGST;

  const cfg = getCompanyConfig(quotation.companyCode || "");
  const companyName =
    cfg?.name ||
    quotation.company?.name ||
    quotation.companyName ||
    quotation.companyCode ||
    "Our Company";

  const headerImageSrc = cfg?.headerImage || null;
  const stampImageSrc = cfg?.stampImage || null;

  const formattedDate = quotation.date?.slice(0, 10) || "";
  const formattedValid = quotation.validUntil?.slice(0, 10) || "";

  return (
    <div className="w-full flex justify-center">
      <div
        className="
          bg-white max-w-[210mm] my-4 shadow print:shadow-none print:m-0 print:max-w-none
          px-3 print:px-0
          h-[calc(100vh-120px)]
          overflow-y-auto
          print:h-auto print:overflow-visible
        "
      >
        {/* top buttons – not printed */}
        <div className="flex justify-end gap-2 p-4 border-b border-slate-200 no-print">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={handlePrint}>Print</Button>
        </div>

        {/* PRINT ROOT */}
        <div
          id="quotation-print-root"
          className="w-full max-w-[210mm] mx-auto bg-white"
        >
          <table className="w-full table-auto border-collapse print:table">
            {/* HEADER ROW */}
            <thead className="print:table-header-group">
              <tr>
                <td colSpan={8} className="pb-1">
                  {headerImageSrc ? (
                    <img
                      src={headerImageSrc}
                      alt={companyName}
                      className="w-full"
                    />
                  ) : (
                    <div className="pb-2 border-b border-slate-300">
                      <h1 className="text-base font-semibold m-0">
                        {companyName}
                      </h1>
                    </div>
                  )}
                </td>
              </tr>
            </thead>

            <tbody className="print:table-row-group">
              {/* TITLE + DATE / VALID */}
              <tr>
                <td colSpan={8} className="pt-3">
                  <h1 className="text-lg md:text-2xl font-bold text-blue-600 uppercase mb-1 text-center">
                    Quotation {quotation.quotationNumber}
                  </h1>

                  <div className="flex justify-between text-xs md:text-sm">
                    <p className="m-0">
                      <span className="font-bold">Date:</span>{" "}
                      {formattedDate}
                    </p>
                    <p className="m-0">
                      <span className="font-bold">Valid:</span>{" "}
                      {formattedValid}
                    </p>
                  </div>
                </td>
              </tr>

              {/* TO block */}
              <tr>
                <td colSpan={8} className="pt-4">
                  <h3 className="text-blue-600 font-bold mb-1 text-sm md:text-base">
                    To,
                  </h3>
                  <div className="text-xs md:text-sm client-box">
                    <p className="font-bold m-0">
                      {quotation.clientName}
                    </p>
                    {quotation.clientAddress && (
                      <p className="m-0">{quotation.clientAddress}</p>
                    )}
                    {quotation.clientContact && (
                      <p className="m-0">
                        <strong>Contact:</strong>{" "}
                        {quotation.clientContact}
                      </p>
                    )}
                    {quotation.clientEmail && (
                      <p className="m-0">
                        <strong>Email:</strong>{" "}
                        {quotation.clientEmail}
                      </p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Dear + subject */}
              <tr>
                <td colSpan={8} className="pt-4">
                  <p className="font-bold text-sm md:text-base mb-1">
                    Dear Sir/Madam,
                  </p>
                  <p className="text-sm md:text-base mb-3">
                    <span className="font-bold">Subject:</span>{" "}
                    {quotation.subject}
                  </p>
                </td>
              </tr>

              {/* ITEMS TABLE */}
              <tr>
                <td colSpan={8}>
                  <table className="w-full table-auto border-collapse text-xs md:text-sm quotation-table">
                    <thead>
                      <tr className="bg-gray-100 text-xs md:text-sm">
                        <th className="border border-gray-400 p-1 min-w-[40px]">
                          S No.
                        </th>
                        <th className="border border-gray-400 px-2 py-1 text-left min-w-[180px] max-w-[230px]">
                          Description
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[80px]">
                          Model No.
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[40px]">
                          Qty
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[60px]">
                          GST (%)
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[80px]">
                          Unit Price
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[80px]">
                          GST Amt
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[80px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, index) => {
                        const qty = Number(it.quantity) || 0;
                        const price =
                          Number(it.price ?? it.unitPrice ?? 0);
                        const gst =
                          Number(it.gst ?? it.gstPercent ?? 0);

                        // Prefer backend-stored values if present
                        const gstAmt =
                          typeof it.gstAmount === "number"
                            ? it.gstAmount
                            : (qty * price * gst) / 100;

                        const total =
                          typeof it.totalAmount === "number"
                            ? it.totalAmount
                            : qty * price + gstAmt;

                        return (
                          <tr
                            key={index}
                            className="text-center align-top text-xs md:text-sm"
                          >
                            <td className="border border-gray-400 p-1">
                              {index + 1}
                            </td>
                            <td className="border border-gray-400 px-2 py-1 text-left break-words max-w-[230px] whitespace-pre-wrap">
                              <div className="leading-snug">
                                {it.description}
                                {it.hasFeature && it.feature && (
                                  <div className="mt-1 text-[10px]">
                                    <strong>Features:</strong>{" "}
                                    <span className="whitespace-pre-wrap">
                                      {it.feature}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-400 p-1">
                              {it.modelNo || it.model}
                            </td>
                            <td className="border border-gray-400 p-1">
                              {qty}
                            </td>
                            <td className="border border-gray-400 p-1">
                              {gst}
                            </td>
                            <td className="border border-gray-400 p-1">
                              ₹{price.toFixed(2)}
                            </td>
                            <td className="border border-gray-400 p-1">
                              ₹{gstAmt.toFixed(2)}
                            </td>
                            <td className="border border-gray-400 p-1">
                              ₹{total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* totals row */}
                      <tr className="text-xs md:text-sm font-semibold border-b border-gray-400">
                        <td colSpan={5} className="border border-gray-400" />
                        <td className="border border-gray-400 p-2 text-left">
                          Subtotal: ₹{subTotal.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 p-2 text-left">
                          Total GST: ₹{totalGST.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 p-2 text-left">
                          Grand Total: ₹{grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Grand total in words */}
              <tr>
                <td colSpan={8} className="pt-4 text-xs md:text-sm">
                  <strong>Grand Total in Words:</strong>{" "}
                  {numberToIndianWords(grandTotal)}
                </td>
              </tr>

              {/* Specs */}
              <tr>
                <td colSpan={8} className="pt-4">
                  <SpecsBlock items={items} heading="Specifications" />
                </td>
              </tr>

              {/* Terms */}
              {quotation.terms && (
                <tr>
                  <td colSpan={8} className="pt-6">
                    <h2 className="text-sm md:text-base font-bold mb-1">
                      Terms &amp; Conditions
                    </h2>
                    {quotation.terms.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className="text-xs whitespace-pre-line m-0"
                      >
                        {line}
                      </p>
                    ))}
                  </td>
                </tr>
              )}

              {/* Thanking + stamp/signatory */}
              <tr>
                <td colSpan={8} className="pt-8 pb-4">
                  <div>
                    <p className="text-sm font-bold">Thanking You</p>
                    <p className="text-sm mt-2">Yours Sincerely,</p>
                    <p className="text-sm font-bold">
                      For {companyName}
                    </p>

                    {stampImageSrc && (
                      <img
                        src={stampImageSrc}
                        alt="Authorised Signatory"
                        className="w-40 mt-2"
                      />
                    )}

                    <p className="text-sm mt-1">Authorised Signatory</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationPrint;
