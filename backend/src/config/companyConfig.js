// backend/src/config/companyConfig.js

// SAME DETAILS FOR ALL COMPANIES (as requested)

const COMMON_DETAILS = {
  address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
  contact: "18002124669",
  email: "sales@brbiomedical.com",
  gstin: "07AACCB9500D1Z4",
};

export const COMPANY_CONFIGS = {
  BRBIO: {
    code: "BRBIO",
    name: "BR Biomedical (P) Ltd.",
    ...COMMON_DETAILS,
  },

  HANUMAN: {
    code: "HANUMAN",
    name: "Hanuman HealthCare",
    ...COMMON_DETAILS,
  },

  VEGO: {
    code: "VEGO",
    name: "Vego & Thomson Pvt Ltd",
    ...COMMON_DETAILS,
  },
};

// Helper function – used by backend controllers
export const getStaticCompanyConfig = (code) => {
  if (!code) return null;
  const key = code.toString().trim().toUpperCase();
  return COMPANY_CONFIGS[key] || null;
};
