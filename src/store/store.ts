import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/product/productSlice";
import checkoutReducer from "../features/checkout/checkoutSlice";
import { loadPersistedState, saveState } from "./persistence";

const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: {
    product: productReducer,
    checkout: checkoutReducer,
  },
  devTools: import.meta.env.DEV,
  ...(preloadedState && { preloadedState }),
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const state = store.getState();
    saveState({
      checkout: state.checkout,
      product: { selectedProduct: state.product.selectedProduct },
    });
  }, 300);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
