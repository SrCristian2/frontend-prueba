import type { RootState } from "../../store/store";

export const selectCheckoutStep = (state: RootState) => state.checkout.step;
export const selectCheckoutStatus = (state: RootState) => state.checkout.status;
export const selectCheckoutData = (state: RootState) => state.checkout;
