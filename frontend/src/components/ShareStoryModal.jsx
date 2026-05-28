import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitTestimony } from "../api/testimonyApi";
import Modal from "./Modal";

const ShareStoryModal = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState("");
  const [testimony, setTestimony] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!testimony.trim()) {
      newErrors.testimony = "Please share your testimony";
    } else if (testimony.trim().length > 500) {
      newErrors.testimony = "Maximum 500 characters allowed";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitTestimony(fullName.trim(), testimony.trim());
      setFullName("");
      setTestimony("");
      setErrors({});
      onClose();
      showToast("Your testimony has been submitted for admin approval.", "success");
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to submit testimony";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold font-montserrat"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              backgroundColor: toastType === "success" ? "#16a34a" : "#dc2626",
              color: "#fff",
            }}
          >
            {toastType === "success" ? <CheckCircle size={18} /> : <X size={18} />}
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={isOpen} onClose={onClose}>
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
              onChange={(e) => { setFullName(e.target.value); setErrors((prev) => ({ ...prev, fullName: "" })); }}
              className={`w-full font-montserrat text-[13.5px] px-3.5 py-2.5 border rounded-lg text-gray-800 bg-gray-50 focus:outline-none transition ${
                errors.fullName ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#3D4F8E] focus:bg-white"
              }`}
            />
            {errors.fullName && (
              <p className="text-[11.5px] text-red-500 mt-1 font-montserrat">{errors.fullName}</p>
            )}
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
              onChange={(e) => { setTestimony(e.target.value); setErrors((prev) => ({ ...prev, testimony: "" })); }}
              className={`w-full font-montserrat text-[13.5px] px-3.5 py-2.5 border rounded-lg text-gray-800 bg-gray-50 focus:outline-none resize-none leading-relaxed transition ${
                errors.testimony ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#3D4F8E] focus:bg-white"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.testimony ? (
                <p className="text-[11.5px] text-red-500 font-montserrat">{errors.testimony}</p>
              ) : (
                <span />
              )}
              <p className="text-[11.5px] text-gray-400 font-montserrat">
                {testimony.length}/500 characters
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 mt-6">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 font-montserrat text-[13px] font-semibold py-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] font-montserrat text-[13px] font-bold py-2.5 rounded-lg border-none bg-[#3D4F8E] text-white hover:bg-[#2e3c6e] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Story"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareStoryModal;
