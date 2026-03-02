import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats a price in COP currency", () => {
    expect(formatPrice(50000)).toContain("50.000");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });

  it("formats large numbers with thousands separator", () => {
    const result = formatPrice(1500000);
    expect(result).toContain("1.500.000");
  });

  it("returns a string containing the currency symbol", () => {
    const result = formatPrice(100);
    expect(result).toMatch(/\$|COP/);
  });

  it("formats decimal-free values without decimals", () => {
    const result = formatPrice(2000);
    expect(result).not.toContain(",00");
  });
});
