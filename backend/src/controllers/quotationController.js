// backend/src/controllers/quotationController.js
import Quotation from "../models/Quotation.js";
import Client from "../models/Client.js";
import { getNextNumber } from "../helpers/autoNumberHelper.js";
import { getOrCreateCompanyByCode } from "../helpers/companyHelper.js";
import {
  calcLineAmounts,
  calcTotalsFromItems,
  round2,
  parseNumber,
} from "../helpers/amountHelper.js";

/**
 * Helper: normalize and compute line items for a quotation
 */
const mapQuotationItems = (items = []) => {
  const safeItems = items.filter((i) => {
    const qty = parseNumber(i.quantity);
    const price = parseNumber(i.unitPrice ?? i.price ?? 0);
    return i.description && qty > 0 && price > 0;
  });

  return safeItems.map((item) => {
    const { quantity, price, gst, gstAmount, totalAmount } = calcLineAmounts(
      item.quantity,
      item.unitPrice ?? item.price,
      item.gstPercent ?? item.gst
    );

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
};

/**
 * Helper: compute totals
 */
const computeTotals = (mappedItems, overrideTotals) => {
  if (overrideTotals) {
    const subTotal = round2(parseNumber(overrideTotals.subTotal));
    const totalGST = round2(parseNumber(overrideTotals.totalGST));
    const grandTotal = round2(
      overrideTotals.grandTotal
        ? parseNumber(overrideTotals.grandTotal)
        : subTotal + totalGST
    );

    return { subTotal, totalGST, grandTotal };
  }

  return calcTotalsFromItems(mappedItems);
};

/**
 * POST /api/quotations
 */
export const createQuotation = async (req, res, next) => {
  try {
    const {
      companyCode,
      companyName,
      companyAddress,
      companyContact,
      companyEmail,
      companyGSTIN,

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
      totals, // optional override from frontend
    } = req.body;

    // ---- COMPANY ----
    const company = await getOrCreateCompanyByCode(companyCode, {
      name: companyName,
      address: companyAddress,
      contact: companyContact,
      email: companyEmail,
      gstin: companyGSTIN,
    });

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
    const mappedItems = mapQuotationItems(items);

    // ---- TOTALS ----
    const { subTotal, totalGST, grandTotal } = computeTotals(
      mappedItems,
      totals
    );

    const quotationNumber = await getNextNumber("quotation");

    const quotation = await Quotation.create({
      company: company._id,
      companyCode: company.companyCode, // normalized
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

/**
 * PUT /api/quotations/:id
 */
export const updateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      res.status(404);
      throw new Error("Quotation not found");
    }

    const {
      companyCode,
      companyName,
      companyAddress,
      companyContact,
      companyEmail,
      companyGSTIN,

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
      const company = await getOrCreateCompanyByCode(companyCode, {
        name: companyName,
        address: companyAddress,
        contact: companyContact,
        email: companyEmail,
        gstin: companyGSTIN,
      });

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
    const mappedItems = mapQuotationItems(items);
    const { subTotal, totalGST, grandTotal } = computeTotals(
      mappedItems,
      totals
    );

    // ---- ASSIGN FIELDS ----
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

/**
 * GET /api/quotations
 */
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

/**
 * GET /api/quotations/:id
 */
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

/**
 * DELETE /api/quotations/:id
 */
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
