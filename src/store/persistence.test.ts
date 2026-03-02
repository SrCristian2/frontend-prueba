import {
  loadPersistedState,
  saveState,
  clearPersistedState,
} from "./persistence";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockState = {
    checkout: {
      step: 2 as const,
      status: "idle" as const,
      customer: { name: "John", email: "john@test.com" },
      delivery: { address: "123 St", city: "Bogota", country: "Colombia" },
      paymentMeta: { brand: "visa", last4: "1111", expiry: "12/30" },
    },
    product: {
      selectedProduct: {
        id: "1",
        name: "Test Product",
        description: "A product",
        price: 50000,
        stock: 10,
      },
    },
  };

  describe("saveState", () => {
    it("saves state to localStorage", () => {
      saveState(mockState);
      const stored = localStorage.getItem("app_state");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.checkout.step).toBe(2);
      expect(parsed.product.selectedProduct.name).toBe("Test Product");
    });

    it("only persists specific checkout fields", () => {
      saveState(mockState);
      const stored = JSON.parse(localStorage.getItem("app_state")!);
      expect(stored.checkout).toHaveProperty("step");
      expect(stored.checkout).toHaveProperty("status");
      expect(stored.checkout).toHaveProperty("customer");
      expect(stored.checkout).toHaveProperty("delivery");
      expect(stored.checkout).toHaveProperty("paymentMeta");
    });
  });

  describe("loadPersistedState", () => {
    it("returns undefined when no state is saved", () => {
      expect(loadPersistedState()).toBeUndefined();
    });

    it("loads saved state correctly", () => {
      saveState(mockState);
      const loaded = loadPersistedState();
      expect(loaded).toBeDefined();
      expect(loaded!.checkout.step).toBe(2);
      expect(loaded!.product.selectedProduct?.name).toBe("Test Product");
    });

    it("returns product items as empty array", () => {
      saveState(mockState);
      const loaded = loadPersistedState();
      expect(loaded!.product.items).toEqual([]);
      expect(loaded!.product.status).toBe("idle");
    });

    it("returns undefined for corrupted JSON", () => {
      localStorage.setItem("app_state", "not-valid-json");
      expect(loadPersistedState()).toBeUndefined();
    });

    it("handles missing selectedProduct gracefully", () => {
      const stateWithoutProduct = {
        ...mockState,
        product: { selectedProduct: null },
      };
      saveState(stateWithoutProduct);
      const loaded = loadPersistedState();
      expect(loaded!.product.selectedProduct).toBeNull();
    });

    it("returns undefined for non-object parsed data", () => {
      localStorage.setItem("app_state", '"just a string"');
      expect(loadPersistedState()).toBeUndefined();
    });

    it("returns undefined for null parsed data", () => {
      localStorage.setItem("app_state", "null");
      expect(loadPersistedState()).toBeUndefined();
    });

    it("returns undefined when checkout is missing", () => {
      localStorage.setItem("app_state", JSON.stringify({ product: {} }));
      expect(loadPersistedState()).toBeUndefined();
    });

    it("returns undefined for invalid checkout.step", () => {
      const tampered = {
        checkout: { step: 99, status: "idle", customer: null, delivery: null, paymentMeta: null },
        product: { selectedProduct: null },
      };
      localStorage.setItem("app_state", JSON.stringify(tampered));
      expect(loadPersistedState()).toBeUndefined();
    });

    it("returns undefined for invalid checkout.status", () => {
      const tampered = {
        checkout: { step: 1, status: "hacked", customer: null, delivery: null, paymentMeta: null },
        product: { selectedProduct: null },
      };
      localStorage.setItem("app_state", JSON.stringify(tampered));
      expect(loadPersistedState()).toBeUndefined();
    });

    it("accepts valid step and status values", () => {
      for (const step of [1, 2, 3, 4]) {
        for (const status of ["idle", "processing", "success", "failed"]) {
          const valid = {
            checkout: { step, status, customer: null, delivery: null, paymentMeta: null },
            product: { selectedProduct: null },
          };
          localStorage.setItem("app_state", JSON.stringify(valid));
          expect(loadPersistedState()).toBeDefined();
        }
      }
    });
  });

  describe("clearPersistedState", () => {
    it("removes state from localStorage", () => {
      saveState(mockState);
      expect(localStorage.getItem("app_state")).not.toBeNull();
      clearPersistedState();
      expect(localStorage.getItem("app_state")).toBeNull();
    });

    it("does not throw when no state exists", () => {
      expect(() => clearPersistedState()).not.toThrow();
    });
  });
});
