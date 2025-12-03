// frontend/src/utils/numberToIndianWords.js

export function numberToIndianWords(amount) {
  if (amount === null || amount === undefined) {
    return "Zero Rupees Only";
  }

  let num = Math.round(Number(amount));
  if (!Number.isFinite(num) || num === 0) {
    return "Zero Rupees Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  // convert up to 3-digit number to words
  const threeDigitToWords = (n) => {
    let str = "";

    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n = n % 100;
    }

    if (n > 19) {
      str += tens[Math.floor(n / 10)];
      if (n % 10) str += " " + ones[n % 10];
    } else if (n > 0) {
      str += ones[n];
    }

    return str.trim();
  };

  let result = "";

  const crore = Math.floor(num / 10000000);
  num = num % 10000000;

  const lakh = Math.floor(num / 100000);
  num = num % 100000;

  const thousand = Math.floor(num / 1000);
  num = num % 1000;

  const hundred = num;

  if (crore) result += threeDigitToWords(crore) + " Crore ";
  if (lakh) result += threeDigitToWords(lakh) + " Lakh ";
  if (thousand) result += threeDigitToWords(thousand) + " Thousand ";
  if (hundred) result += threeDigitToWords(hundred);

  return result.trim() + " Rupees Only";
}
