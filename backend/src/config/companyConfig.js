// backend/src/config/companyConfig.js

export const COMPANY_CONFIGS = {
  BRBIO: {
    code: "BRBIO",
    name: "BR Biomedical (P) Ltd.",
    address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
    contact: "18002124669",
    email: "sales@brbiomedical.com",
    gstin: "07AACCB9500D1Z4",
  },
  HANUMAN: {
    code: "HANUMAN",
    name: "Hanuman HealthCare",
    address: "",
    contact: "",
    email: "",
    gstin: "",
  },
  VEGO: {
    code: "VEGO",
    name: "Vego & Thomson Pvt Ltd",
    address: "",
    contact: "",
    email: "",
    gstin: "",
  },
};

export const getStaticCompanyConfig = (code) => {
  if (!code) return null;
  const key = code.toString().trim().toUpperCase();
  return COMPANY_CONFIGS[key] || null;
};
