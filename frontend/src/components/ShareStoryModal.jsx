import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ShareStoryModal = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState("");
  const [testimony, setTestimony] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (!fullName.trim() || !testimony.trim()) return;
    console.log({ fullName, testimony });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#3D4F8E] px-7 py-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#b0bcdf] tracking-[1.2px] uppercase mb-1 font-montserrat">
                  CJCRSG PHILS. INC.
                </p>
                <h2 className="text-xl font-bold text-white font-montserrat">
                  Share My Story
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/[0.12] flex items-center justify-center hover:bg-white/20 transition"
              >
                <X size={16} className="text-white" strokeWidth={2.2} />
              </button>
            </div>

            <div className="px-7 py-6">
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 font-montserrat">
                How has God worked in your life? Share your testimony and encourage the community.
              </p>

              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-[#3D4F8E] mb-1.5 tracking-[0.3px] font-montserrat">
                  Full Name <span className="text-[#e24b4a]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full font-montserrat text-[13.5px] px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:border-[#3D4F8E] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div className="mb-2">
                <label className="block text-[12px] font-semibold text-[#3D4F8E] mb-1 tracking-[0.3px] font-montserrat">
                  How has God moved in your life? <span className="text-[#e24b4a]">*</span>
                </label>
                <p className="text-[11.5px] text-gray-400 mb-1.5 font-montserrat">
                  Share your experience of His goodness, healing, provision, or transformation.
                </p>
                <textarea
                  placeholder="Write your testimony here..."
                  rows={5}
                  maxLength={500}
                  value={testimony}
                  onChange={(e) => setTestimony(e.target.value)}
                  className="w-full font-montserrat text-[13.5px] px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:border-[#3D4F8E] focus:bg-white focus:outline-none resize-none leading-relaxed transition"
                />
                <p className="text-[11.5px] text-gray-400 text-right mt-1 font-montserrat">
                  {testimony.length}/500 characters
                </p>
              </div>

              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 font-montserrat text-[13px] font-semibold py-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-[2] font-montserrat text-[13px] font-bold py-2.5 rounded-lg border-none bg-[#3D4F8E] text-white hover:bg-[#2e3c6e] transition cursor-pointer"
                >
                  Submit Story
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareStoryModal;
