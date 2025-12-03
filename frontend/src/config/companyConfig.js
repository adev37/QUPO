// frontend/src/config/companyConfig.js

// If you keep letterhead + stamp images inside src/assets or src/images,
// adjust these imports accordingly:
import brHeader from "../assets/images/br.jpg";       // full-width letterhead image
import brStamp from "../assets/images/br_stamp.png"; // stamp / signature image

// Base config map
export const COMPANY_CONFIGS = {
  BRBIO: {
    code: "BRBIO",
    name: "BR Biomedical (P) Ltd.",
    headerImage: brHeader, // shown at the very top of print
    stampImage: brStamp,   // shown near "Authorised Signatory"

    // Optional: default "Bill To" details for this company
    address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
    contact: "18002124669",
    email: "sales@brbiomedical.com",
    gstin: "07AACCB9500D1Z4",
  },

  HANUMAN: {
    code: "HANUMAN",
    name: "Hanuman HealthCare",
    headerImage: brHeader, // placeholder – replace with real header if you have it
    stampImage: brStamp,   // placeholder
    address: "",
    contact: "",
    email: "",
    gstin: "",
  },

  VEGO: {
    code: "VEGO",
    name: "Vego & Thomson Pvt Ltd",
    headerImage: brHeader, // placeholder – replace with real header if you have it
    stampImage: brStamp,   // placeholder
    address: "",
    contact: "",
    email: "",
    gstin: "",
  },
};

export const getCompanyConfig = (code) => {
  if (!code) return COMPANY_CONFIGS.BRBIO;
  const key = code.toString().trim().toUpperCase();
  return COMPANY_CONFIGS[key] || COMPANY_CONFIGS.BRBIO;
};
