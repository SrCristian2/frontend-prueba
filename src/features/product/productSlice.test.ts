import productReducer, { selectProduct, fetchProducts } from "./productSlice";

jest.mock("./productAPI", () => ({
  productAPI: {
    getProducts: jest.fn(),
  },
}));

import { productAPI } from "./productAPI";
const mockedGetProducts = productAPI.getProducts as jest.Mock;

describe("productSlice", () => {
  const initialState = {
    items: [],
    selectedProduct: null,
    status: "idle" as const,
  };

  const mockProduct = {
    id: "1",
    name: "Test Product",
    description: "A test product",
    price: 50000,
    stock: 10,
  };

  describe("reducers", () => {
    it("returns the initial state", () => {
      expect(productReducer(undefined, { type: "unknown" })).toEqual(
        initialState,
      );
    });

    it("handles selectProduct", () => {
      const state = productReducer(initialState, selectProduct(mockProduct));
      expect(state.selectedProduct).toEqual(mockProduct);
    });

    it("handles selectProduct with null", () => {
      const stateWithProduct = { ...initialState, selectedProduct: mockProduct };
      const state = productReducer(stateWithProduct, selectProduct(null));
      expect(state.selectedProduct).toBeNull();
    });
  });

  describe("fetchProducts thunk", () => {
    it("sets loading status on pending", () => {
      const action = { type: fetchProducts.pending.type };
      const state = productReducer(initialState, action);
      expect(state.status).toBe("loading");
    });

    it("sets items and idle status on fulfilled", () => {
      const products = [mockProduct, { ...mockProduct, id: "2", name: "Product 2" }];
      const action = { type: fetchProducts.fulfilled.type, payload: products };
      const state = productReducer(initialState, action);
      expect(state.status).toBe("idle");
      expect(state.items).toEqual(products);
    });

    it("sets error status on rejected", () => {
      const action = {
        type: fetchProducts.rejected.type,
        payload: "Network error",
      };
      const state = productReducer(initialState, action);
      expect(state.status).toBe("error");
      expect(state.error).toBe("Network error");
    });

    it("dispatches fulfilled with products data", async () => {
      const products = [mockProduct];
      mockedGetProducts.mockResolvedValue(products);

      const dispatch = jest.fn();
      const getState = jest.fn();

      const thunk = fetchProducts();
      await thunk(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: fetchProducts.pending.type }),
      );
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: fetchProducts.fulfilled.type,
          payload: products,
        }),
      );
    });

    it("dispatches rejected on API error", async () => {
      mockedGetProducts.mockRejectedValue(new Error("API Error"));

      const dispatch = jest.fn();
      const getState = jest.fn();

      const thunk = fetchProducts();
      await thunk(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: fetchProducts.rejected.type,
        }),
      );
    });
  });
});
