import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";

export const useScreenshotProtection = (enabled = true) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    // Prevent Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      addToast("Screenshot protection: Right-click is disabled on this portal.", "error");
    };

    // Prevent Dragging images/videos
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Prevent Copy/Cut/Paste
    const handleCopy = (e) => {
      e.preventDefault();
      addToast("Screenshot protection: Copying is disabled.", "error");
    };

    // Prevent standard shortcuts (F12, Ctrl+C, Ctrl+P, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e) => {
      // PrintScreen
      if (e.key === "PrintScreen") {
        setIsBlurred(true);
        navigator.clipboard.writeText(""); // Clear clipboard
        addToast("Screenshot protection: PrintScreen is disabled. Clipboard cleared.", "error");
      }

      // Check for Ctrl/Cmd keys
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta) {
        // Ctrl+P (Print), Ctrl+S (Save), Ctrl+C (Copy), Ctrl+U (View Source)
        if (["p", "s", "c", "u"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          addToast(`Screenshot protection: Action '${e.key.toUpperCase()}' is disabled.`, "error");
        }
        
        // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
        if (e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          addToast("Screenshot protection: DevTools shortcuts are disabled.", "error");
        }
      }

      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
        addToast("Screenshot protection: F12 DevTools is disabled.", "error");
      }
    };

    // Tab Blur Detection (Visibility / Window Focus)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        // Keep blurred for security or restore.
        // Restoring focus allows students to continue, but we can display a toast notification
        setIsBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      setIsBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsBlurred(false);
    };

    // Bind event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    // Apply basic CSS protection to body (disable text selection)
    const originalUserSelect = document.body.style.userSelect;
    const originalWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.body.style.userSelect = originalUserSelect;
      document.body.style.webkitUserSelect = originalWebkitUserSelect;
    };
  }, [enabled, addToast]);

  return { isBlurred };
};
