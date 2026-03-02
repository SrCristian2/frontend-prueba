import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductList from "./ProductList";

describe("ProductList", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product A",
      description: "Desc A",
      price: 10000,
      stock: 5,
    },
    {
      id: "2",
      name: "Product B",
      description: "Desc B",
      price: 20000,
      stock: 0,
    },
    {
      id: "3",
      name: "Product C",
      description: "Desc C",
      price: 30000,
      stock: 3,
    },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders all products", () => {
    render(<ProductList products={mockProducts} onSelect={mockOnSelect} />);
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
    expect(screen.getByText("Product C")).toBeInTheDocument();
  });

  it("renders correct number of pay buttons", () => {
    render(<ProductList products={mockProducts} onSelect={mockOnSelect} />);
    const buttons = screen.getAllByRole("button", {
      name: /pay with credit card/i,
    });
    expect(buttons).toHaveLength(3);
  });

  it("calls onSelect with the correct product", async () => {
    render(<ProductList products={mockProducts} onSelect={mockOnSelect} />);
    const buttons = screen.getAllByRole("button", {
      name: /pay with credit card/i,
    });
    await userEvent.click(buttons[0]);
    expect(mockOnSelect).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("renders empty list without errors", () => {
    render(<ProductList products={[]} onSelect={mockOnSelect} />);
    expect(
      screen.queryByRole("button", { name: /pay with credit card/i }),
    ).not.toBeInTheDocument();
  });
});
