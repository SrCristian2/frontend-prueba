import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import checkoutReducer from "../checkout/checkoutSlice";
import ProductPage from "./ProductPage";

jest.mock("./productAPI", () => ({
  productAPI: {
    getProducts: jest.fn(),
  },
}));

import { productAPI } from "./productAPI";
const mockedGetProducts = productAPI.getProducts as jest.Mock;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderWithProviders(preloadedState?: any) {
  const store = configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
    },
    ...(preloadedState && { preloadedState }),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("ProductPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockedGetProducts.mockReturnValue(new Promise(() => {}));
    renderWithProviders();
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("shows products after loading", async () => {
    mockedGetProducts.mockResolvedValue([
      {
        id: "1",
        name: "Test Product",
        description: "Desc",
        price: 10000,
        stock: 5,
      },
    ]);

    renderWithProviders();
    expect(await screen.findByText("Test Product")).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    mockedGetProducts.mockRejectedValue(new Error("Network error"));
    renderWithProviders();
    expect(
      await screen.findByText(/oops, something went wrong/i),
    ).toBeInTheDocument();
  });

  it("shows retry button on error", async () => {
    mockedGetProducts.mockRejectedValue(new Error("Error"));
    renderWithProviders();
    expect(await screen.findByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("retries fetch on retry button click", async () => {
    mockedGetProducts
      .mockRejectedValueOnce(new Error("Error"))
      .mockResolvedValueOnce([
        { id: "1", name: "Product", description: "D", price: 1000, stock: 1 },
      ]);

    renderWithProviders();
    const retryBtn = await screen.findByRole("button", { name: /retry/i });
    await userEvent.click(retryBtn);
    expect(mockedGetProducts).toHaveBeenCalledTimes(2);
  });

  it("shows empty state when no products", async () => {
    mockedGetProducts.mockResolvedValue([]);
    renderWithProviders();
    expect(
      await screen.findByRole("heading", { name: /no products available/i }),
    ).toBeInTheDocument();
  });

  it("navigates to checkout when product is selected", async () => {
    mockedGetProducts.mockResolvedValue([
      { id: "1", name: "Product", description: "D", price: 10000, stock: 5 },
    ]);

    renderWithProviders();
    const button = await screen.findByRole("button", {
      name: /pay with credit card/i,
    });
    await userEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  it("renders page title", () => {
    mockedGetProducts.mockReturnValue(new Promise(() => {}));
    renderWithProviders();
    expect(screen.getByText(/products store/i)).toBeInTheDocument();
  });
});
