import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";

interface ApprovalPendingModalProps {
  show: boolean;
  onClose: () => void;
  autoCloseDelay?: number; // in milliseconds
}

export function ApprovalPendingModal({ show, onClose, autoCloseDelay = 4000 }: ApprovalPendingModalProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);

    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Wait for fade-out animation
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [show, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md bg-gradient-to-br from-[#0b0b0f] to-[#1a1a1f] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50"
          >
            <div className="text-center space-y-6">
              {/* Icon with pulse animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-blue-500/20 rounded-full p-4 border border-blue-500/30">
                    <Clock className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <h2 className="text-2xl font-bold text-white">Profile Submitted!</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Your profile has been sent for approval. Our team will review it and get back to you soon.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-white/40 pt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>You'll receive an email once approved</span>
                </div>
              </motion.div>

              {/* Auto-close indicator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full origin-left"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
