import { selectProducts, selectProductStatus, selectSelectedProduct } from "./selectors";

describe("product selectors", () => {
  const mockState = {
    product: {
      items: [
        { id: "1", name: "P1", description: "D", price: 1000, stock: 5 },
        { id: "2", name: "P2", description: "D2", price: 2000, stock: 3 },
      ],
      selectedProduct: { id: "1", name: "P1", description: "D", price: 1000, stock: 5 },
      status: "idle" as const,
    },
    checkout: {
      step: 1 as const,
      status: "idle" as const,
      customer: null,
      delivery: null,
      paymentMeta: null,
    },
  };

  it("selectProducts returns items", () => {
    expect(selectProducts(mockState)).toEqual(mockState.product.items);
  });

  it("selectProductStatus returns status", () => {
    expect(selectProductStatus(mockState)).toBe("idle");
  });

  it("selectSelectedProduct returns selected product", () => {
    expect(selectSelectedProduct(mockState)).toEqual(mockState.product.selectedProduct);
  });

  it("selectSelectedProduct returns null when no product selected", () => {
    const stateNoProduct = {
      ...mockState,
      product: { ...mockState.product, selectedProduct: null },
    };
    expect(selectSelectedProduct(stateNoProduct)).toBeNull();
  });
});
