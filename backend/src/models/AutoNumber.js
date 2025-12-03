// backend/src/models/AutoNumber.js
import mongoose from "mongoose";

const autoNumberSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true }, // 'quotation', 'purchaseOrder', etc.
    prefix: { type: String, default: "" },
    lastNumber: { type: Number, default: 0 },
    padLength: { type: Number, default: 0 }, // if you want zero-padding later
  },
  { timestamps: true }
);

const AutoNumber = mongoose.model("AutoNumber", autoNumberSchema);

export default AutoNumber;
