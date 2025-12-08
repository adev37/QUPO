// backend/src/helpers/companyHelper.js
import Company from "../models/Company.js";

/**
 * Normalizes a company code, e.g. "brbio" -> "BRBIO"
 */
const normalizeCode = (code) =>
  (code || "").toString().trim().toUpperCase();

/**
 * Get an existing Company by code or create a minimal one.
 *
 * `extra` can contain: { name, address, contact, email, gstin }
 */
export const getOrCreateCompanyByCode = async (rawCode, extra = {}) => {
  const companyCode = normalizeCode(rawCode);

  if (!companyCode) {
    return null;
  }

  // ✅ make sure Company is imported (this was causing "Company is not defined")
  let company = await Company.findOne({ companyCode });

  if (!company) {
    company = await Company.create({
      companyCode,
      name: extra.name || companyCode,
      address: extra.address || "",
      contact: extra.contact || "",
      email: extra.email || "",
      gstin: extra.gstin || "",
    });
  }

  return company;
};
