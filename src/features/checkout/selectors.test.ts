import {
  selectCheckoutStep,
  selectCheckoutStatus,
  selectCheckoutData,
} from "./selectors";

describe("checkout selectors", () => {
  const mockState = {
    product: {
      items: [],
      selectedProduct: null,
      status: "idle" as const,
    },
    checkout: {
      step: 2 as const,
      status: "processing" as const,
      customer: { name: "John", email: "john@test.com" },
      delivery: { address: "123 St", city: "Bogota", country: "Colombia" },
      paymentMeta: { brand: "visa", last4: "1111", expiry: "12/30" },
    },
  };

  it("selectCheckoutStep returns current step", () => {
    expect(selectCheckoutStep(mockState)).toBe(2);
  });

  it("selectCheckoutStatus returns current status", () => {
    expect(selectCheckoutStatus(mockState)).toBe("processing");
  });

  it("selectCheckoutData returns full checkout state", () => {
    expect(selectCheckoutData(mockState)).toEqual(mockState.checkout);
  });

  it("selectCheckoutData includes customer data", () => {
    expect(selectCheckoutData(mockState).customer).toEqual({
      name: "John",
      email: "john@test.com",
    });
  });

  it("selectCheckoutData includes delivery data", () => {
    expect(selectCheckoutData(mockState).delivery).toEqual({
      address: "123 St",
      city: "Bogota",
      country: "Colombia",
    });
  });
});
