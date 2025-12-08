// backend/src/models/commonItemFields.js
import mongoose from "mongoose";

export const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    model: { type: String },
    hsn: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "PCS" },
    price: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    hasFeature: { type: Boolean, default: false },
    feature: { type: String }, // long text from your form
  },
  { _id: false }
);
