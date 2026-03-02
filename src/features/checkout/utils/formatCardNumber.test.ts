import { formatCardNumber } from "./formatCardNumber";

describe("formatCardNumber", () => {
  it("formats a 16-digit number into groups of 4", () => {
    expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
  });

  it("removes non-numeric characters", () => {
    expect(formatCardNumber("4111-1111-1111-1111")).toBe("4111 1111 1111 1111");
  });

  it("handles partial input", () => {
    expect(formatCardNumber("411111")).toBe("4111 11");
  });

  it("returns empty string for empty input", () => {
    expect(formatCardNumber("")).toBe("");
  });

  it("limits to 16 digits maximum", () => {
    expect(formatCardNumber("41111111111111119999")).toBe("4111 1111 1111 1111");
  });

  it("strips spaces from input before formatting", () => {
    expect(formatCardNumber("4111 1111")).toBe("4111 1111");
  });

  it("handles single digit", () => {
    expect(formatCardNumber("4")).toBe("4");
  });

  it("handles exactly 4 digits", () => {
    expect(formatCardNumber("4111")).toBe("4111");
  });

  it("handles 5 digits", () => {
    expect(formatCardNumber("41111")).toBe("4111 1");
  });
});
