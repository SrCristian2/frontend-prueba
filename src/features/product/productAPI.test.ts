import axios from "axios";
import { productAPI } from "./productAPI";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("productAPI", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProducts", () => {
    it("fetches products from the API", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Product 1",
          description: "Desc",
          price: 10000,
          stock: 5,
        },
        {
          id: "2",
          name: "Product 2",
          description: "Desc 2",
          price: 20000,
          stock: 3,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      const result = await productAPI.getProducts();

      expect(result).toEqual(mockProducts);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/products",
      );
    });

    it("throws when response is not an array", async () => {
      mockedAxios.get.mockResolvedValue({ data: { not: "array" } });

      await expect(productAPI.getProducts()).rejects.toThrow(
        "La respuesta de la API no es un array válido",
      );
    });

    it("throws on network error", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      await expect(productAPI.getProducts()).rejects.toThrow("Network error");
    });

    it("wraps unknown errors", async () => {
      mockedAxios.get.mockRejectedValue("string error");

      await expect(productAPI.getProducts()).rejects.toThrow(
        "Error desconocido al cargar productos",
      );
    });
  });
});
