// backend/src/models/Company.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyCode: { type: String, required: true, unique: true, uppercase: true },
    address: { type: String },
    contact: { type: String },
    email: { type: String },
    gstin: { type: String },

    // optional: used by frontend for printing / letterhead config
    logoUrl: { type: String },
    headerHtml: { type: String },
    footerHtml: { type: String },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
