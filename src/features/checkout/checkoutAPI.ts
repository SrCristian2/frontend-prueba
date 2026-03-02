import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL;
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

if (!WOMPI_PUBLIC_KEY) {
  throw new Error(
    "VITE_WOMPI_PUBLIC_KEY is not configured. Check your .env file",
  );
}

interface CardTokenRequest {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

interface CreateTransactionRequest {
  productId: string;
  customerName: string;
  customerEmail: string;
}

interface ProcessPaymentRequest {
  cardToken: string;
  acceptanceToken: string;
  address?: string;
  city?: string;
  country?: string;
}

export const checkoutAPI = {
  async generateCardToken(cardData: CardTokenRequest) {
    const response = await axios.post(
      "https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards",
      {
        number: cardData.number,
        exp_month: cardData.expMonth,
        exp_year: cardData.expYear,
        cvc: cardData.cvc,
        card_holder: cardData.cardHolder,
      },
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
      },
    );

    return response.data.data.id;
  },

  async createTransaction(data: CreateTransactionRequest) {
    const response = await axios.post(`${BACKEND_URL}/transactions`, data);
    return response.data;
  },

  async processPayment(transactionId: string, data: ProcessPaymentRequest) {
    const response = await axios.post(
      `${BACKEND_URL}/transactions/${transactionId}/process-payment`,
      data,
    );
    return response.data;
  },

  async getTransactionStatus(
    transactionId: string,
  ): Promise<{ status: string }> {
    const response = await axios.get(
      `${BACKEND_URL}/transactions/${transactionId}`,
    );
    return response.data;
  },

  async getAcceptanceToken() {
    const response = await axios.get(
      `https://api-sandbox.co.uat.wompi.dev/v1/merchants/${WOMPI_PUBLIC_KEY}`,
    );
    return response.data.data.presigned_acceptance.acceptance_token;
  },
};
