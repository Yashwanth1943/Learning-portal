import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>GVCC Academy</span>
          <p className={styles.desc}>
            An immersive platform engineered to deliver the best learning experience for modern software engineers.
          </p>
        </div>
        <div className={styles.copy}>
          &copy; {new Date().getFullYear()} GVCC Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
