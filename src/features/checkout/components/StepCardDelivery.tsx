import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { checkoutSchema } from "../validation/checkoutSchema";
import { detectCardBrand } from "../utils/detectCardBrand";
import { formatCardNumber } from "../utils/formatCardNumber";
import {
  setCustomer,
  setDelivery,
  setPaymentMeta,
  setStep,
} from "../checkoutSlice";

import visaLogo from "../../../assets/cards/visa.svg";
import mastercardLogo from "../../../assets/cards/mastercard.svg";
import styles from "./StepCardDelivery.module.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useCheckoutContext } from "../CheckoutContext";
import { selectCheckoutData } from "../selectors";

interface FormValues {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

const DRAFT_KEY = "checkout_form_draft";

interface FormDraft {
  cardHolder: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

function loadDraft(): FormDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: FormDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

export function clearFormDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

const StepCardDelivery = () => {
  const dispatch = useAppDispatch();
  const { setCardData } = useCheckoutContext();
  const checkoutData = useAppSelector(selectCheckoutData);
  const draft = loadDraft();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      cardHolder: draft?.cardHolder ?? checkoutData.customer?.name ?? "",
      email: draft?.email ?? checkoutData.customer?.email ?? "",
      address: draft?.address ?? checkoutData.delivery?.address ?? "",
      city: draft?.city ?? checkoutData.delivery?.city ?? "",
      country: draft?.country ?? checkoutData.delivery?.country ?? "Colombia",
    },
  });

  const formValues = watch();

  useEffect(() => {
    saveDraft({
      cardHolder: formValues.cardHolder ?? "",
      email: formValues.email ?? "",
      address: formValues.address ?? "",
      city: formValues.city ?? "",
      country: formValues.country ?? "",
    });
  }, [
    formValues.cardHolder,
    formValues.email,
    formValues.address,
    formValues.city,
    formValues.country,
  ]);

  const cardNumber = watch("cardNumber") || "";
  const brand = detectCardBrand(cardNumber);

  const onSubmit = (data: FormValues) => {
    const cleaned = data.cardNumber.replace(/\s/g, "");
    const brandDetected = detectCardBrand(cleaned);

    dispatch(
      setPaymentMeta({
        brand: brandDetected,
        last4: cleaned.slice(-4),
        expiry: data.expiry,
      }),
    );

    dispatch(
      setCustomer({
        name: data.cardHolder,
        email: data.email,
      }),
    );
    dispatch(
      setDelivery({
        address: data.address,
        city: data.city,
        country: data.country,
      }),
    );

    setCardData({
      fullNumber: cleaned,
      expiry: data.expiry,
      cvv: data.cvv,
      cardHolder: data.cardHolder,
    });
    clearFormDraft();
    dispatch(setStep(2));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.form__title}>Payment Information</h2>

      <div className={styles.form__group}>
        <div className={styles.form__input_wrapper}>
          <input
            className={styles.form__input}
            placeholder="Card Number"
            {...register("cardNumber")}
            onChange={(e) =>
              setValue("cardNumber", formatCardNumber(e.target.value))
            }
          />

          {brand === "visa" && (
            <img
              src={visaLogo}
              alt="Visa"
              className={styles.form__input_logo}
            />
          )}

          {brand === "mastercard" && (
            <img
              src={mastercardLogo}
              alt="Mastercard"
              className={styles.form__input_logo}
            />
          )}
        </div>

        {errors.cardNumber && (
          <p className={styles.form__error}>{errors.cardNumber.message}</p>
        )}
      </div>

      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="MM/YY"
          {...register("expiry")}
        />
        {errors.expiry && (
          <p className={styles.form__error}>{errors.expiry.message}</p>
        )}
      </div>

      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="CVV"
          {...register("cvv")}
        />
        {errors.cvv && (
          <p className={styles.form__error}>{errors.cvv.message}</p>
        )}
      </div>

      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="Card Holder Name"
          {...register("cardHolder")}
        />
        {errors.cardHolder && (
          <p className={styles.form__error}>{errors.cardHolder.message}</p>
        )}
      </div>
      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="Email"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className={styles.form__error}>{errors.email.message}</p>
        )}
      </div>

      <h3 className={styles.form__section_title}>Delivery Information</h3>

      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="Address"
          {...register("address")}
        />
        {errors.address && (
          <p className={styles.form__error}>{errors.address.message}</p>
        )}
      </div>

      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="City"
          {...register("city")}
        />
        {errors.city && (
          <p className={styles.form__error}>{errors.city.message}</p>
        )}
      </div>

      <div className={styles.form__group}>
        <input
          className={styles.form__input}
          placeholder="Country"
          {...register("country")}
        />
        {errors.country && (
          <p className={styles.form__error}>{errors.country.message}</p>
        )}
      </div>

      <button type="submit" className={styles.form__button}>
        Pay Now
      </button>
    </form>
  );
};

export default StepCardDelivery;
