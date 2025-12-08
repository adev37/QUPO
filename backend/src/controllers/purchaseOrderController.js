// backend/src/controllers/purchaseOrderController.js
import PurchaseOrder from "../models/PurchaseOrder.js";
import SalesManager from "../models/SalesManager.js";
import { getNextNumber } from "../helpers/autoNumberHelper.js";
import { getOrCreateCompanyByCode } from "../helpers/companyHelper.js";
import {
  calcLineAmounts,
  calcTotalsFromItems,
  parseNumber,
} from "../helpers/amountHelper.js";

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const {
      // Company from frontend
      companyCode,
      companyName,
      companyAddress,
      companyContact,
      companyEmail,
      companyGSTIN,

      // PO details
      date,
      purchaseNumber, // optional, else auto
      orderAgainst,
      deliveryPeriod,
      placeInstallation,

      // Supplier / Sales Manager from frontend
      SalesManagerName,
      managerAddress,
      managerContact,
      managerEmail,
      managerGSTIN,

      items,
      terms,
      deliverySchedule,
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

    // ---- SALES MANAGER ----
    let salesManager = null;
    if (managerEmail) {
      salesManager =
        (await SalesManager.findOne({ email: managerEmail })) ||
        (await SalesManager.create({
          name: SalesManagerName,
          address: managerAddress,
          contact: managerContact,
          email: managerEmail,
          gstin: managerGSTIN,
        }));
    }

    // ---- ITEMS ----
    const safeItems = (items || []).filter((i) => {
      const qty = parseNumber(i.quantity);
      const price = parseNumber(i.unitPrice ?? i.price ?? 0);
      return i.description && qty > 0 && price > 0;
    });

    const mappedItems = safeItems.map((item) => {
      const { quantity, price, gst, gstAmount, totalAmount } = calcLineAmounts(
        item.quantity,
        item.unitPrice ?? item.price,
        item.gstPercent ?? item.gst
      );

      return {
        ...item,
        quantity,
        price,
        gst,
        gstAmount,
        totalAmount,
      };
    });

    const { subTotal, totalGST, grandTotal } =
      calcTotalsFromItems(mappedItems);

    const poNumber =
      purchaseNumber || (await getNextNumber("purchaseOrder"));

    const po = await PurchaseOrder.create({
      company: company._id,
      companyCode: company.companyCode,
      purchaseNumber: poNumber,
      date,
      orderAgainst,
      deliveryPeriod,
      placeInstallation,

      // store denormalised supplier info
      salesManager: salesManager?._id || undefined,
      SalesManagerName,
      Address: managerAddress,
      Contact: managerContact,
      Email: managerEmail,
      GSTIN: managerGSTIN,

      items: mappedItems,
      terms,
      subTotal,
      totalGST,
      grandTotal,
      deliverySchedule: deliverySchedule || [],
      createdBy: req.user?._id,
    });

    res.status(201).json(po);
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      res.status(404);
      throw new Error("Purchase order not found");
    }

    const {
      // Company
      companyCode,
      companyName,
      companyAddress,
      companyContact,
      companyEmail,
      companyGSTIN,

      // PO details
      date,
      purchaseNumber,
      orderAgainst,
      deliveryPeriod,
      placeInstallation,

      // Supplier / Sales Manager
      SalesManagerName,
      managerAddress,
      managerContact,
      managerEmail,
      managerGSTIN,

      items,
      terms,
      deliverySchedule,
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

      po.company = company._id;
      po.companyCode = company.companyCode;
    }

    // ---- SALES MANAGER ----
    let salesManager = po.salesManager;
    if (managerEmail) {
      const existing =
        (await SalesManager.findOne({ email: managerEmail })) ||
        (await SalesManager.create({
          name: SalesManagerName,
          address: managerAddress,
          contact: managerContact,
          email: managerEmail,
          gstin: managerGSTIN,
        }));
      salesManager = existing._id;
    }

    // ---- ITEMS ----
    const safeItems = (items || []).filter((i) => {
      const qty = parseNumber(i.quantity);
      const price = parseNumber(i.unitPrice ?? i.price ?? 0);
      return i.description && qty > 0 && price > 0;
    });

    const mappedItems = safeItems.map((item) => {
      const { quantity, price, gst, gstAmount, totalAmount } = calcLineAmounts(
        item.quantity,
        item.unitPrice ?? item.price,
        item.gstPercent ?? item.gst
      );

      return {
        ...item,
        quantity,
        price,
        gst,
        gstAmount,
        totalAmount,
      };
    });

    const { subTotal, totalGST, grandTotal } =
      calcTotalsFromItems(mappedItems);

    // ---- ASSIGN FIELDS ----
    po.date = date || po.date;
    po.purchaseNumber = purchaseNumber || po.purchaseNumber;
    po.orderAgainst = orderAgainst;
    po.deliveryPeriod = deliveryPeriod;
    po.placeInstallation = placeInstallation;

    po.salesManager = salesManager;
    po.SalesManagerName = SalesManagerName;
    po.Address = managerAddress;
    po.Contact = managerContact;
    po.Email = managerEmail;
    po.GSTIN = managerGSTIN;

    po.items = mappedItems;
    po.terms = terms;
    po.subTotal = subTotal;
    po.totalGST = totalGST;
    po.grandTotal = grandTotal;
    po.deliverySchedule = deliverySchedule || [];

    const updated = await po.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const { search, companyCode } = req.query;
    const query = {};

    if (companyCode) query.companyCode = companyCode;

    if (search) {
      query.$or = [
        { purchaseNumber: Number(search) || 0 },
        { SalesManagerName: { $regex: search, $options: "i" } },
        { orderAgainst: { $regex: search, $options: "i" } },
      ];
    }

    const pos = await PurchaseOrder.find(query)
      .populate("company", "name companyCode")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(pos);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id).populate(
      "company salesManager createdBy",
      "name email companyCode"
    );
    if (!po) {
      res.status(404);
      throw new Error("Purchase order not found");
    }
    res.json(po);
  } catch (error) {
    next(error);
  }
};

export const deletePurchaseOrder = async (req, res, next) => {
  try {
    const deleted = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Purchase order not found");
    }
    res.json({ message: "Purchase order deleted" });
  } catch (error) {
    next(error);
  }
};
