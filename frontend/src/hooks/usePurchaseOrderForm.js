// e.g. frontend/src/hooks/usePurchaseOrderForm.js
import { useEffect, useRef, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { getCompanyConfig } from "../config/companyConfig";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthToken = () => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const DEFAULT_TERMS = `1. Description: We are pleased to give you the work/Purchase Order against {{orderAgainst}}

2. Payment Terms: 50% as in advance and the final 50% at the time of handover

3. Warranty: 3 standard Year + 2 Years Extra Extended Warranty.

4. Replacement: Replacement of defective goods must be changed without any charges. Our Technical team shall inspect the product upon delivery & installation, if found defective/not compliant/used the same shall be replaced without any additional costs. For defective/inferior supply we shall have legal remedy for recovery as well. In case of supply of second-hand goods / used items, the penalty of @200% cost of goods shall be implemented.

5. Training: Training and Site repair must be done without any charges if required.

6. Late supply Clause: If the Delivery of the order is getting delayed it will be charged 2.5% per week as a Late Delivery (LD) Terms

7. Banking Details of Supplier: Proforma Invoice should be with Signature and stamp and Bank details will be there to prevent any mistake

8. Delivery Period: On {{deliveryPeriod}}

9. Place of Delivery: On Actual Site

10. Place of Installation: {{placeInstallation}}

11. Jurisdiction: In case of any dispute all jurisdiction will be in Delhi court.

12. Paper Required: Company GST & PAN Card, Aadhaar Card, KYC Documents (Sign & Stamp)

13. Scope of Work: All charges for local requirement at the time of Installation included in price

14. Invoicing Instructions: The invoice should be prepared as follows:`;

export const usePurchaseOrderForm = (
  initialPurchaseOrder,
  defaultCompanyCode = ""
) => {
  const isEdit = !!initialPurchaseOrder?._id;

  const initialCode =
    initialPurchaseOrder?.companyCode || defaultCompanyCode || "BRBIO";
  const cfg = getCompanyConfig(initialCode);

  const buildDefaults = (source) => {
    const po = source || {};
    return {
      companyCode: po.companyCode || initialCode,
      companyName: po.companyName || po.company?.name || cfg.name || "",
      companyAddress:
        po.companyAddress || po.company?.address || cfg.address || "",
      companyContact:
        po.companyContact || po.company?.contact || cfg.contact || "",
      companyEmail:
        po.companyEmail || po.company?.email || cfg.email || "",
      companyGSTIN:
        po.companyGSTIN || po.company?.gstin || cfg.gstin || "",
      date: po.date
        ? po.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      purchaseNumber: po.purchaseNumber || "",
      orderAgainst: po.orderAgainst || "",
      deliveryPeriod: po.deliveryPeriod || "",
      placeInstallation: po.placeInstallation || "",
      SalesManagerName: po.SalesManagerName || "",
      managerAddress: po.managerAddress || "",
      managerContact: po.managerContact || "",
      managerEmail: po.managerEmail || "",
      managerGSTIN: po.managerGSTIN || "",
      items:
        po.items?.length > 0
          ? po.items.map((it) => ({
              description: it.description || "",
              modelNo: it.modelNo || it.model || "",
              hsn: it.hsn || "",
              quantity: it.quantity ?? 1,
              unitPrice: it.unitPrice ?? it.price ?? 0,
              gstPercent: it.gstPercent ?? it.gst ?? 0,
              hasFeature: !!it.hasFeature,
              feature: it.feature || "",
            }))
          : [
              {
                description: "",
                modelNo: "",
                hsn: "",
                quantity: 1,
                unitPrice: 0,
                gstPercent: 0,
                hasFeature: false,
                feature: "",
              },
            ],
      terms: po.terms || DEFAULT_TERMS,
    };
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: buildDefaults(initialPurchaseOrder),
  });

  const { fields, append: rhfAppend, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [itemSuggestions, setItemSuggestions] = useState({});

  const handleItemDescriptionChange = async (index, value) => {
    setValue(`items.${index}.description`, value);

    if (!value || value.trim().length < 2) {
      setItemSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_URL}/items?search=${encodeURIComponent(value)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      setItemSuggestions((prev) => ({ ...prev, [index]: data || [] }));
    } catch (err) {
      console.error("PO item suggestion error:", err);
      setItemSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleSelectItemSuggestion = (index, item) => {
    const items = watch("items") || [];
    const current = items[index] || {};

    setValue(`items.${index}.description`, item.description || "");
    setValue(`items.${index}.modelNo`, item.model || item.modelNo || "");
    setValue(`items.${index}.hsn`, item.hsn || "");

    const currentUnitPrice = Number(current.unitPrice) || 0;
    const currentGstPercent = Number(current.gstPercent) || 0;

    if (!currentUnitPrice) {
      setValue(
        `items.${index}.unitPrice`,
        item.price ?? item.unitPrice ?? 0
      );
    }
    if (!currentGstPercent) {
      setValue(
        `items.${index}.gstPercent`,
        item.gst ?? item.gstPercent ?? 0
      );
    }

    setItemSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  const [managerSuggestions, setManagerSuggestions] = useState([]);
  const [isManagerFocused, setIsManagerFocused] = useState(false);
  const managerWrapperRef = useRef(null);

  const handleManagerNameChange = async (value) => {
    setValue("SalesManagerName", value);

    if (!value || value.trim().length < 2) {
      setManagerSuggestions([]);
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_URL}/sales-managers?search=${encodeURIComponent(value)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      setManagerSuggestions(data || []);
    } catch (err) {
      console.error("Sales manager suggestion error:", err);
      setManagerSuggestions([]);
    }
  };

  const handleSelectManager = (m) => {
    setValue("SalesManagerName", m.name || "");
    setValue("managerAddress", m.address || "");
    setValue("managerContact", m.contact || "");
    setValue("managerEmail", m.email || "");
    setValue("managerGSTIN", m.gstin || "");
    setManagerSuggestions([]);
    setIsManagerFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (evt) => {
      if (
        managerWrapperRef.current &&
        !managerWrapperRef.current.contains(evt.target)
      ) {
        setIsManagerFocused(false);
        setManagerSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = watch("items") || [];

  const totals = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    let subTotal = 0;
    let totalGST = 0;

    list.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      const gst = Number(it.gstPercent) || 0;

      const base = qty * price;
      const gstAmt = (base * gst) / 100;

      subTotal += base;
      totalGST += gstAmt;
    });

    return {
      subTotal,
      totalGST,
      grandTotal: subTotal + totalGST,
    };
  }, [items]);

  useEffect(() => {
    if (!initialPurchaseOrder) return;
    reset(buildDefaults(initialPurchaseOrder));
  }, [initialPurchaseOrder, reset]);

  return {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    fields,
    append: () =>
      rhfAppend({
        description: "",
        modelNo: "",
        hsn: "",
        quantity: 1,
        unitPrice: 0,
        gstPercent: 0,
        hasFeature: false,
        feature: "",
      }),
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
    totals,
    isEdit,
  };
};
