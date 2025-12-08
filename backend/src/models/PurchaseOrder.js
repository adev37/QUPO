// backend/src/models/PurchaseOrder.js
import mongoose from "mongoose";
import { lineItemSchema } from "./commonItemFields.js";

const deliveryRowSchema = new mongoose.Schema(
  {
    date: { type: String },
    transport: { type: String },
    vehicleDetails: { type: String },
    driverDetails: { type: String },
    remarks: { type: String },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    companyCode: { type: String, required: true },

    purchaseNumber: { type: Number, required: true, index: true },
    date: { type: Date, required: true },

    orderAgainst: { type: String, required: true },
    deliveryPeriod: { type: String },
    placeInstallation: { type: String },

    salesManager: { type: mongoose.Schema.Types.ObjectId, ref: "SalesManager" },
    SalesManagerName: { type: String, required: true },
    Address: { type: String },
    Contact: { type: String },
    Email: { type: String },
    GSTIN: { type: String },

    items: [lineItemSchema],

    terms: { type: String },

    subTotal: { type: Number, default: 0 },
    totalGST: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    deliverySchedule: [deliveryRowSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
