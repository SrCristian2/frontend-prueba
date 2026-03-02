import { Routes, Route } from "react-router-dom";
import ProductPage from "./features/product/ProductPage";
import CheckoutFlow from "./features/checkout/CheckoutFlow";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/checkout" element={<CheckoutFlow />} />
    </Routes>
  );
}

export default App;
