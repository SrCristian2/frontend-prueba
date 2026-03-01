import type { RootState } from "../../store/store";

export const selectProducts = (state: RootState) => state.product.items;
export const selectProductStatus = (state: RootState) => state.product.status;
export const selectSelectedProduct = (state: RootState) =>
  state.product.selectedProduct;
