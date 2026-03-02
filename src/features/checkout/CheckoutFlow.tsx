import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { selectCheckoutStep } from "./selectors";
import { selectSelectedProduct } from "../product/selectors";

import StepCardDelivery from "./components/StepCardDelivery";
import StepSummary from "./components/StepSummary";
import StepProcessing from "./components/StepProcessing";
import StepResult from "./components/StepResult";

import styles from "./CheckoutFlow.module.scss";
import { CheckoutProvider } from "./CheckoutContext";

const CheckoutFlow = () => {
  const step = useSelector(selectCheckoutStep);
  const selectedProduct = useSelector(selectSelectedProduct);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProduct) {
      navigate("/");
    }
  }, [selectedProduct, navigate]);

  return (
    <CheckoutProvider>
      <div className={styles.container}>
        {step === 1 && <StepCardDelivery />}
        {step === 2 && <StepSummary />}
        {step === 3 && <StepProcessing />}
        {step === 4 && <StepResult />}
      </div>
    </CheckoutProvider>
  );
};

export default CheckoutFlow;
