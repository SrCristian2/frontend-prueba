import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../product/productSlice";
import checkoutReducer from "./checkoutSlice";
import CheckoutFlow from "./CheckoutFlow";

jest.mock("./checkoutAPI", () => ({
  checkoutAPI: {
    generateCardToken: jest.fn(),
    getAcceptanceToken: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransactionStatus: jest.fn(),
  },
}));

jest.mock("../product/productAPI", () => ({
  productAPI: {
    getProducts: jest.fn().mockResolvedValue([]),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockProduct = {
  id: "1",
  name: "Test Product",
  description: "Description",
  price: 50000,
  stock: 10,
};

function renderWithProviders(step: number, selectedProduct: any = mockProduct) {
  const store = configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
    },
    preloadedState: {
      product: {
        items: [],
        selectedProduct: selectedProduct,
        status: "idle" as const,
      },
      checkout: {
        step: step as 1 | 2 | 3 | 4,
        status: (step === 4 ? "success" : step === 3 ? "processing" : "idle") as "idle" | "processing" | "success" | "failed",
        customer: { name: "John", email: "john@test.com" },
        delivery: { address: "St", city: "City", country: "CO" },
        paymentMeta: { brand: "visa", last4: "1111", expiry: "12/30" },
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/checkout"]}>
        <CheckoutFlow />
      </MemoryRouter>
    </Provider>,
  );
}

describe("CheckoutFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to home when no product is selected", () => {
    renderWithProviders(1, null);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders StepCardDelivery on step 1", () => {
    renderWithProviders(1);
    expect(screen.getByText(/payment information/i)).toBeInTheDocument();
  });

  it("renders StepSummary container on step 2 (empty without card context)", () => {
    const { container } = renderWithProviders(2);
    expect(container.querySelector("[class*='container']")).toBeInTheDocument();
    expect(screen.queryByText(/payment information/i)).not.toBeInTheDocument();
  });

  it("renders StepProcessing on step 3", () => {
    renderWithProviders(3);
    expect(screen.getByText(/processing payment/i)).toBeInTheDocument();
  });

  it("renders StepResult on step 4", () => {
    renderWithProviders(4);
    expect(screen.getByText(/payment approved/i)).toBeInTheDocument();
  });
});
