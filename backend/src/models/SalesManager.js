// backend/src/models/SalesManager.js
import mongoose from "mongoose";

const salesManagerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String },
    contact: { type: String },
    email: { type: String, lowercase: true, index: true },
    gstin: { type: String },
  },
  { timestamps: true }
);

const SalesManager = mongoose.model("SalesManager", salesManagerSchema);

export default SalesManager;
