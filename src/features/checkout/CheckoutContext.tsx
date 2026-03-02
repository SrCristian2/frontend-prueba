import { createContext, useContext, useState } from "react";

interface SensitiveCardData {
  fullNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

const CheckoutContext = createContext<{
  cardData: SensitiveCardData | null;
  setCardData: (data: SensitiveCardData | null) => void;
} | null>(null);

export const CheckoutProvider = ({ children }: any) => {
  const [cardData, setCardData] = useState<SensitiveCardData | null>(null);

  return (
    <CheckoutContext.Provider value={{ cardData, setCardData }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error("Must use inside CheckoutProvider");
  return context;
};
