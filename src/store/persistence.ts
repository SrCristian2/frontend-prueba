import type { Product } from "../features/product/type";

const STORAGE_KEY = "app_state";

interface PersistedState {
  checkout: {
    step: 1 | 2 | 3 | 4;
    status: "idle" | "processing" | "success" | "failed";
    customer: { name: string; email: string } | null;
    delivery: { address: string; city: string; country: string } | null;
    paymentMeta: { brand: string | null; last4: string; expiry: string } | null;
  };
  product: {
    selectedProduct: Product | null;
  };
}

export function loadPersistedState():
  | {
      checkout: PersistedState["checkout"];
      product: { items: []; status: "idle"; selectedProduct: Product | null };
    }
  | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") return undefined;
    if (!parsed.checkout || typeof parsed.checkout !== "object") return undefined;

    const validSteps = [1, 2, 3, 4];
    const validStatuses = ["idle", "processing", "success", "failed"];
    if (!validSteps.includes(parsed.checkout.step)) return undefined;
    if (!validStatuses.includes(parsed.checkout.status)) return undefined;

    return {
      checkout: parsed.checkout as PersistedState["checkout"],
      product: {
        items: [] as [],
        status: "idle" as const,
        selectedProduct: parsed.product?.selectedProduct ?? null,
      },
    };
  } catch {
    return undefined;
  }
}

export function saveState(state: {
  checkout: PersistedState["checkout"];
  product: { selectedProduct: Product | null };
}): void {
  try {
    const toPersist: PersistedState = {
      checkout: {
        step: state.checkout.step,
        status: state.checkout.status,
        customer: state.checkout.customer,
        delivery: state.checkout.delivery,
        paymentMeta: state.checkout.paymentMeta,
      },
      product: {
        selectedProduct: state.product.selectedProduct,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch {}
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
