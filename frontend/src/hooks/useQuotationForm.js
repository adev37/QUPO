import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

const API_URL =
  import.meta.env.VITE_API_URL || "https://qupo-api.vercel.app/api";

const norm = (v) => (v || "").toString().trim();

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

export const useQuotationForm = (
  initialQuotation,
  defaultCompanyCode = ""
) => {
  const isEdit = !!initialQuotation?._id;

  const buildDefaults = (source) => {
    const q = source || {};
    return {
      companyCode: q.companyCode || defaultCompanyCode || "BRBIO",
      companyName: q.companyName || q.company?.name || "",
      date: q.date
        ? q.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      validUntil: q.validUntil ? q.validUntil.slice(0, 10) : "",
      quotationNumber: q.quotationNumber || "",
      clientName: q.clientName || "",
      clientEmail: q.clientEmail || "",
      clientContact: q.clientContact || "",
      clientGSTIN: q.clientGSTIN || "",
      clientAddress: q.clientAddress || "",
      subject: q.subject || "",
      items:
        q.items?.length > 0
          ? q.items.map((it) => ({
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
      terms: q.terms || "",
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
    defaultValues: buildDefaults(initialQuotation),
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
      console.error("Item suggestion error:", err);
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

  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [isClientNameFocused, setIsClientNameFocused] = useState(false);
  const clientNameWrapperRef = useRef(null);
  const isSelectingClientRef = useRef(false);

  const handleClientNameChange = async (value) => {
    setValue("clientName", value);

    if (isSelectingClientRef.current) {
      isSelectingClientRef.current = false;
      return;
    }

    if (!value || value.trim().length < 2) {
      setClientSuggestions([]);
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_URL}/clients?search=${encodeURIComponent(value)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      setClientSuggestions(data || []);
    } catch (err) {
      console.error("Client suggestion error:", err);
      setClientSuggestions([]);
    }
  };

  const handleSelectClient = (client) => {
    isSelectingClientRef.current = true;
    setValue("clientName", client.name || "");
    setValue("clientEmail", client.email || "");
    setValue("clientContact", client.contact || "");
    setValue("clientGSTIN", client.gstin || "");
    setValue("clientAddress", client.address || "");
    setClientSuggestions([]);
    setIsClientNameFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (evt) => {
      if (
        clientNameWrapperRef.current &&
        !clientNameWrapperRef.current.contains(evt.target)
      ) {
        setIsClientNameFocused(false);
        setClientSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const termsList = [
    "PRICES: The prices are expressed on F.O.R. basis in INR.",
    "GST & OTHER TAXES: GST as applicable shall be charged extra.",
    "PAYMENT: As per your terms & conditions.",
    "DELIVERY PERIOD: As per mutual agreement / tender terms.",
    "WARRANTY: Comprehensive warranty as per tender terms.",
    "INSTALLATION / TRAINING: Shall be provided at user site FOC.",
    "VALIDITY OF OFFER: 90 days from the date of quotation.",
  ];

  const [checkedTerms, setCheckedTerms] = useState(() => {
    const existing = initialQuotation?.terms || "";
    if (!existing) return [];
    return termsList.filter((t) => existing.includes(t));
  });

  useEffect(() => {
    if (!initialQuotation?.terms) return;
    const existing = initialQuotation.terms || "";
    const selected = termsList.filter((t) => existing.includes(t));
    setCheckedTerms(selected);
  }, [initialQuotation]);

  const handleTermCheckboxChange = (isChecked, termText) => {
    const current = norm(watch("terms"));
    let updated = current;

    if (isChecked) {
      if (!current.includes(termText)) {
        updated = (current ? current + "\n" : "") + `• ${termText}`;
      }
      setCheckedTerms((prev) => [...prev, termText]);
    } else {
      const reg = new RegExp(`•\\s*${termText}\\s*\\n?`, "g");
      updated = current.replace(reg, "").trim();
      setCheckedTerms((prev) => prev.filter((t) => t !== termText));
    }

    setValue("terms", updated);
  };

  const items = watch("items");

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
    if (!initialQuotation) return;
    reset(buildDefaults(initialQuotation));
  }, [initialQuotation, reset, defaultCompanyCode]);

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
    clientSuggestions,
    isClientNameFocused,
    setIsClientNameFocused,
    clientNameWrapperRef,
    handleClientNameChange,
    handleSelectClient,
    termsList,
    checkedTerms,
    handleTermCheckboxChange,
    totals,
    isEdit,
  };
};
