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
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format MM/YY"),

  cvv: yup
    .string()
    .required("CVV is required")
    .matches(/^\d{3,4}$/, "Invalid CVV"),

  cardHolder: yup.string().required("Card holder name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
});
