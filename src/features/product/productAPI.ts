import axios from "axios";
import type { Product } from "./type";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL no está configurado. Verifica tu archivo .env"
  );
}

export const productAPI = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/products`);

      if (!Array.isArray(response.data)) {
        throw new Error("La respuesta de la API no es un array válido");
      }

      return response.data as Product[];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error desconocido al cargar productos");
    }
  },
};
