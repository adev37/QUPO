// backend/src/controllers/purchaseOrderController.js
import PurchaseOrder from "../models/PurchaseOrder.js";
import SalesManager from "../models/SalesManager.js";
import { getNextNumber } from "../helpers/autoNumberHelper.js";
import { getOrCreateCompanyByCode } from "../helpers/companyHelper.js";

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const {
      companyCode,
      date,
      purchaseNumber, // optional, else auto
      orderAgainst,
      deliveryPeriod,
      placeInstallation,

      SalesManagerName,
      Address,
      Contact,
      Email,
      GSTIN,

      items,
      terms,
      deliverySchedule,
    } = req.body;

    // ---- COMPANY ----
    const company = await getOrCreateCompanyByCode(companyCode);
    if (!company) {
      res.status(400);
      throw new Error("Invalid companyCode");
    }

    // ---- SALES MANAGER ----
    let salesManager = null;
    if (Email) {
      salesManager =
        (await SalesManager.findOne({ email: Email })) ||
        (await SalesManager.create({
          name: SalesManagerName,
          address: Address,
          contact: Contact,
          email: Email,
          gstin: GSTIN,
        }));
    }

    // ---- ITEMS ----
    const safeItems = (items || []).filter(
      (i) => i.description && i.quantity && i.price
    );

    const mappedItems = safeItems.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const gst = Number(item.gst) || 0;
      const gstAmount = (quantity * price * gst) / 100;
      const totalAmount = quantity * price + gstAmount;
      return { ...item, quantity, price, gst, gstAmount, totalAmount };
    });

    const subTotal = mappedItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const totalGST = mappedItems.reduce(
      (acc, item) => acc + item.gstAmount,
      0
    );
    const grandTotal = subTotal + totalGST;

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

      salesManager: salesManager?._id,
      SalesManagerName,
      Address,
      Contact,
      Email,
      GSTIN,

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
      companyCode,
      date,
      purchaseNumber,
      orderAgainst,
      deliveryPeriod,
      placeInstallation,

      SalesManagerName,
      Address,
      Contact,
      Email,
      GSTIN,

      items,
      terms,
      deliverySchedule,
    } = req.body;

    // ---- COMPANY ----
    if (companyCode) {
      const company = await getOrCreateCompanyByCode(companyCode);
      if (!company) {
        res.status(400);
        throw new Error("Invalid companyCode");
      }
      po.company = company._id;
      po.companyCode = company.companyCode;
    }

    // ---- SALES MANAGER ----
    let salesManager = po.salesManager;
    if (Email) {
      const existing =
        (await SalesManager.findOne({ email: Email })) ||
        (await SalesManager.create({
          name: SalesManagerName,
          address: Address,
          contact: Contact,
          email: Email,
          gstin: GSTIN,
        }));
      salesManager = existing._id;
    }

    // ---- ITEMS ----
    const safeItems = (items || []).filter(
      (i) => i.description && i.quantity && i.price
    );

    const mappedItems = safeItems.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const gst = Number(item.gst) || 0;
      const gstAmount = (quantity * price * gst) / 100;
      const totalAmount = quantity * price + gstAmount;
      return { ...item, quantity, price, gst, gstAmount, totalAmount };
    });

    const subTotal = mappedItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const totalGST = mappedItems.reduce(
      (acc, item) => acc + item.gstAmount,
      0
    );
    const grandTotal = subTotal + totalGST;

    // ---- ASSIGN FIELDS ----
    po.date = date || po.date;
    po.purchaseNumber = purchaseNumber || po.purchaseNumber;
    po.orderAgainst = orderAgainst;
    po.deliveryPeriod = deliveryPeriod;
    po.placeInstallation = placeInstallation;

    po.salesManager = salesManager;
    po.SalesManagerName = SalesManagerName;
    po.Address = Address;
    po.Contact = Contact;
    po.Email = Email;
    po.GSTIN = GSTIN;

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
