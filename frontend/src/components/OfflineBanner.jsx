import React, { useEffect, useState } from "react";
import styles from "./OfflineBanner.module.css";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className={styles.offlineBanner}>
      <span className={styles.icon}>🔌</span>
      <div className={styles.content}>
        <strong>You are offline</strong>
        <span>Check your internet connection. Some features may not work.</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
