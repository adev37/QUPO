// backend/src/controllers/quotationController.js
import Quotation from "../models/Quotation.js";
import Client from "../models/Client.js";
import { getNextNumber } from "../helpers/autoNumberHelper.js";
import { getOrCreateCompanyByCode } from "../helpers/companyHelper.js";

export const createQuotation = async (req, res, next) => {
  try {
    const {
      companyCode,
      date,
      validUntil,
      subject,
      clientName,
      clientAddress,
      clientContact,
      clientEmail,
      clientGSTIN,
      items,
      terms,
      totals, // coming from frontend (optional)
    } = req.body;

    // ---- COMPANY ----
    const company = await getOrCreateCompanyByCode(companyCode);
    if (!company) {
      res.status(400);
      throw new Error("Invalid companyCode");
    }

    // ---- CLIENT (attach or create) ----
    let client = null;
    if (clientEmail) {
      client =
        (await Client.findOne({ email: clientEmail })) ||
        (await Client.create({
          name: clientName,
          address: clientAddress,
          contact: clientContact,
          email: clientEmail,
          gstin: clientGSTIN,
        }));
    }

    // ---- ITEMS ----
    const safeItems = (items || []).filter((i) => {
      const qty = Number(i.quantity) || 0;
      const price = Number(i.unitPrice ?? i.price ?? 0);
      return i.description && qty > 0 && price > 0;
    });

    const mappedItems = safeItems.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unitPrice ?? item.price ?? 0);
      const gst = Number(item.gstPercent ?? item.gst ?? 0);

      const gstAmount = (quantity * price * gst) / 100;
      const totalAmount = quantity * price + gstAmount;

      return {
        description: item.description || "",
        model: item.modelNo || item.model || "",
        hsn: item.hsn || "",
        quantity,
        unit: item.unit || "PCS",
        price,
        gst,
        gstAmount,
        totalAmount,
        hasFeature: !!item.hasFeature,
        feature: item.feature || "",
      };
    });

    // ---- TOTALS ----
    let subTotal, totalGST, grandTotal;

    if (totals) {
      subTotal = Number(totals.subTotal) || 0;
      totalGST = Number(totals.totalGST) || 0;
      grandTotal = Number(totals.grandTotal) || subTotal + totalGST;
    } else {
      subTotal = mappedItems.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      );
      totalGST = mappedItems.reduce(
        (acc, item) => acc + item.gstAmount,
        0
      );
      grandTotal = subTotal + totalGST;
    }

    const quotationNumber = await getNextNumber("quotation");

    const quotation = await Quotation.create({
      company: company._id,
      companyCode: company.companyCode, // normalized code
      quotationNumber,
      date,
      validUntil,
      subject,

      client: client?._id,
      clientName,
      clientAddress,
      clientContact,
      clientEmail,
      clientGSTIN,

      items: mappedItems,
      terms,
      subTotal,
      totalGST,
      grandTotal,
      createdBy: req.user?._id,
      totals: {
        subTotal,
        totalGST,
        grandTotal,
      },
    });

    res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

export const updateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      res.status(404);
      throw new Error("Quotation not found");
    }

    const {
      companyCode,
      date,
      validUntil,
      subject,
      clientName,
      clientAddress,
      clientContact,
      clientEmail,
      clientGSTIN,
      items,
      terms,
      totals,
    } = req.body;

    // ---- COMPANY ----
    if (companyCode) {
      const company = await getOrCreateCompanyByCode(companyCode);
      if (!company) {
        res.status(400);
        throw new Error("Invalid companyCode");
      }
      quotation.company = company._id;
      quotation.companyCode = company.companyCode;
    }

    // ---- CLIENT ----
    if (clientEmail) {
      const existing =
        (await Client.findOne({ email: clientEmail })) ||
        (await Client.create({
          name: clientName,
          address: clientAddress,
          contact: clientContact,
          email: clientEmail,
          gstin: clientGSTIN,
        }));
      quotation.client = existing._id;
    }

    // ---- ITEMS ----
    const safeItems = (items || []).filter((i) => {
      const qty = Number(i.quantity) || 0;
      const price = Number(i.unitPrice ?? i.price ?? 0);
      return i.description && qty > 0 && price > 0;
    });

    const mappedItems = safeItems.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unitPrice ?? item.price ?? 0);
      const gst = Number(item.gstPercent ?? item.gst ?? 0);

      const gstAmount = (quantity * price * gst) / 100;
      const totalAmount = quantity * price + gstAmount;

      return {
        description: item.description || "",
        model: item.modelNo || item.model || "",
        hsn: item.hsn || "",
        quantity,
        unit: item.unit || "PCS",
        price,
        gst,
        gstAmount,
        totalAmount,
        hasFeature: !!item.hasFeature,
        feature: item.feature || "",
      };
    });

    let subTotal, totalGST, grandTotal;

    if (totals) {
      subTotal = Number(totals.subTotal) || 0;
      totalGST = Number(totals.totalGST) || 0;
      grandTotal = Number(totals.grandTotal) || subTotal + totalGST;
    } else {
      subTotal = mappedItems.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      );
      totalGST = mappedItems.reduce(
        (acc, item) => acc + item.gstAmount,
        0
      );
      grandTotal = subTotal + totalGST;
    }

    quotation.date = date ?? quotation.date;
    quotation.validUntil = validUntil ?? quotation.validUntil;
    quotation.subject = subject ?? quotation.subject;

    quotation.clientName = clientName ?? quotation.clientName;
    quotation.clientAddress = clientAddress ?? quotation.clientAddress;
    quotation.clientContact = clientContact ?? quotation.clientContact;
    quotation.clientEmail = clientEmail ?? quotation.clientEmail;
    quotation.clientGSTIN = clientGSTIN ?? quotation.clientGSTIN;

    quotation.items = mappedItems;
    quotation.terms = terms ?? quotation.terms;
    quotation.subTotal = subTotal;
    quotation.totalGST = totalGST;
    quotation.grandTotal = grandTotal;
    quotation.totals = {
      subTotal,
      totalGST,
      grandTotal,
    };

    const updated = await quotation.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getQuotations = async (req, res, next) => {
  try {
    const { search, companyCode } = req.query;

    const query = {};

    if (companyCode) {
      query.companyCode = companyCode;
    }

    if (search) {
      query.$or = [
        { quotationNumber: Number(search) || 0 },
        { clientName: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const quotations = await Quotation.find(query)
      .populate("company", "name companyCode")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate(
      "company client createdBy",
      "name email companyCode"
    );
    if (!quotation) {
      res.status(404);
      throw new Error("Quotation not found");
    }
    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const deleteQuotation = async (req, res, next) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Quotation not found");
    }
    res.json({ message: "Quotation deleted" });
  } catch (error) {
    next(error);
  }
};
