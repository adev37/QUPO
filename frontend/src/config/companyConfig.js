// frontend/src/config/companyConfig.js

// ==== IMPORT ALL COMPANY ASSETS ====

// BR Biomedical
import brHeader from "../assets/images/logo_br.jpg";
import brStamp from "../assets/images/br_stamp.png";

// Hanuman Healthcare
import hanumanHeader from "../assets/images/logo_hanuman.jpg";
import hanumanStamp from "../assets/images/hanuman_stamp.png";

// Vego & Thomson
import vegoHeader from "../assets/images/logo_vego.png";
import vegoStamp from "../assets/images/vego.jpg"; // or vego_stamp if you add one


// ==== COMPANY CONFIG ====
export const COMPANY_CONFIGS = {
  BRBIO: {
    code: "BRBIO",
    name: "BR Biomedical (P) Ltd.",
    headerImage: brHeader,
    stampImage: brStamp,
    address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
    contact: "18002124669",
    email: "sales@brbiomedical.com",
    gstin: "07AACCB9500D1Z4",
  },

  HANUMAN: {
    code: "HANUMAN",
    name: "Hanuman HealthCare",
    headerImage: hanumanHeader,
    stampImage: hanumanStamp,
    address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
    contact: "18002124669",
    email: "sales@brbiomedical.com",
    gstin: "07AACCB9500D1Z4",
  },

  VEGO: {
    code: "VEGO",
    name: "Vego & Thomson Pvt Ltd",
    headerImage: vegoHeader,
    stampImage: vegoStamp,
    address: "D-71, MALVIYA NAGAR, NEW DELHI, South Delhi, Delhi, 110017",
    contact: "18002124669",
    email: "sales@brbiomedical.com",
    gstin: "07AACCB9500D1Z4",
  },
};

// ==== GETTER ====
export const getCompanyConfig = (code) => {
  if (!code) return COMPANY_CONFIGS.BRBIO;
  const key = code.toString().trim().toUpperCase();
  return COMPANY_CONFIGS[key] || COMPANY_CONFIGS.BRBIO;
};
