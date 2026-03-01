import { Routes, Route } from "react-router-dom";
import ProductPage from "./features/product/ProductPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
    </Routes>
  );
}

export default App;
