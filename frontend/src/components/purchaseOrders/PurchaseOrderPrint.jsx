import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPurchaseOrderByIdQuery } from "../../services/purchaseOrderApi";
import SpecsBlock from "../specs/SpecsBlock";
import { numberToIndianWords } from "../../utils/numberToIndianWords";
import Button from "../common/Button";
import { getCompanyConfig } from "../../config/companyConfig";

const PurchaseOrderPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: po, isLoading } = useGetPurchaseOrderByIdQuery(id);

  const handlePrint = useCallback(() => {
    const printRoot = document.getElementById("po-print-root");
    const customTitle = `PO-${po?.purchaseNumber || ""}`;

    if (!printRoot) {
      window.print();
      return;
    }

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
            .no-print { display: none !important; visibility: hidden !important; }
            .print\\:table-header-group { display: table-header-group !important; }
            .print\\:table-footer-group { display: table-footer-group !important; }
            .po-table { border-collapse: collapse !important; width: 100%; }
            .po-table th, .po-table td { border: 1px solid #cbd5e0; }
            .specs-html ul {
              list-style: disc;
              padding-left: 18px;
              margin: 0;
            }
            .specs-html li { margin: 0; }
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
  }, [po]);

  if (isLoading) {
    return <p className="text-sm">Loading purchase order...</p>;
  }

  if (!po) {
    return <p className="text-sm text-red-600">Purchase order not found.</p>;
  }

  const items = po.items || [];

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

  const cfg = getCompanyConfig(po.companyCode || "");
  const companyName =
    po.companyName ||
    po.company?.name ||
    cfg?.name ||
    po.companyCode ||
    "Our Company";

  const headerImageSrc = cfg?.headerImage || null;
  const stampImageSrc = cfg?.stampImage || null;

  const billToName =
    po.companyName || po.company?.name || cfg?.name || "";
  const billToAddress =
    po.companyAddress || po.company?.address || cfg?.address || "";
  const billToContact =
    po.companyContact || po.company?.contact || cfg?.contact || "";
  const billToEmail =
    po.companyEmail || po.company?.email || cfg?.email || "";
  const billToGSTIN =
    po.companyGSTIN || po.company?.gstin || cfg?.gstin || "";

  const formattedDate = po.date?.slice(0, 10) || "";
  const rows = Array.from({ length: 4 });

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
        <div id="po-print-root" className="w-full max-w-[210mm] mx-auto bg-white">
          <table className="w-full table-auto border-collapse print:table">
            <thead className="print:table-header-group">
              <tr>
                <td colSpan={9} className="pb-1">
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
              {/* Title + date + orderAgainst */}
              <tr>
                <td colSpan={9} className="pt-3">
                  <h1 className="text-lg md:text-2xl font-bold text-blue-600 uppercase mb-1 text-center">
                    Purchase Order No. {po.purchaseNumber}
                  </h1>

                  <div className="flex justify-between text-xs md:text-sm">
                    <p className="m-0">
                      <span className="font-bold">Date:</span> {formattedDate}
                    </p>
                    {po.orderAgainst && (
                      <p className="m-0">
                        <span className="font-bold">Order Against:</span>{" "}
                        {po.orderAgainst}
                      </p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Supplier block */}
              <tr>
                <td colSpan={9} className="pt-4">
                  <div className="text-xs md:text-sm">
                    <p className="text-sm font-bold mb-1 md:text-base">
                      Mr. {po.SalesManagerName}
                    </p>
                    {po.managerAddress && (
                      <p>
                        <span className="font-bold">Address :</span>{" "}
                        {po.managerAddress}
                      </p>
                    )}
                    {po.managerContact && (
                      <p>
                        <span className="font-bold">Contact no. :</span>{" "}
                        {po.managerContact}
                      </p>
                    )}
                    {po.managerEmail && (
                      <p>
                        <span className="font-bold">Email :</span>{" "}
                        {po.managerEmail}
                      </p>
                    )}
                    {po.managerGSTIN && (
                      <p>
                        <span className="font-bold">GSTIN :</span>{" "}
                        {po.managerGSTIN}
                      </p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Intro */}
              <tr>
                <td colSpan={9} className="pt-4">
                  <p className="text-sm md:text-base mb-1">
                    Dear{" "}
                    <span className="font-bold">
                      Mr. {po.SalesManagerName}
                    </span>
                    ,
                  </p>
                  <p className="text-xs md:text-sm mb-3">
                    Please refer to our conversation. We are pleased to confirm
                    the purchase order with the following terms &amp; conditions:
                  </p>
                </td>
              </tr>

              {/* Items table */}
              <tr>
                <td colSpan={9}>
                  <table className="w-full table-auto border-collapse text-xs md:text-sm po-table">
                    <thead>
                      <tr className="bg-gray-100 text-xs md:text-sm">
                        <th className="border border-gray-400 p-1 min-w-[40px]">
                          S No.
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[80px]">
                          Model No.
                        </th>
                        <th className="border border-gray-400 px-2 py-1 text-left min-w-[180px] max-w-[230px]">
                          Description
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[60px]">
                          HSN
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[40px]">
                          Qty
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[80px]">
                          Unit Price
                        </th>
                        <th className="border border-gray-400 p-1 min-w-[60px]">
                          GST (%)
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
                        const price = Number(it.price ?? it.unitPrice ?? 0);
                        const gst = Number(it.gst ?? it.gstPercent ?? 0);

                        // Prefer backend-stored values, but still safe
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
                            <td className="border border-gray-400 p-1">
                              {it.modelNo || it.model}
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
                              {it.hsn}
                            </td>
                            <td className="border border-gray-400 p-1">
                              {qty}
                            </td>
                            <td className="border border-gray-400 p-1">
                              ₹{price.toFixed(2)}
                            </td>
                            <td className="border border-gray-400 p-1">
                              {gst}
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

                      {/* Totals row */}
                      <tr className="text-xs md:text-sm font-semibold border-b border-gray-400">
                        <td colSpan={5} className="border border-gray-400" />
                        <td className="border border-gray-400 p-2 text-left">
                          Subtotal: ₹{subTotal.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 p-2 text-left">
                          Total GST: ₹{totalGST.toFixed(2)}
                        </td>
                        <td
                          colSpan={2}
                          className="border border-gray-400 p-2 text-left"
                        >
                          Grand Total: ₹{grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Grand total in words */}
              <tr>
                <td colSpan={9} className="pt-4 text-xs md:text-sm">
                  <strong>In Words:</strong>{" "}
                  {numberToIndianWords(grandTotal)}
                </td>
              </tr>

              {/* Specifications */}
              <tr>
                <td colSpan={9} className="pt-4">
                  <SpecsBlock items={items} heading="Specifications" />
                </td>
              </tr>

              {/* Terms & Conditions */}
              {po.terms && (
                <tr>
                  <td colSpan={9} className="pt-6">
                    <h2 className="text-sm md:text-base font-bold mb-2">
                      Terms &amp; Conditions
                    </h2>
                    {po.terms.split("\n").map((line, i) => {
                      const replacedLine = line
                        .replace(
                          /{{orderAgainst}}/g,
                          `<span class="underline font-bold">${
                            po.orderAgainst || ""
                          }</span>`
                        )
                        .replace(
                          /{{deliveryPeriod}}/g,
                          `<span class="underline font-bold">${
                            po.deliveryPeriod || ""
                          }</span>`
                        )
                        .replace(
                          /{{placeInstallation}}/g,
                          `<span class="underline font-bold">${
                            po.placeInstallation || ""
                          }</span>`
                        );

                      return (
                        <p
                          key={i}
                          className="text-xs md:text-sm"
                          dangerouslySetInnerHTML={{ __html: replacedLine }}
                        />
                      );
                    })}
                  </td>
                </tr>
              )}

              {/* Bill To block */}
              <tr>
                <td colSpan={9} className="pt-4">
                  <div className="text-sm">
                    <h3 className="text-blue-500 py-1 rounded text-base font-bold">
                      Bill To
                    </h3>
                    <p className="text-sm font-bold mb-1">{billToName}</p>
                    {billToAddress && (
                      <p>
                        <span className="font-bold">Address :</span>{" "}
                        {billToAddress}
                      </p>
                    )}
                    {billToContact && (
                      <p>
                        <span className="font-bold">Contact no. :</span>{" "}
                        {billToContact}
                      </p>
                    )}
                    {billToEmail && (
                      <p>
                        <span className="font-bold">Email :</span>{" "}
                        {billToEmail}
                      </p>
                    )}
                    {billToGSTIN && (
                      <p>
                        <span className="font-bold">GSTIN :</span>{" "}
                        {billToGSTIN}
                      </p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Signature block + stamp */}
              <tr>
                <td colSpan={9} className="pt-8">
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm">Yours Sincerely,</p>
                    <p className="text-sm font-bold">For {companyName}</p>
                    {stampImageSrc && (
                      <img
                        src={stampImageSrc}
                        alt="Authorised Signatory"
                        className="h-16 mt-1"
                      />
                    )}
                    <p className="text-sm font-bold">Authorised Signatory</p>
                  </div>
                </td>
              </tr>

              {/* Acceptance text */}
              <tr>
                <td colSpan={9} className="pt-6">
                  <div className="text-center">
                    <p className="underline text-sm font-bold">
                      ACCEPTANCE OF ABOVE TERMS &amp; CONDITIONS
                    </p>
                    <p className="text-xs mt-2">
                      BY SIGNING THIS PAGE, THE SUPPLIER ACKNOWLEDGES AND
                      AGREES TO THE TERMS AND CONDITIONS OF THIS ORDER COPY.
                    </p>
                  </div>
                </td>
              </tr>

              {/* Signature lines */}
              <tr>
                <td colSpan={9} className="pt-6">
                  <div className="w-[80%] text-xs print:mt-4">
                    <div className="grid grid-cols-3 gap-4 mb-3 items-center md:grid-cols-4">
                      <p className="font-bold">SIGNATURE:</p>
                      <div className="border-b border-black w-full h-5"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3 items-center md:grid-cols-4">
                      <p className="font-bold">NAME WITH TITLE:</p>
                      <div className="border-b border-black w-full h-5"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3 items-center md:grid-cols-4">
                      <p className="font-bold">DATE:</p>
                      <div className="border-b border-black w-full h-5"></div>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Delivery Schedule */}
              <tr>
                <td colSpan={9} className="pt-8 pb-6">
                  <div className="w-full max-w-4xl mx-auto">
                    <h2 className="text-center text-xl font-semibold underline mb-4">
                      Delivery Schedule
                    </h2>

                    <table className="w-full border border-black border-collapse text-xs md:text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-black p-2">Date</th>
                          <th className="border border-black p-2">
                            Via Which Transport
                          </th>
                          <th className="border border-black p-2">
                            Truck/Other Mode Details
                          </th>
                          <th className="border border-black p-2">
                            Driver Details
                          </th>
                          <th className="border border-black p-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((_, idx) => (
                          <tr key={idx}>
                            <td className="border border-black p-2 h-10"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default PurchaseOrderPrint;
