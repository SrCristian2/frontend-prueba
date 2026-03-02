import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../product/productSlice";
import checkoutReducer from "../checkoutSlice";
import StepSummary from "./StepSummary";
import { CheckoutProvider, useCheckoutContext } from "../CheckoutContext";
import { useEffect } from "react";

jest.mock("../checkoutAPI", () => ({
  checkoutAPI: {
    generateCardToken: jest.fn(),
    getAcceptanceToken: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransactionStatus: jest.fn(),
  },
}));

const mockProduct = {
  id: "1",
  name: "Test Product",
  description: "Description",
  price: 50000,
  stock: 10,
};

const mockCardData = {
  fullNumber: "4111111111111111",
  expiry: "12/30",
  cvv: "123",
  cardHolder: "John Doe",
};

function CardDataSetter({ children }: { children: React.ReactNode }) {
  const { setCardData } = useCheckoutContext();
  useEffect(() => {
    setCardData(mockCardData);
  }, [setCardData]);
  return <>{children}</>;
}

function renderWithProviders() {
  const store = configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
    },
    preloadedState: {
      product: {
        items: [mockProduct],
        selectedProduct: mockProduct,
        status: "idle" as const,
      },
      checkout: {
        step: 2 as const,
        status: "idle" as const,
        customer: { name: "John", email: "john@test.com" },
        delivery: { address: "123 St", city: "Bogota", country: "Colombia" },
        paymentMeta: { brand: "visa", last4: "1111", expiry: "12/30" },
      },
    },
  });

  return { store, ...render(
    <Provider store={store}>
      <CheckoutProvider>
        <CardDataSetter>
          <StepSummary />
        </CardDataSetter>
      </CheckoutProvider>
    </Provider>,
  )};
}

describe("StepSummary", () => {
  it("renders order summary title", () => {
    renderWithProviders();
    expect(screen.getByText(/order summary/i)).toBeInTheDocument();
  });

  it("renders product name and price", () => {
    renderWithProviders();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it("renders base fee", () => {
    renderWithProviders();
    expect(screen.getByText("Base Fee")).toBeInTheDocument();
    expect(screen.getByText(/2\.000/)).toBeInTheDocument();
  });

  it("renders delivery fee", () => {
    renderWithProviders();
    expect(screen.getByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
  });

  it("renders correct total (product + base + delivery)", () => {
    renderWithProviders();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText(/57\.000/)).toBeInTheDocument();
  });

  it("renders confirm payment button", () => {
    renderWithProviders();
    expect(
      screen.getByRole("button", { name: /confirm payment/i }),
    ).toBeInTheDocument();
  });

  it("renders back button", () => {
    renderWithProviders();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("dispatches setStep(1) on back button click", async () => {
    const { store } = renderWithProviders();
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(store.getState().checkout.step).toBe(1);
  });

  it("dispatches processPayment on confirm click", async () => {
    const { store } = renderWithProviders();
    await userEvent.click(
      screen.getByRole("button", { name: /confirm payment/i }),
    );
    const status = store.getState().checkout.status;
    expect(["processing", "failed"]).toContain(status);
    expect(store.getState().checkout.step).toBeGreaterThanOrEqual(3);
  });

  it("returns null when no product is selected", () => {
    const store = configureStore({
      reducer: {
        product: productReducer,
        checkout: checkoutReducer,
      },
      preloadedState: {
        product: { items: [], selectedProduct: null, status: "idle" as const },
        checkout: {
          step: 2 as const,
          status: "idle" as const,
          customer: null,
          delivery: null,
          paymentMeta: null,
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <CheckoutProvider>
          <StepSummary />
        </CheckoutProvider>
      </Provider>,
    );

    expect(container.innerHTML).toBe("");
  });
});
