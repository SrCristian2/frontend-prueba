import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "./ProductCard";

describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    description: "A great product description",
    price: 50000,
    stock: 10,
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders product name", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders product description", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(
      screen.getByText("A great product description"),
    ).toBeInTheDocument();
  });

  it("renders formatted price", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it("renders stock count", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(screen.getByText("Stock: 10")).toBeInTheDocument();
  });

  it("renders pay button", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(
      screen.getByRole("button", { name: /pay with credit card/i }),
    ).toBeInTheDocument();
  });

  it("calls onSelect when button is clicked", async () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    await userEvent.click(
      screen.getByRole("button", { name: /pay with credit card/i }),
    );
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it("disables button when stock is 0", () => {
    const outOfStock = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStock} onSelect={mockOnSelect} />);
    expect(
      screen.getByRole("button", { name: /pay with credit card/i }),
    ).toBeDisabled();
  });

  it("enables button when stock is > 0", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(
      screen.getByRole("button", { name: /pay with credit card/i }),
    ).not.toBeDisabled();
  });

  it("renders product image when imageUrl is provided", () => {
    const productWithImage = {
      ...mockProduct,
      imageUrl: "https://example.com/img.jpg",
    };
    render(
      <ProductCard product={productWithImage} onSelect={mockOnSelect} />,
    );
    const img = screen.getByAltText("Test Product");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });

  it("does not render image when imageUrl is absent", () => {
    render(<ProductCard product={mockProduct} onSelect={mockOnSelect} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not render image when imageUrl is http (non-HTTPS)", () => {
    const productWithHttp = {
      ...mockProduct,
      imageUrl: "http://malicious.com/tracking.gif",
    };
    render(
      <ProductCard product={productWithHttp} onSelect={mockOnSelect} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not render image when imageUrl is a javascript: URI", () => {
    const productWithJS = {
      ...mockProduct,
      imageUrl: "javascript:alert(1)",
    };
    render(
      <ProductCard product={productWithJS} onSelect={mockOnSelect} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("sets referrerPolicy on images", () => {
    const productWithImage = {
      ...mockProduct,
      imageUrl: "https://example.com/img.jpg",
    };
    render(
      <ProductCard product={productWithImage} onSelect={mockOnSelect} />,
    );
    const img = screen.getByAltText("Test Product");
    expect(img).toHaveAttribute("referrerpolicy", "no-referrer");
  });
});
