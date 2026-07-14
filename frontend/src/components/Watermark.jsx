import React, { useEffect, useRef, useState } from "react";
import styles from "./Watermark.module.css";

const Watermark = () => {
  const containerRef = useRef(null);
  const watermarkRef = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const speed = 1.2; // Pixels per frame

  useEffect(() => {
    let animationFrameId;
    let x = Math.random() * 200 + 50;
    let y = Math.random() * 150 + 50;
    let dx = speed * (Math.random() > 0.5 ? 1 : -1);
    let dy = speed * (Math.random() > 0.5 ? 1 : -1);

    const updatePosition = () => {
      const container = containerRef.current;
      const watermark = watermarkRef.current;

      if (container && watermark) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;
        const wWidth = watermark.clientWidth || 180;
        const wHeight = watermark.clientHeight || 24;

        x += dx;
        y += dy;

        // Bounce off left/right
        if (x <= 0) {
          x = 0;
          dx = -dx;
        } else if (x + wWidth >= cWidth) {
          x = cWidth - wWidth;
          dx = -dx;
        }

        // Bounce off top/bottom
        if (y <= 0) {
          y = 0;
          dy = -dy;
        } else if (y + wHeight >= cHeight) {
          y = cHeight - wHeight;
          dy = -dy;
        }

        setPos({ x, y });
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Display date and dummy student details
  const studentId = "student_dev_gvcc_2026";
  const sessionIp = "192.168.42.105";

  return (
    <div ref={containerRef} className={styles.watermarkContainer}>
      <div
        ref={watermarkRef}
        className={styles.watermark}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      >
        <span>{studentId}</span>
        <span className={styles.ipBadge}>{sessionIp}</span>
      </div>
    </div>
  );
};

export default Watermark;
