import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../product/productSlice";
import checkoutReducer from "../checkoutSlice";
import StepCardDelivery from "./StepCardDelivery";
import { CheckoutProvider } from "../CheckoutContext";

jest.mock("../checkoutAPI", () => ({
  checkoutAPI: {
    generateCardToken: jest.fn(),
    getAcceptanceToken: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransactionStatus: jest.fn(),
  },
}));

function renderWithProviders(preloadedCheckout?: any) {
  const store = configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
    },
    preloadedState: {
      product: {
        items: [],
        selectedProduct: {
          id: "1",
          name: "Test",
          description: "Desc",
          price: 50000,
          stock: 10,
        },
        status: "idle" as const,
      },
      checkout: preloadedCheckout || {
        step: 1 as const,
        status: "idle" as const,
        customer: null,
        delivery: null,
        paymentMeta: null,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <CheckoutProvider>
          <StepCardDelivery />
        </CheckoutProvider>
      </Provider>,
    ),
  };
}

describe("StepCardDelivery", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders payment information title", () => {
    renderWithProviders();
    expect(screen.getByText(/payment information/i)).toBeInTheDocument();
  });

  it("renders delivery information section", () => {
    renderWithProviders();
    expect(screen.getByText(/delivery information/i)).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    renderWithProviders();
    expect(screen.getByPlaceholderText("Card Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MM/YY")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("CVV")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Card Holder Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Country")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProviders();
    expect(
      screen.getByRole("button", { name: /pay now/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProviders();
    await userEvent.click(screen.getByRole("button", { name: /pay now/i }));
    expect(
      await screen.findByText(/card number is required/i),
    ).toBeInTheDocument();
  });

  it("formats card number as user types", async () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText("Card Number");
    await userEvent.type(input, "4111111111111111");
    expect(input).toHaveValue("4111 1111 1111 1111");
  });

  it("shows Visa logo for cards starting with 4", async () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText("Card Number");
    await userEvent.type(input, "4111");
    expect(screen.getByAltText("Visa")).toBeInTheDocument();
  });

  it("shows Mastercard logo for cards starting with 51-55", async () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText("Card Number");
    await userEvent.type(input, "5200");
    expect(screen.getByAltText("Mastercard")).toBeInTheDocument();
  });

  it("does not show card logo for unknown brand", async () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText("Card Number");
    await userEvent.type(input, "6011");
    expect(screen.queryByAltText("Visa")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Mastercard")).not.toBeInTheDocument();
  });

  it("advances to step 2 on valid form submission", async () => {
    const { store } = renderWithProviders();

    await userEvent.type(
      screen.getByPlaceholderText("Card Number"),
      "4111111111111111",
    );
    await userEvent.type(screen.getByPlaceholderText("MM/YY"), "12/30");
    await userEvent.type(screen.getByPlaceholderText("CVV"), "123");
    await userEvent.type(
      screen.getByPlaceholderText("Card Holder Name"),
      "John Doe",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Email"),
      "john@test.com",
    );
    await userEvent.type(screen.getByPlaceholderText("Address"), "123 Main St");
    await userEvent.type(screen.getByPlaceholderText("City"), "Bogota");

    await userEvent.click(screen.getByRole("button", { name: /pay now/i }));

    await new Promise((r) => setTimeout(r, 100));
    expect(store.getState().checkout.step).toBe(2);
  });

  it("saves non-sensitive draft to localStorage", async () => {
    renderWithProviders();
    await userEvent.type(
      screen.getByPlaceholderText("Card Holder Name"),
      "Jane",
    );
    await new Promise((r) => setTimeout(r, 100));
    const draft = localStorage.getItem("checkout_form_draft");
    expect(draft).not.toBeNull();
    const parsed = JSON.parse(draft!);
    expect(parsed.cardHolder).toBe("Jane");
  });

  it("restores draft from localStorage", () => {
    localStorage.setItem(
      "checkout_form_draft",
      JSON.stringify({
        cardHolder: "Saved User",
        email: "saved@test.com",
        address: "Saved St",
        city: "Saved City",
        country: "Saved Country",
      }),
    );

    renderWithProviders();
    expect(screen.getByPlaceholderText("Card Holder Name")).toHaveValue(
      "Saved User",
    );
    expect(screen.getByPlaceholderText("Email")).toHaveValue("saved@test.com");
  });

  it("sets country default to Colombia", () => {
    renderWithProviders();
    expect(screen.getByPlaceholderText("Country")).toHaveValue("Colombia");
  });
});
