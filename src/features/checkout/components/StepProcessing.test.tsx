import { render, screen } from "@testing-library/react";
import StepProcessing from "./StepProcessing";

describe("StepProcessing", () => {
  it("renders processing message", () => {
    render(<StepProcessing />);
    expect(screen.getByText(/processing payment/i)).toBeInTheDocument();
  });

  it("renders spinner element", () => {
    const { container } = render(<StepProcessing />);
    const spinner = container.querySelector("[class*='spinner']");
    expect(spinner).toBeInTheDocument();
  });
});
