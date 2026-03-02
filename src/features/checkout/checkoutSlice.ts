import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkoutAPI } from "./checkoutAPI";
import type { RootState } from "../../store/store";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

interface CheckoutState {
  step: 1 | 2 | 3 | 4;
  status: "idle" | "processing" | "success" | "failed";
  customer: { name: string; email: string } | null;
  delivery: { address: string; city: string; country: string } | null;
  paymentMeta: { brand: string | null; last4: string; expiry: string } | null;
}

const initialState: CheckoutState = {
  step: 1,
  status: "idle",
  customer: null,
  delivery: null,
  paymentMeta: null,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollTransactionStatus(transactionId: string): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await delay(POLL_INTERVAL_MS);
    const { status } = await checkoutAPI.getTransactionStatus(transactionId);
    if (status !== "PENDING") return status;
  }
  return "DECLINED";
}

export const processPayment = createAsyncThunk(
  "checkout/processPayment",
  async (
    payload: {
      fullNumber: string;
      expiry: string;
      cvv: string;
      cardHolder: string;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState;
      const { delivery } = state.checkout;
      const product = state.product.selectedProduct;

      if (!product) throw new Error("No product selected");

      const expMonth = payload.expiry.split("/")[0];
      const expYear = `${payload.expiry.split("/")[1]}`;

      const cardToken = await checkoutAPI.generateCardToken({
        number: payload.fullNumber,
        expMonth,
        expYear,
        cvc: payload.cvv,
        cardHolder: payload.cardHolder,
      });

      const acceptanceToken = await checkoutAPI.getAcceptanceToken();

      const customer = state.checkout.customer;

      const transaction = await checkoutAPI.createTransaction({
        productId: product.id,
        customerName: payload.cardHolder,
        customerEmail: customer?.email ?? payload.cardHolder,
      });

      const result = await checkoutAPI.processPayment(
        transaction.transactionId,
        {
          cardToken,
          acceptanceToken,
          address: delivery?.address,
          city: delivery?.city,
          country: delivery?.country,
        },
      );

      if (result.status === "PENDING") {
        const finalStatus = await pollTransactionStatus(
          transaction.transactionId,
        );
        return finalStatus;
      }

      return result.status;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
    },
    setCustomer(state, action) {
      state.customer = action.payload;
    },
    setDelivery(state, action) {
      state.delivery = action.payload;
    },
    setPaymentMeta(state, action) {
      state.paymentMeta = action.payload;
    },
    resetCheckout() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.status = "processing";
        state.step = 3;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.status = action.payload === "APPROVED" ? "success" : "failed";
        state.step = 4;
      })
      .addCase(processPayment.rejected, (state) => {
        state.status = "failed";
        state.step = 4;
      });
  },
});

export const {
  setStep,
  setCustomer,
  setDelivery,
  setPaymentMeta,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
