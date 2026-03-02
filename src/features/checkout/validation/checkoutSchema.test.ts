import { checkoutSchema } from "./checkoutSchema";

describe("checkoutSchema", () => {
  const validData = {
    cardNumber: "4111 1111 1111 1111",
    expiry: "12/30",
    cvv: "123",
    cardHolder: "John Doe",
    email: "john@example.com",
    address: "123 Main St",
    city: "Bogota",
    country: "Colombia",
  };

  it("validates correct data successfully", async () => {
    await expect(checkoutSchema.validate(validData)).resolves.toBeTruthy();
  });

  describe("cardNumber validation", () => {
    it("rejects empty card number", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cardNumber: "" }),
      ).rejects.toThrow("Card number is required");
    });

    it("rejects invalid Luhn number", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cardNumber: "1234567890123456" }),
      ).rejects.toThrow("Invalid card number");
    });

    it("accepts valid Luhn number", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cardNumber: "4532015112830366" }),
      ).resolves.toBeTruthy();
    });
  });

  describe("expiry validation", () => {
    it("rejects empty expiry", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, expiry: "" }),
      ).rejects.toThrow("Expiry is required");
    });

    it("rejects invalid format", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, expiry: "1234" }),
      ).rejects.toThrow("Invalid format MM/YY");
    });

    it("rejects invalid month 13", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, expiry: "13/30" }),
      ).rejects.toThrow("Invalid format MM/YY");
    });

    it("rejects invalid month 00", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, expiry: "00/30" }),
      ).rejects.toThrow("Invalid format MM/YY");
    });

    it("rejects expired card", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, expiry: "01/20" }),
      ).rejects.toThrow("Card is expired");
    });

    it("accepts future date", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, expiry: "12/30" }),
      ).resolves.toBeTruthy();
    });
  });

  describe("cvv validation", () => {
    it("rejects empty cvv", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cvv: "" }),
      ).rejects.toThrow("CVV is required");
    });

    it("rejects cvv with less than 3 digits", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cvv: "12" }),
      ).rejects.toThrow("Invalid CVV");
    });

    it("rejects cvv with more than 4 digits", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cvv: "12345" }),
      ).rejects.toThrow("Invalid CVV");
    });

    it("rejects cvv with letters", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cvv: "abc" }),
      ).rejects.toThrow("Invalid CVV");
    });

    it("accepts 3-digit cvv", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cvv: "123" }),
      ).resolves.toBeTruthy();
    });

    it("accepts 4-digit cvv", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cvv: "1234" }),
      ).resolves.toBeTruthy();
    });
  });

  describe("cardHolder validation", () => {
    it("rejects empty card holder", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cardHolder: "" }),
      ).rejects.toThrow("Card holder name is required");
    });
  });

  describe("email validation", () => {
    it("rejects empty email", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, email: "" }),
      ).rejects.toThrow("Email is required");
    });

    it("rejects invalid email format", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, email: "notanemail" }),
      ).rejects.toThrow("Invalid email format");
    });
  });

  describe("delivery fields validation", () => {
    it("rejects empty address", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, address: "" }),
      ).rejects.toThrow("Address is required");
    });

    it("rejects empty city", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, city: "" }),
      ).rejects.toThrow("City is required");
    });

    it("rejects empty country", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, country: "" }),
      ).rejects.toThrow("Country is required");
    });
  });

  describe("input sanitization (OWASP)", () => {
    it("rejects cardHolder with HTML tags", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cardHolder: "<script>alert('xss')</script>" }),
      ).rejects.toThrow("invalid characters");
    });

    it("rejects address with script injection", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, address: '<img onerror="alert(1)">' }),
      ).rejects.toThrow("invalid characters");
    });

    it("rejects city with HTML tags", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, city: "<b>Bogota</b>" }),
      ).rejects.toThrow("invalid characters");
    });

    it("rejects country with special characters", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, country: "CO; DROP TABLE users;" }),
      ).rejects.toThrow("invalid characters");
    });

    it("accepts cardHolder with accented characters", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, cardHolder: "José García-López" }),
      ).resolves.toBeTruthy();
    });

    it("accepts address with numbers and punctuation", async () => {
      await expect(
        checkoutSchema.validate({ ...validData, address: "Calle 123 #45-67" }),
      ).resolves.toBeTruthy();
    });
  });
});
