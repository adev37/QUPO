// backend/src/helpers/companyHelper.js
import Company from "../models/Company.js";
import { getStaticCompanyConfig } from "../config/companyConfig.js";

export const getOrCreateCompanyByCode = async (companyCode) => {
  const code = (companyCode || "").toString().trim().toUpperCase();
  if (!code) return null;

  // 1) Try existing record
  let company = await Company.findOne({ companyCode: code });
  if (company) return company;

  // 2) Fallback to static config
  const cfg = getStaticCompanyConfig(code);
  if (!cfg) return null; // truly invalid code

  // 3) Create persistent company row from static config
  company = await Company.create({
    companyCode: cfg.code,
    name: cfg.name,
    address: cfg.address || "",
    contact: cfg.contact || "",
    email: cfg.email || "",
    gstin: cfg.gstin || "",
  });

  return company;
};
