import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../product/productSlice";
import checkoutReducer from "../checkoutSlice";
import StepResult from "./StepResult";
import { CheckoutProvider } from "../CheckoutContext";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../product/productAPI", () => ({
  productAPI: {
    getProducts: jest.fn().mockResolvedValue([]),
  },
}));

function renderWithProviders(checkoutStatus: "idle" | "processing" | "success" | "failed") {
  const store = configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
    },
    preloadedState: {
      checkout: {
        step: 4 as const,
        status: checkoutStatus,
        customer: null,
        delivery: null,
        paymentMeta: null,
      },
      product: {
        items: [],
        selectedProduct: null,
        status: "idle" as const,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CheckoutProvider>
          <StepResult />
        </CheckoutProvider>
      </MemoryRouter>
    </Provider>,
  );
}

describe("StepResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("shows success message when payment is approved", () => {
    renderWithProviders("success");
    expect(screen.getByText(/payment approved/i)).toBeInTheDocument();
    expect(screen.getByText(/your order was successful/i)).toBeInTheDocument();
  });

  it("shows failure message when payment is declined", () => {
    renderWithProviders("failed");
    expect(screen.getByText(/payment declined/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again/i)).toBeInTheDocument();
  });

  it("shows fallback message for unknown status", () => {
    renderWithProviders("idle");
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders back to store button", () => {
    renderWithProviders("success");
    expect(
      screen.getByRole("button", { name: /back to store/i }),
    ).toBeInTheDocument();
  });

  it("navigates to home on back button click", async () => {
    renderWithProviders("success");
    await userEvent.click(
      screen.getByRole("button", { name: /back to store/i }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("clears localStorage on back button click", async () => {
    localStorage.setItem("app_state", "test");
    localStorage.setItem("checkout_form_draft", "test");
    renderWithProviders("success");
    await userEvent.click(
      screen.getByRole("button", { name: /back to store/i }),
    );
    expect(localStorage.getItem("app_state")).toBeNull();
    expect(localStorage.getItem("checkout_form_draft")).toBeNull();
  });
});
