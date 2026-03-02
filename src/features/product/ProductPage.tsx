import { useEffect } from "react";
import { fetchProducts, selectProduct } from "./productSlice";
import { selectProducts, selectProductStatus } from "./selectors";
import ProductList from "./components/ProductList";
import styles from "./ProductPage.module.scss";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductStatus);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className={styles.page}>
      <h1 className={styles.page__title}>Products store</h1>

      {status === "loading" && (
        <div className={styles.page__loading}>
          <div className={styles.page__spinner}></div>
          <p className={styles.page__loadingText}>Loading products...</p>
        </div>
      )}

      {status === "error" && (
        <div className={styles.page__error}>
          <div className={styles.page__icon}>⚠️</div>
          <h2 className={styles.page__errorTitle}>
            Oops, something went wrong
          </h2>
          <p className={styles.page__errorText}>
            We couldn't load the products. Please try again later.
          </p>
          <button
            className={styles.page__button}
            onClick={() => dispatch(fetchProducts())}
          >
            Retry
          </button>
        </div>
      )}

      {status === "idle" && products.length === 0 && (
        <div className={styles.page__empty}>
          <div className={styles.page__icon}>📦</div>
          <h2 className={styles.page__emptyTitle}>No products available</h2>
          <p className={styles.page__emptyText}>
            It seems there are no products available at the moment. Please come
            back later!
          </p>
        </div>
      )}

      {status === "idle" && products.length > 0 && (
        <div className={styles.page__grid}>
          <ProductList
            products={products}
            onSelect={(product) => {
              dispatch(selectProduct(product));
              navigate("/checkout");
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductPage;
