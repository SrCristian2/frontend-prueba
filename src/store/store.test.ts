import { store } from "./store";

describe("store", () => {
  it("has the correct initial state shape", () => {
    const state = store.getState();
    expect(state).toHaveProperty("product");
    expect(state).toHaveProperty("checkout");
  });

  it("has product slice with expected shape", () => {
    const { product } = store.getState();
    expect(product).toHaveProperty("items");
    expect(product).toHaveProperty("selectedProduct");
    expect(product).toHaveProperty("status");
  });

  it("has checkout slice with expected shape", () => {
    const { checkout } = store.getState();
    expect(checkout).toHaveProperty("step");
    expect(checkout).toHaveProperty("status");
    expect(checkout).toHaveProperty("customer");
    expect(checkout).toHaveProperty("delivery");
    expect(checkout).toHaveProperty("paymentMeta");
  });

  it("dispatch is a function", () => {
    expect(typeof store.dispatch).toBe("function");
  });

  it("getState is a function", () => {
    expect(typeof store.getState).toBe("function");
  });

  it("subscribe is a function", () => {
    expect(typeof store.subscribe).toBe("function");
  });
});
