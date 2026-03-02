import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL;
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

export const checkoutAPI = {
  async generateCardToken(cardData: any) {
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

  async createTransaction(data: any) {
    const response = await axios.post(`${BACKEND_URL}/transactions`, data);
    return response.data;
  },

  async processPayment(transactionId: string, data: any) {
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
