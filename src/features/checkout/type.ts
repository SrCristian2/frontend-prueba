export interface CustomerData {
  name: string;
  email: string;
}

export interface DeliveryData {
  address: string;
  city: string;
  country: string;
}

export interface PaymentData {
  brand: "visa" | "mastercard" | null;
  last4: string;
  expiry: string;
}
