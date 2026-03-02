import * as yup from "yup";

const luhnCheck = (value: string) => {
  const num = value.replace(/\s/g, "");
  let sum = 0;
  let shouldDouble = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const checkoutSchema = yup.object({
  cardNumber: yup
    .string()
    .required("Card number is required")
    .test("luhn", "Invalid card number", luhnCheck),

  expiry: yup
    .string()
    .required("Expiry is required")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format MM/YY")
    .test("future", "Card is expired", (value) => {
      if (!value) return false;
      const [month, year] = value.split("/").map(Number);
      const now = new Date();
      const expDate = new Date(2000 + year, month);
      return expDate > now;
    }),

  cvv: yup
    .string()
    .required("CVV is required")
    .matches(/^\d{3,4}$/, "Invalid CVV"),

  cardHolder: yup
    .string()
    .required("Card holder name is required")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Card holder name contains invalid characters"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  address: yup
    .string()
    .required("Address is required")
    .matches(/^[a-zA-ZÀ-ÿ0-9\s.,#'-]+$/, "Address contains invalid characters"),
  city: yup
    .string()
    .required("City is required")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, "City contains invalid characters"),
  country: yup
    .string()
    .required("Country is required")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Country contains invalid characters"),
});
