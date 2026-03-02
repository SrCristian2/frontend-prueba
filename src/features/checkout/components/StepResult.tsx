import { useSelector } from "react-redux";
import { selectCheckoutStatus } from "../selectors";
import { resetCheckout } from "../checkoutSlice";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { useCheckoutContext } from "../CheckoutContext";
import { fetchProducts } from "../../product/productSlice";
import { clearPersistedState } from "../../../store/persistence";
import { clearFormDraft } from "./StepCardDelivery";
import styles from "./StepResult.module.scss";

const StepResult = () => {
  const status = useSelector(selectCheckoutStatus);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { setCardData } = useCheckoutContext();

  const handleBack = () => {
    dispatch(resetCheckout());
    clearPersistedState();
    clearFormDraft();
    setCardData(null);
    dispatch(fetchProducts());
    navigate("/");
  };

  return (
    <div className={styles.result}>
      {status === "success" && (
        <>
          <h2
            className={`${styles.result__title} ${styles["result__title--success"]}`}
          >
            Payment Approved
          </h2>
          <p className={styles.result__description}>
            Your order was successful.
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <h2
            className={`${styles.result__title} ${styles["result__title--failed"]}`}
          >
            Payment Declined
          </h2>
          <p className={styles.result__description}>Please try again.</p>
        </>
      )}

      {status !== "success" && status !== "failed" && (
        <h2 className={styles.result__title}>Something went wrong</h2>
      )}

      <button onClick={handleBack} className={styles.result__button}>
        Back to Store
      </button>
    </div>
  );
};

export default StepResult;
