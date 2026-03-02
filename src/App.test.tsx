import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/product/productSlice";
import checkoutReducer from "./features/checkout/checkoutSlice";
import App from "./App";

jest.mock("./features/product/productAPI", () => ({
  productAPI: {
    getProducts: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("./features/checkout/checkoutAPI", () => ({
  checkoutAPI: {
    generateCardToken: jest.fn(),
    getAcceptanceToken: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransactionStatus: jest.fn(),
  },
}));

function renderApp(route = "/") {
  const store = configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
}

describe("App", () => {
  it("renders ProductPage on root route", async () => {
    renderApp("/");
    expect(screen.getByText(/products store/i)).toBeInTheDocument();
  });

  it("redirects from /checkout to / when no product selected", async () => {
    renderApp("/checkout");
    expect(await screen.findByText(/products store/i)).toBeInTheDocument();
  });
});
