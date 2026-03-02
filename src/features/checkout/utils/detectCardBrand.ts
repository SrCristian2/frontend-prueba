export type CardBrand = "visa" | "mastercard" | null;

export const detectCardBrand = (number: string): CardBrand => {
  const cleaned = number.replace(/\s+/g, "");

  if (/^4/.test(cleaned)) {
    return "visa";
  }

  if (
    /^(5[1-5])/.test(cleaned) ||
    /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(cleaned)
  ) {
    return "mastercard";
  }

  return null;
};
