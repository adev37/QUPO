// helpers/companyHelper.js
export const getOrCreateCompanyByCode = async (companyCode) => {
  const code = (companyCode || "").toString().trim().toUpperCase();
  if (!code) return null;

  let company = await Company.findOne({ companyCode: code });
  if (company) return company;

  const cfg = getStaticCompanyConfig(code);
  if (!cfg) return null;

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
