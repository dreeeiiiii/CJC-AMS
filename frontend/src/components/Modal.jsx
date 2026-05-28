import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

const Modal = ({ isOpen, onClose, children, title, size = "md" }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const trapFocus = useCallback((e) => {
    if (!contentRef.current) return;
    const focusable = contentRef.current.querySelectorAll(focusableSelector);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
      trapFocus(e);
    };
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      requestAnimationFrame(() => {
        const first = contentRef.current?.querySelector(focusableSelector);
        if (first) first.focus();
      });
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      if (isOpen) previousFocusRef.current?.focus();
    };
  }, [isOpen, trapFocus]);

  const handleDragEnd = (_, info) => {
    if (info.offset.y > 80 || info.velocity.y > 200) onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            className={`bg-white rounded-2xl shadow-xl w-full ${sizeMap[size] || sizeMap.md} overflow-hidden`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 id="modal-title" className="text-lg font-semibold text-gray-800">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            )}
            <div className="max-h-[85vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
