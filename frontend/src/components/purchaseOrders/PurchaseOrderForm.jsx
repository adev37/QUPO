import React from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrderForm } from "../../hooks/usePurchaseOrderForm";
import {
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
} from "../../services/purchaseOrderApi";
import SpecsBlock from "../specs/SpecsBlock";
import Button from "../common/Button";
import { ROUTES } from "../../config/routesConfig";
import { getCompanyConfig } from "../../config/companyConfig";

// 🔹 Helper: calculate totals from items
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

const PurchaseOrderForm = ({
  initialPurchaseOrder,
  defaultCompanyCode = "",
}) => {
  const navigate = useNavigate();

  const {
    register,
    control, // kept for completeness (not used directly here)
    handleSubmit,
    watch,
    fields,
    append,
    remove,
    itemSuggestions,
    handleItemDescriptionChange,
    handleSelectItemSuggestion,
    managerSuggestions,
    isManagerFocused,
    setIsManagerFocused,
    managerWrapperRef,
    handleManagerNameChange,
    handleSelectManager,
    isEdit,
  } = usePurchaseOrderForm(initialPurchaseOrder, defaultCompanyCode);

  const [createPO, { isLoading: isCreating }] =
    useCreatePurchaseOrderMutation();
  const [updatePO, { isLoading: isUpdating }] =
    useUpdatePurchaseOrderMutation();

  const companyCode = watch("companyCode");
  const purchaseNumber = watch("purchaseNumber");
  const items = watch("items") || [];
  const cfg = getCompanyConfig(companyCode);

  // 🔹 Live totals from current form items
  const totals = React.useMemo(
    () => calcTotalsFromItems(items),
    [items]
  );

  const onSubmit = async (data) => {
    try {
      const rawItems = data.items || [];

      // 🔹 Filter out completely empty items
      const nonEmptyItems = rawItems.filter(
        (it) => it.description && it.quantity && it.unitPrice
      );

      // 🔹 Front-end validation: must have at least 1 line item
      if (nonEmptyItems.length === 0) {
        alert(
          "Please add at least one item with Description, Qty and Unit Price before saving the Purchase Order."
        );
        return;
      }

      const mappedItems = nonEmptyItems.map((it) => {
        const quantity = Number(it.quantity) || 0;
        const unitPrice = Number(it.unitPrice) || 0;
        const gstPercent = Number(it.gstPercent) || 0;

        const base = quantity * unitPrice;
        const gstAmount = (base * gstPercent) / 100;
        const totalAmount = base + gstAmount;

        return {
          description: it.description,
          modelNo: it.modelNo,
          model: it.modelNo,
          hsn: it.hsn,
          quantity,
          unitPrice,
          price: unitPrice,
          gstPercent,
          gst: gstPercent,
          gstAmount,
          totalAmount,
          hasFeature: !!it.hasFeature,
          feature: it.feature || "",
        };
      });

      // 🔹 Recalculate totals from mappedItems to be 100% sure
      const { subTotal, totalGST, grandTotal } =
        calcTotalsFromItems(mappedItems);

      const payload = {
        // Company
        companyCode: data.companyCode,
        companyName: data.companyName || cfg.name,
        companyAddress: data.companyAddress || cfg.address,
        companyContact: data.companyContact || cfg.contact,
        companyEmail: data.companyEmail || cfg.email,
        companyGSTIN: data.companyGSTIN || cfg.gstin,

        // PO info
        date: data.date,
        purchaseNumber: data.purchaseNumber,
        orderAgainst: data.orderAgainst,
        deliveryPeriod: data.deliveryPeriod,
        placeInstallation: data.placeInstallation,

        // Supplier / manager
        SalesManagerName: data.SalesManagerName,
        managerAddress: data.managerAddress,
        managerContact: data.managerContact,
        managerEmail: data.managerEmail,
        managerGSTIN: data.managerGSTIN,

        items: mappedItems,
        terms: data.terms,

        // 🔹 Correct totals
        subTotal,
        totalGST,
        grandTotal,
      };

      // Optional: log what is being sent
      console.log("PO payload being sent:", payload);

      let saved;
      if (isEdit && initialPurchaseOrder?._id) {
        saved = await updatePO({
          id: initialPurchaseOrder._id,
          ...payload,
        }).unwrap();
      } else {
        saved = await createPO(payload).unwrap();
      }

      const id = saved._id || saved.id;

      if (id && ROUTES.POS_PRINT) {
        navigate(ROUTES.POS_PRINT.replace(":id", id));
      } else if (ROUTES.POS_LIST) {
        navigate(ROUTES.POS_LIST);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error saving purchase order:", err);
      // Show backend validation message if available
      const msg =
        err?.data?.message ||
        err?.error ||
        "Something went wrong while saving the purchase order.";
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
        pr-2 pb-6 bg-transparent
      "
      autoComplete="off"
    >
      {/* Sticky header – same style family as quotation */}
      <div className="flex items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-3 z-10 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 uppercase">
          {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
        </h2>
        <div className="text-xs sm:text-sm text-slate-600 text-right">
          PO No:{" "}
          <span className="font-semibold">
            {purchaseNumber || "To be assigned"}
          </span>
        </div>
      </div>

      {/* Company & Supplier card */}
      <section className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Company &amp; Supplier Details
          </h3>
          <p className="text-[11px] text-slate-500">
            Fill billing company and supplier / sales manager info.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To (company) */}
          <div className="space-y-3 border border-slate-100 rounded-lg p-3 bg-slate-50/60">
            <h4 className="text-xs font-bold text-slate-700 mb-1">
              Company (Bill To)
            </h4>

            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Company Name
              </label>
              <input
                {...register("companyName")}
                placeholder="Company Name"
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Address
              </label>
              <input
                {...register("companyAddress")}
                placeholder="Company Address"
                required
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  {...register("companyContact")}
                  placeholder="Company Contact"
                  required
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  GSTIN
                </label>
                <input
                  {...register("companyGSTIN")}
                  placeholder="Company GSTIN"
                  required
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("companyEmail")}
                placeholder="Company Email"
                required
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Supplier / Sales Manager */}
          <div className="space-y-3 border border-slate-100 rounded-lg p-3 bg-slate-50/60">
            <h4 className="text-xs font-bold text-slate-700 mb-1">
              Supplier / Sales Manager
            </h4>

            <div ref={managerWrapperRef} className="relative w-full">
              <label className="block text-[11px] font-semibold mb-1">
                Name
              </label>
              <input
                {...register("SalesManagerName")}
                placeholder="Sales Manager Name"
                required
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => handleManagerNameChange(e.target.value)}
                onFocus={() => setIsManagerFocused(true)}
              />

              {managerSuggestions.length > 0 && isManagerFocused && (
                <ul className="absolute z-20 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-40 overflow-y-auto text-sm shadow">
                  {managerSuggestions.map((m, idx) => (
                    <li
                      key={idx}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectManager(m)}
                    >
                      {m.name} — {m.email}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Address
              </label>
              <input
                {...register("managerAddress")}
                placeholder="Address"
                required
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  {...register("managerContact")}
                  placeholder="Contact"
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  GSTIN
                </label>
                <input
                  {...register("managerGSTIN")}
                  placeholder="GSTIN"
                  required
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("managerEmail")}
                placeholder="Email"
                required
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Order info */}
      <section className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Order Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-xs mb-1">Date</label>
            <input
              type="date"
              {...register("date")}
              required
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-xs mb-1">
              Purchase Order No.
            </label>
            <input
              type="text"
              {...register("purchaseNumber")}
              required
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <div>
            <label className="block font-semibold text-xs mb-1">
              Purchase Order Against
            </label>
            <input
              type="text"
              {...register("orderAgainst")}
              required
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-xs mb-1">
              Delivery Period On
            </label>
            <input
              type="text"
              {...register("deliveryPeriod")}
              required
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-xs mb-1">
              Place of Installation
            </label>
            <input
              type="text"
              {...register("placeInstallation")}
              required
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-800">Items</h3>
          <p className="text-[11px] text-slate-500">
            Add models, quantities, GST and optional feature text.
          </p>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/40"
            >
              <input
                value={index + 1}
                readOnly
                className="p-2 border rounded text-sm bg-gray-100 text-center"
              />

              <input
                {...register(`items.${index}.modelNo`)}
                placeholder="Model No."
                className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />

              <div className="relative col-span-2 lg:col-span-2">
                <input
                  {...register(`items.${index}.description`)}
                  placeholder="Description"
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  onChange={(e) =>
                    handleItemDescriptionChange(index, e.target.value)
                  }
                />

                {itemSuggestions[index]?.length > 0 && (
                  <ul className="absolute z-20 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-40 overflow-y-auto text-sm shadow">
                    {itemSuggestions[index].map((it, i) => (
                      <li
                        key={i}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectItemSuggestion(index, it)}
                      >
                        {it.description} — {it.model}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                {...register(`items.${index}.hsn`)}
                placeholder="HSN"
                className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                {...register(`items.${index}.quantity`)}
                placeholder="Qty"
                className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                {...register(`items.${index}.unitPrice`)}
                placeholder="Unit Price"
                className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                {...register(`items.${index}.gstPercent`)}
                placeholder="GST %"
                className="p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-white bg-red-500 rounded-full px-4 py-1 text-sm hover:bg-red-600 self-center"
              >
                X
              </button>

              {/* Feature / Specs text */}
              <div className="col-span-full flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`items.${index}.hasFeature`)}
                  id={`feature-toggle-${index}`}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`feature-toggle-${index}`}
                  className="text-sm"
                >
                  Add Feature / Specification
                </label>
              </div>

              {watch(`items.${index}.hasFeature`) && (
                <textarea
                  {...register(`items.${index}.feature`)}
                  placeholder="Feature / specification details..."
                  rows={3}
                  className="col-span-full border p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => append()}
          >
            + Add Item
          </Button>
        </div>

        {/* Totals – neutral dark text, no green */}
        <div className="border-t pt-4 mt-4 text-sm space-y-1 text-right">
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

      {/* Terms & Specifications */}
      <section className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-3">
        <div>
          <label className="block font-semibold text-sm mb-1">
            Terms &amp; Conditions
          </label>
          <textarea
            {...register("terms")}
            rows={8}
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Placeholders <code>{"{{orderAgainst}}"}</code>,{" "}
            <code>{"{{deliveryPeriod}}"}</code> and{" "}
            <code>{"{{placeInstallation}}"}</code> will be replaced
            automatically on the print page.
          </p>
        </div>

        <SpecsBlock items={items} heading="Specifications" />
      </section>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 justify-end pt-1 pb-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isEdit ? "Save & View PO" : "Submit & View PO"}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
