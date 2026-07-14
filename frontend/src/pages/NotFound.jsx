import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./NotFound.module.css";

const NotFound = () => {
  const [countdown, setCountdown] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={styles.notFoundWrapper}
    >
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Lost in Space?</h1>
        <p className={styles.description}>
          The lecture notes or page you are looking for doesn't exist or has been archived.
        </p>
        <div className={styles.redirectBox}>
          Redirecting to the Dashboard in <span className={styles.count}>{countdown}</span> seconds...
          <div className={styles.countdownBarWrapper}>
            <div
              className={styles.countdownBar}
              style={{ width: `${(countdown / 8) * 100}%` }}
            />
          </div>
        </div>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
