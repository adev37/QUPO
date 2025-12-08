// backend/src/helpers/amountHelper.js

// Round to 2 decimal places safely
export const round2 = (n) =>
  Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;

// Parse normal numbers and "12,500" style strings
export const parseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const str = value.toString().replace(/,/g, "").trim();
  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
};

// Parse "18", "18.0", "18%", "18.00%" into 18
export const parsePercent = (value) => {
  if (value === null || value === undefined) return 0;
  const str = value.toString().replace(/,/g, "").replace("%", "").trim();
  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
};

/**
 * Calculate amounts for a single line item.
 * quantity × price = baseAmount
 * GST% on baseAmount
 */
export const calcLineAmounts = (quantity, price, gstPercent) => {
  const qty = parseNumber(quantity);
  const rate = parseNumber(price);
  const gst = parsePercent(gstPercent);

  const baseAmount = qty * rate;
  const gstAmount = round2((baseAmount * gst) / 100);
  const totalAmount = round2(baseAmount + gstAmount);

  return {
    quantity: qty,
    price: rate,
    gst,
    gstAmount,
    totalAmount,
    baseAmount: round2(baseAmount),
  };
};

/**
 * Calculate totals from mapped items
 */
export const calcTotalsFromItems = (items = []) => {
  const subTotal = round2(
    items.reduce((acc, item) => acc + item.quantity * item.price, 0)
  );
  const totalGST = round2(
    items.reduce((acc, item) => acc + item.gstAmount, 0)
  );
  const grandTotal = round2(subTotal + totalGST);

  return { subTotal, totalGST, grandTotal };
};
