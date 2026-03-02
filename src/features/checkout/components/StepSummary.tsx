import { selectSelectedProduct } from "../../product/selectors";
import { processPayment, setStep } from "../checkoutSlice";
import { formatPrice } from "../../product/utils/formatPrice";
import styles from "./StepSummary.module.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useCheckoutContext } from "../CheckoutContext";

const BASE_FEE = 2000;
const DELIVERY_FEE = 5000;

const StepSummary = () => {
  const dispatch = useAppDispatch();
  const { cardData } = useCheckoutContext();
  const product = useAppSelector(selectSelectedProduct);
  const checkoutStatus = useAppSelector((state) => state.checkout.status);
  const isProcessing = checkoutStatus === "processing";

  if (!product || !cardData) return null;

  const total = product.price + BASE_FEE + DELIVERY_FEE;

  const handleConfirm = () => {
    if (isProcessing) return;
    dispatch(
      processPayment({
        fullNumber: cardData.fullNumber,
        expiry: cardData.expiry,
        cvv: cardData.cvv,
        cardHolder: cardData.cardHolder,
      }),
    );
  };

  return (
    <div className={styles.summary}>
      <h2 className={styles.summary__title}>Order Summary</h2>

      <div className={styles.summary__row}>
        <span>{product.name}</span>
        <span>{formatPrice(product.price)}</span>
      </div>

      <div className={styles.summary__row}>
        <span>Base Fee</span>
        <span>{formatPrice(BASE_FEE)}</span>
      </div>

      <div className={styles.summary__row}>
        <span>Delivery</span>
        <span>{formatPrice(DELIVERY_FEE)}</span>
      </div>

      <div className={styles.summary__total}>
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <div className={styles.summary__actions}>
        <button
          onClick={() => dispatch(setStep(1))}
          className={styles.summary__back}
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className={styles.summary__button}
          disabled={isProcessing}
          aria-busy={isProcessing}
        >
          {isProcessing ? "Processing..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};

export default StepSummary;
