import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutProvider, useCheckoutContext } from "./CheckoutContext";

function TestConsumer() {
  const { cardData, setCardData } = useCheckoutContext();
  return (
    <div>
      <span data-testid="card-data">
        {cardData ? cardData.fullNumber : "null"}
      </span>
      <button
        onClick={() =>
          setCardData({
            fullNumber: "4111111111111111",
            expiry: "12/30",
            cvv: "123",
            cardHolder: "John",
          })
        }
      >
        Set Card
      </button>
      <button onClick={() => setCardData(null)}>Clear Card</button>
    </div>
  );
}

describe("CheckoutContext", () => {
  it("provides null card data by default", () => {
    render(
      <CheckoutProvider>
        <TestConsumer />
      </CheckoutProvider>,
    );
    expect(screen.getByTestId("card-data")).toHaveTextContent("null");
  });

  it("allows setting card data", async () => {
    render(
      <CheckoutProvider>
        <TestConsumer />
      </CheckoutProvider>,
    );
    await userEvent.click(screen.getByText("Set Card"));
    expect(screen.getByTestId("card-data")).toHaveTextContent(
      "4111111111111111",
    );
  });

  it("allows clearing card data", async () => {
    render(
      <CheckoutProvider>
        <TestConsumer />
      </CheckoutProvider>,
    );
    await userEvent.click(screen.getByText("Set Card"));
    expect(screen.getByTestId("card-data")).toHaveTextContent(
      "4111111111111111",
    );
    await userEvent.click(screen.getByText("Clear Card"));
    expect(screen.getByTestId("card-data")).toHaveTextContent("null");
  });

  it("throws error when used outside provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    expect(() => render(<TestConsumer />)).toThrow(
      "Must use inside CheckoutProvider",
    );
    consoleSpy.mockRestore();
  });
});
