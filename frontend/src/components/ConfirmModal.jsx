import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ConfirmModal.module.css";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmStyle = "primary", // primary | danger
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.backdrop}>
          {/* Overlay background fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles.overlay}
          />
          
          {/* Modal box pop scale */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={styles.modalBox}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.header}>
              <h3>{title}</h3>
              <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.content}>
              {message && <p className={styles.message}>{message}</p>}
              {children}
            </div>
            
            <div className={styles.footer}>
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={confirmStyle === "danger" ? styles.btnDanger : "btn-primary"}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
