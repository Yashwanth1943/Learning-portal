import React from "react";
import styles from "./Skeleton.module.css";

const Skeleton = ({ type = "card", count = 1 }) => {
  const renderSkeleton = (index) => {
    if (type === "card") {
      return (
        <div key={index} className={styles.cardSkeleton}>
          <div className={`${styles.shimmer} ${styles.thumbnail}`} />
          <div className={styles.content}>
            <div className={`${styles.shimmer} ${styles.titleLine}`} />
            <div className={`${styles.shimmer} ${styles.descLine}`} />
            <div className={`${styles.shimmer} ${styles.metaLine}`} />
          </div>
        </div>
      );
    }

    if (type === "player") {
      return (
        <div key={index} className={styles.playerSkeleton}>
          <div className={`${styles.shimmer} ${styles.videoScreen}`} />
          <div className={styles.playerContent}>
            <div className={`${styles.shimmer} ${styles.playerTitle}`} />
            <div className={`${styles.shimmer} ${styles.playerDesc}`} />
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`${styles.shimmer} ${styles.text}`} />
    );
  };

  return (
    <>
      {Array(count)
        .fill(null)
        .map((_, idx) => renderSkeleton(idx))}
    </>
  );
};

export default Skeleton;
