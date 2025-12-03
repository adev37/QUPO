export const numberToIndianWords = (num) => {
  if (!Number.isFinite(num)) return "Invalid Amount";
  num = Math.round(num);

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
  ];
  const teens = [
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
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const places = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero Rupees Only";

  const getWords = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n === 10) return "Ten";
    if (n < 20) return teens[n - 11];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred " +
        (n % 100 !== 0 ? getWords(n % 100) : "")
      );
    return "";
  };

  let parts = [],
    placeIndex = 0,
    isThousandHandled = false;

  while (num > 0) {
    const divisor = placeIndex === 1 ? 100 : 1000;
    const part = num % divisor;
    if (part) {
      if (placeIndex === 1 && !isThousandHandled) {
        parts.push(getWords(part) + " " + places[placeIndex]);
        isThousandHandled = true;
      } else {
        parts.push(
          getWords(part) + (places[placeIndex] ? " " + places[placeIndex] : "")
        );
      }
    }
    num = Math.floor(num / divisor);
    placeIndex++;
  }
  return parts.reverse().join(" ") + " Rupees Only";
};
