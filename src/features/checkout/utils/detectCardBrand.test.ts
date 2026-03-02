import { detectCardBrand } from "./detectCardBrand";

describe("detectCardBrand", () => {
  describe("Visa detection", () => {
    it("detects Visa card starting with 4", () => {
      expect(detectCardBrand("4111111111111111")).toBe("visa");
    });

    it("detects Visa with spaces", () => {
      expect(detectCardBrand("4111 1111 1111 1111")).toBe("visa");
    });

    it("detects Visa with single digit", () => {
      expect(detectCardBrand("4")).toBe("visa");
    });
  });

  describe("Mastercard detection", () => {
    it("detects Mastercard starting with 51", () => {
      expect(detectCardBrand("5111111111111111")).toBe("mastercard");
    });

    it("detects Mastercard starting with 52", () => {
      expect(detectCardBrand("5211111111111111")).toBe("mastercard");
    });

    it("detects Mastercard starting with 53", () => {
      expect(detectCardBrand("5311111111111111")).toBe("mastercard");
    });

    it("detects Mastercard starting with 54", () => {
      expect(detectCardBrand("5411111111111111")).toBe("mastercard");
    });

    it("detects Mastercard starting with 55", () => {
      expect(detectCardBrand("5511111111111111")).toBe("mastercard");
    });

    it("detects Mastercard in 2221-2720 range", () => {
      expect(detectCardBrand("2221111111111111")).toBe("mastercard");
    });

    it("detects Mastercard at range boundary 2720", () => {
      expect(detectCardBrand("2720111111111111")).toBe("mastercard");
    });

    it("detects Mastercard with spaces", () => {
      expect(detectCardBrand("5200 0000 0000 0000")).toBe("mastercard");
    });
  });

  describe("Unknown cards", () => {
    it("returns null for unknown card brand", () => {
      expect(detectCardBrand("6011111111111111")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(detectCardBrand("")).toBeNull();
    });

    it("returns null for non-Visa/MC starting digit", () => {
      expect(detectCardBrand("3")).toBeNull();
    });

    it("returns null for Mastercard-like but out of range (50)", () => {
      expect(detectCardBrand("5011111111111111")).toBeNull();
    });

    it("returns null for Mastercard-like but out of range (56)", () => {
      expect(detectCardBrand("5611111111111111")).toBeNull();
    });
  });
});
