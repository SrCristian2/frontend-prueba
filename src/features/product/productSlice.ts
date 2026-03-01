import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productAPI } from "./productAPI";
import type { Product } from "./type";

interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  status: "idle" | "loading" | "error";
  error?: string;
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  status: "idle",
};

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await productAPI.getProducts();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    selectProduct(state, action) {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      });
  },
});

export const { selectProduct } = productSlice.actions;
export default productSlice.reducer;
