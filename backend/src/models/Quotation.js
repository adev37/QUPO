// backend/src/models/Quotation.js
import mongoose from "mongoose";
import { lineItemSchema } from "./commonItemFields.js";

const quotationSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    companyCode: { type: String, required: true },

    quotationNumber: { type: Number, required: true, index: true },
    date: { type: Date, required: true },
    validUntil: { type: Date },

    subject: { type: String, required: true },

    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    clientName: { type: String, required: true },
    clientAddress: { type: String },
    clientContact: { type: String },
    clientEmail: { type: String },
    clientGSTIN: { type: String },

    items: [lineItemSchema],

    terms: { type: String },

    subTotal: { type: Number, default: 0 },
    totalGST: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;
