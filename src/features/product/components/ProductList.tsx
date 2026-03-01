import type { Product } from "../type";
import ProductCard from "./ProductCard";
import styles from "./ProductList.module.scss";

interface Props {
  products: Product[];
  onSelect: (product: Product) => void;
}

const ProductList = ({ products, onSelect }: Props) => {
  return (
    <div className={styles.list}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={() => onSelect(product)}
        />
      ))}
    </div>
  );
};

export default ProductList;
