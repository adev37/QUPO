// frontend/src/config/companyConfig.js

// Import your branding assets
import brHeader from "../assets/images/br.jpg";       // full-width letterhead image
import brStamp from "../assets/images/br_stamp.png";      // stamp / signature image

// 🔥 Common details for ALL companies
const COMMON_DETAILS = {
  headerImage: brHeader,
  stampImage: brStamp,

  address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
  contact: "18002124669",
  email: "sales@brbiomedical.com",
  gstin: "07AACCB9500D1Z4",
};

// Company definitions (all share the common details)
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

// Getter function used across frontend
export const getCompanyConfig = (code) => {
  if (!code) return COMPANY_CONFIGS.BRBIO;
  const key = code.toString().trim().toUpperCase();
  return COMPANY_CONFIGS[key] || COMPANY_CONFIGS.BRBIO;
};
