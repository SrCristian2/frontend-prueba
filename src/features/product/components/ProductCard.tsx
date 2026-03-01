import type { Product } from "../type";
import styles from "./ProductCard.module.scss";

interface Props {
  product: Product;
  onSelect: () => void;
}

const ProductCard = ({ product, onSelect }: Props) => {
  return (
    <div className={styles.card}>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.card__image}
        />
      )}

      <h3 className={styles.card__name}>{product.name}</h3>
      <p className={styles.card__description}>{product.description}</p>
      <p className={styles.card__price}>${product.price}</p>
      <p className={styles.card__stock}>Stock: {product.stock}</p>

      <button
        className={styles.card__button}
        disabled={product.stock === 0}
        onClick={onSelect}
      >
        Pay with Credit Card
      </button>
    </div>
  );
};

export default ProductCard;
