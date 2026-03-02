import styles from "./StepProcessing.module.scss";

const StepProcessing = () => {
  return (
    <div className={styles.processing}>
      <div className={styles.processing__spinner}></div>
      <h2 className={styles.processing__title}>Processing payment...</h2>
    </div>
  );
};

export default StepProcessing;
