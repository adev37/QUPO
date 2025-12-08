import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuotationForm } from "../../hooks/useQuotationForm";
import {
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
} from "../../services/quotationApi";
import Button from "../common/Button";
import { getCompanyConfig } from "../../config/companyConfig";

// 🔹 Helper to calculate totals from items
const calcTotalsFromItems = (items = []) => {
  let subTotal = 0;
  let totalGST = 0;

  items.forEach((it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice ?? it.price ?? 0);
    const gst = Number(it.gstPercent ?? it.gst ?? 0);

    const base = qty * price;
    const gstAmount = (base * gst) / 100;

    subTotal += base;
    totalGST += gstAmount;
  });

  const grandTotal = subTotal + totalGST;
  return { subTotal, totalGST, grandTotal };
};

const QuotationForm = ({ initialQuotation, defaultCompanyCode = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // if coming from modal via location.state
  const stateCompanyCode =
    location.state?.selectedCompanyCode || location.state?.companyCode;

  const effectiveCompanyCode =
    initialQuotation?.companyCode ||
    stateCompanyCode ||
    defaultCompanyCode ||
    "BRBIO";

  const {
    register,
    handleSubmit,
    watch,
    fields,
    append,
    remove,
    itemSuggestions,
    handleItemDescriptionChange,
    handleSelectItemSuggestion,
    clientSuggestions,
    isClientNameFocused,
    setIsClientNameFocused,
    clientNameWrapperRef,
    handleClientNameChange,
    handleSelectClient,
    termsList,
    checkedTerms,
    handleTermCheckboxChange,
    isEdit,
    setValue,
  } = useQuotationForm(initialQuotation, effectiveCompanyCode);

  const [createQuotation, { isLoading: isCreating }] =
    useCreateQuotationMutation();
  const [updateQuotation, { isLoading: isUpdating }] =
    useUpdateQuotationMutation();

  const items = watch("items") || [];
  const quotationNumber = watch("quotationNumber");
  const companyCode = watch("companyCode");

  // 🔹 Live totals from current items
  const totals = React.useMemo(
    () => calcTotalsFromItems(items),
    [items]
  );

  // ensure form has companyCode from navigation/state on mount
  React.useEffect(() => {
    if (effectiveCompanyCode && !companyCode) {
      setValue("companyCode", effectiveCompanyCode);
    }
  }, [effectiveCompanyCode, companyCode, setValue]);

  const onSubmit = async (values) => {
    // final company code: static + safe
    const finalCompanyCode =
      values.companyCode || effectiveCompanyCode || "BRBIO";
    const cfg = getCompanyConfig(finalCompanyCode);

    const rawItems = values.items || [];

    // 🔹 filter out fully empty rows
    const nonEmptyItems = rawItems.filter(
      (it) => it.description && it.quantity && it.unitPrice
    );

    // 🔹 must have at least one proper line
    if (nonEmptyItems.length === 0) {
      alert(
        "Please add at least one item with Description, Qty and Unit Price before saving the quotation."
      );
      return;
    }

    const mappedItems = nonEmptyItems.map((it) => ({
      ...it,
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.unitPrice) || 0,
      gstPercent: Number(it.gstPercent) || 0,
    }));

    // 🔹 Recalculate totals from mapped items
    const { subTotal, totalGST, grandTotal } =
      calcTotalsFromItems(mappedItems);

    const payload = {
      ...values,
      companyCode: finalCompanyCode,
      companyName: cfg.name,
      items: mappedItems,
      subTotal,
      totalGST,
      grandTotal,
    };

    try {
      let saved;
      if (isEdit && initialQuotation?._id) {
        saved = await updateQuotation({
          id: initialQuotation._id,
          ...payload,
        }).unwrap();
      } else {
        saved = await createQuotation(payload).unwrap();
      }

      navigate(`/quotations/${saved._id}/print`);
    } catch (err) {
      console.error("Failed to save quotation", err);
      const msg =
        err?.data?.message ||
        err?.error ||
        "Failed to save quotation. Please check console.";
      alert(msg);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="
        space-y-6 max-w-5xl mx-auto
        max-h-[calc(100vh-140px)] overflow-y-auto
        pr-2 pb-6
      "
      autoComplete="off"
    >
      {/* Sticky header – same style as PO */}
      <div className="flex items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-3 z-10 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-semibold text-blue-600 uppercase">
          {isEdit ? "Edit Quotation" : "Create Quotation"}
        </h1>
        <div className="text-xs sm:text-sm text-slate-600 text-right">
          Quotation No:{" "}
          <span className="font-semibold">
            {quotationNumber || "Auto"}
          </span>
        </div>
      </div>

      {/* Client details card – styled similar to PO company card */}
      <section className="bg-white shadow rounded-lg p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-slate-800">
            Client Details
          </h2>
          <p className="text-[11px] text-slate-500">
            Fill client contact and billing information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client name with suggestions */}
          <div ref={clientNameWrapperRef} className="relative">
            <label className="block text-[11px] font-semibold mb-1">
              Client Name
            </label>
            <input
              {...register("clientName", { required: true })}
              placeholder="Client Name"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => handleClientNameChange(e.target.value)}
              onFocus={() => setIsClientNameFocused(true)}
            />
            {clientSuggestions.length > 0 && isClientNameFocused && (
              <ul className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-y-auto text-xs">
                {clientSuggestions.map((c) => (
                  <li
                    key={c._id}
                    className="px-2 py-1 cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSelectClient(c)}
                  >
                    <span className="font-medium">{c.name}</span> —{" "}
                    {c.email} — {c.contact}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1">
              Client Email
            </label>
            <input
              type="email"
              {...register("clientEmail", { required: true })}
              placeholder="Client Email"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1">
              Client Contact
            </label>
            <input
              {...register("clientContact")}
              placeholder="Client Contact"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1">
              Client GSTIN
            </label>
            <input
              {...register("clientGSTIN")}
              placeholder="Client GSTIN"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold mb-1">
              Client Address
            </label>
            <input
              {...register("clientAddress", { required: true })}
              placeholder="Client Address"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Dates & subject – similar to PO order info */}
      <section className="bg-white shadow rounded-lg p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Quotation Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold mb-1">
              Date
            </label>
            <input
              type="date"
              {...register("date", { required: true })}
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1">
              Valid Until
            </label>
            <input
              type="date"
              {...register("validUntil", { required: true })}
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1">
              Quotation No.
            </label>
            <input
              {...register("quotationNumber")}
              readOnly
              className="w-full p-2 border rounded text-sm bg-gray-100 text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold mb-1">
            Subject
          </label>
          <input
            {...register("subject", { required: true })}
            placeholder="Subject"
            className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Items – mimic PO layout */}
      <section className="bg-white shadow rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Items
          </h2>
          <p className="text-[11px] text-slate-500">
            Add item descriptions, quantities, GST and pricing.
          </p>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const rowSuggestions = itemSuggestions[index] || [];
            return (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/40"
              >
                {/* S No */}
                <input
                  value={index + 1}
                  readOnly
                  className="p-2 border rounded text-sm bg-gray-100 text-center"
                />

                {/* Model No */}
                <input
                  {...register(`items.${index}.modelNo`)}
                  placeholder="Model No."
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Description with suggestions */}
                <div className="relative col-span-2 lg:col-span-2">
                  <input
                    {...register(`items.${index}.description`, {
                      required: true,
                    })}
                    placeholder="Description"
                    className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) =>
                      handleItemDescriptionChange(index, e.target.value)
                    }
                  />
                  {rowSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-y-auto text-xs">
                      {rowSuggestions.map((it) => (
                        <li
                          key={it._id}
                          className="px-2 py-1 cursor-pointer hover:bg-slate-100"
                          onClick={() =>
                            handleSelectItemSuggestion(index, it)
                          }
                        >
                          {it.description} — {it.modelNo || it.model}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* HSN – to match PO layout */}
                <input
                  {...register(`items.${index}.hsn`)}
                  placeholder="HSN"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Qty */}
                <input
                  type="number"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Qty"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="1"
                />

                {/* Unit price */}
                <input
                  type="number"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Unit Price"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />

                {/* GST % */}
                <input
                  type="number"
                  {...register(`items.${index}.gstPercent`, {
                    valueAsNumber: true,
                  })}
                  placeholder="GST %"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-white bg-red-500 rounded-full px-4 py-1 text-sm hover:bg-red-600 self-center"
                >
                  X
                </button>

                {/* Feature toggle */}
                <div className="col-span-full flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`items.${index}.hasFeature`)}
                    id={`q-feature-toggle-${index}`}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`q-feature-toggle-${index}`}
                    className="text-sm"
                  >
                    Add Feature Description
                  </label>
                </div>

                {watch(`items.${index}.hasFeature`) && (
                  <textarea
                    rows={3}
                    {...register(`items.${index}.feature`)}
                    placeholder="Feature / specification details..."
                    className="col-span-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Add item button (same styling as PO) */}
        <div className="mt-4 flex justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => append()}
          >
            + Add Item
          </Button>
        </div>

        {/* Totals – same look as PO (neutral text) */}
        <div className="mt-4 text-sm flex flex-col items-end gap-1 border-t pt-3">
          <p>
            <strong>Subtotal:</strong> ₹{totals.subTotal.toFixed(2)}
          </p>
          <p>
            <strong>Total GST:</strong> ₹{totals.totalGST.toFixed(2)}
          </p>
          <p className="font-semibold text-slate-900">
            <strong>Grand Total:</strong> ₹{totals.grandTotal.toFixed(2)}
          </p>
        </div>
      </section>

      {/* Terms & conditions – same card style as PO */}
      <section className="bg-white shadow rounded-lg p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Terms &amp; Conditions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {termsList.map((term, idx) => (
            <label
              key={idx}
              className="flex items-start gap-2 text-xs text-slate-700"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={checkedTerms.includes(term)}
                onChange={(e) =>
                  handleTermCheckboxChange(e.target.checked, term)
                }
              />
              <span>{term}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Additional / Edited Terms
          </label>
          <textarea
            rows={6}
            className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("terms")}
          />
        </div>
      </section>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pb-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/quotations")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isEdit ? "Update & View" : "Save & View"}
        </Button>
      </div>
    </form>
  );
};

export default QuotationForm;
