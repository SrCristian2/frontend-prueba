import axios from "axios";
import { checkoutAPI } from "./checkoutAPI";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("checkoutAPI", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateCardToken", () => {
    it("sends card data to Wompi API and returns token", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { data: { id: "tok_test_123" } },
      });

      const result = await checkoutAPI.generateCardToken({
        number: "4111111111111111",
        expMonth: "12",
        expYear: "30",
        cvc: "123",
        cardHolder: "John Doe",
      });

      expect(result).toBe("tok_test_123");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards",
        {
          number: "4111111111111111",
          exp_month: "12",
          exp_year: "30",
          cvc: "123",
          card_holder: "John Doe",
        },
        {
          headers: {
            Authorization: "Bearer pub_test_key",
          },
        },
      );
    });

    it("throws when API call fails", async () => {
      mockedAxios.post.mockRejectedValue(new Error("Network error"));

      await expect(
        checkoutAPI.generateCardToken({
          number: "4111111111111111",
          expMonth: "12",
          expYear: "30",
          cvc: "123",
          cardHolder: "John Doe",
        }),
      ).rejects.toThrow("Network error");
    });
  });

  describe("createTransaction", () => {
    it("creates a transaction via backend", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { transactionId: "txn_123" },
      });

      const result = await checkoutAPI.createTransaction({
        productId: "prod_1",
        customerName: "John Doe",
        customerEmail: "john@test.com",
      });

      expect(result).toEqual({ transactionId: "txn_123" });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/transactions",
        {
          productId: "prod_1",
          customerName: "John Doe",
          customerEmail: "john@test.com",
        },
      );
    });
  });

  describe("processPayment", () => {
    it("processes payment for a transaction", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { status: "APPROVED" },
      });

      const result = await checkoutAPI.processPayment("txn_123", {
        cardToken: "tok_123",
        acceptanceToken: "acc_123",
        address: "123 St",
        city: "Bogota",
        country: "Colombia",
      });

      expect(result).toEqual({ status: "APPROVED" });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/transactions/txn_123/process-payment",
        {
          cardToken: "tok_123",
          acceptanceToken: "acc_123",
          address: "123 St",
          city: "Bogota",
          country: "Colombia",
        },
      );
    });
  });

  describe("getTransactionStatus", () => {
    it("returns transaction status", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { status: "APPROVED" },
      });

      const result = await checkoutAPI.getTransactionStatus("txn_123");

      expect(result).toEqual({ status: "APPROVED" });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/transactions/txn_123",
      );
    });
  });

  describe("getAcceptanceToken", () => {
    it("fetches acceptance token from Wompi", async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: "acc_token_123",
            },
          },
        },
      });

      const result = await checkoutAPI.getAcceptanceToken();

      expect(result).toBe("acc_token_123");
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_test_key",
      );
    });
  });
});
