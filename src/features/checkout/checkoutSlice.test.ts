import checkoutReducer, {
  setStep,
  setCustomer,
  setDelivery,
  setPaymentMeta,
  resetCheckout,
  processPayment,
} from "./checkoutSlice";

jest.mock("./checkoutAPI", () => ({
  checkoutAPI: {
    generateCardToken: jest.fn(),
    getAcceptanceToken: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransactionStatus: jest.fn(),
  },
}));

import { checkoutAPI } from "./checkoutAPI";
const mockedAPI = checkoutAPI as jest.Mocked<typeof checkoutAPI>;

describe("checkoutSlice", () => {
  const initialState = {
    step: 1 as const,
    status: "idle" as const,
    customer: null,
    delivery: null,
    paymentMeta: null,
  };

  describe("reducers", () => {
    it("returns the initial state", () => {
      expect(checkoutReducer(undefined, { type: "unknown" })).toEqual(
        initialState,
      );
    });

    it("handles setStep", () => {
      const state = checkoutReducer(initialState, setStep(2));
      expect(state.step).toBe(2);
    });

    it("handles setCustomer", () => {
      const customer = { name: "John", email: "john@test.com" };
      const state = checkoutReducer(initialState, setCustomer(customer));
      expect(state.customer).toEqual(customer);
    });

    it("handles setDelivery", () => {
      const delivery = {
        address: "123 St",
        city: "Bogota",
        country: "Colombia",
      };
      const state = checkoutReducer(initialState, setDelivery(delivery));
      expect(state.delivery).toEqual(delivery);
    });

    it("handles setPaymentMeta", () => {
      const meta = { brand: "visa", last4: "1111", expiry: "12/30" };
      const state = checkoutReducer(initialState, setPaymentMeta(meta));
      expect(state.paymentMeta).toEqual(meta);
    });

    it("handles resetCheckout", () => {
      const modifiedState = {
        step: 3 as const,
        status: "success" as const,
        customer: { name: "John", email: "john@test.com" },
        delivery: { address: "St", city: "City", country: "CO" },
        paymentMeta: { brand: "visa", last4: "1111", expiry: "12/30" },
      };
      const state = checkoutReducer(modifiedState, resetCheckout());
      expect(state).toEqual(initialState);
    });
  });

  describe("processPayment thunk", () => {
    const payload = {
      fullNumber: "4111111111111111",
      expiry: "12/30",
      cvv: "123",
      cardHolder: "John Doe",
    };

    it("sets processing status and step 3 on pending", () => {
      const action = { type: processPayment.pending.type };
      const state = checkoutReducer(initialState, action);
      expect(state.status).toBe("processing");
      expect(state.step).toBe(3);
    });

    it("sets success status and step 4 on APPROVED", () => {
      const action = {
        type: processPayment.fulfilled.type,
        payload: "APPROVED",
      };
      const state = checkoutReducer(initialState, action);
      expect(state.status).toBe("success");
      expect(state.step).toBe(4);
    });

    it("sets failed status and step 4 on DECLINED", () => {
      const action = {
        type: processPayment.fulfilled.type,
        payload: "DECLINED",
      };
      const state = checkoutReducer(initialState, action);
      expect(state.status).toBe("failed");
      expect(state.step).toBe(4);
    });

    it("sets failed status and step 4 on rejected", () => {
      const action = { type: processPayment.rejected.type };
      const state = checkoutReducer(initialState, action);
      expect(state.status).toBe("failed");
      expect(state.step).toBe(4);
    });

    it("completes APPROVED payment flow", async () => {
      mockedAPI.generateCardToken.mockResolvedValue("tok_123");
      mockedAPI.getAcceptanceToken.mockResolvedValue("acc_123");
      mockedAPI.createTransaction.mockResolvedValue({
        transactionId: "txn_123",
      });
      mockedAPI.processPayment.mockResolvedValue({ status: "APPROVED" });

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        checkout: {
          ...initialState,
          customer: { name: "John", email: "john@test.com" },
          delivery: {
            address: "123 St",
            city: "Bogota",
            country: "Colombia",
          },
        },
        product: {
          selectedProduct: {
            id: "1",
            name: "Test",
            description: "Desc",
            price: 50000,
            stock: 10,
          },
        },
      });

      const thunk = processPayment(payload);
      await thunk(dispatch, getState, undefined);

      expect(mockedAPI.generateCardToken).toHaveBeenCalled();
      expect(mockedAPI.getAcceptanceToken).toHaveBeenCalled();
      expect(mockedAPI.createTransaction).toHaveBeenCalled();
      expect(mockedAPI.processPayment).toHaveBeenCalledWith("txn_123", {
        cardToken: "tok_123",
        acceptanceToken: "acc_123",
        address: "123 St",
        city: "Bogota",
        country: "Colombia",
      });

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: processPayment.fulfilled.type,
          payload: "APPROVED",
        }),
      );
    });

    it("rejects when no product is selected", async () => {
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        checkout: { ...initialState, customer: { name: "John", email: "j@t.com" } },
        product: { selectedProduct: null },
      });

      const thunk = processPayment(payload);
      await thunk(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: processPayment.rejected.type,
        }),
      );
    });

    it("rejects when customer email is missing", async () => {
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        checkout: { ...initialState, customer: null },
        product: {
          selectedProduct: {
            id: "1",
            name: "Test",
            description: "Desc",
            price: 50000,
            stock: 10,
          },
        },
      });

      const thunk = processPayment(payload);
      await thunk(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: processPayment.rejected.type,
        }),
      );
    });

    it("polls when status is PENDING and resolves to final status", async () => {
      mockedAPI.generateCardToken.mockResolvedValue("tok_123");
      mockedAPI.getAcceptanceToken.mockResolvedValue("acc_123");
      mockedAPI.createTransaction.mockResolvedValue({
        transactionId: "txn_123",
      });
      mockedAPI.processPayment.mockResolvedValue({ status: "PENDING" });
      mockedAPI.getTransactionStatus
        .mockResolvedValueOnce({ status: "PENDING" })
        .mockResolvedValueOnce({ status: "APPROVED" });

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        checkout: {
          ...initialState,
          customer: { name: "John", email: "john@test.com" },
          delivery: { address: "St", city: "City", country: "CO" },
        },
        product: {
          selectedProduct: {
            id: "1",
            name: "Test",
            description: "Desc",
            price: 50000,
            stock: 10,
          },
        },
      });

      const thunk = processPayment(payload);
      await thunk(dispatch, getState, undefined);

      expect(mockedAPI.getTransactionStatus).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: processPayment.fulfilled.type,
          payload: "APPROVED",
        }),
      );
    });
  });
});
