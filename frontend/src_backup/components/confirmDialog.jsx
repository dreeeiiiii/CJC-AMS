import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import Modal from "./modal";

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBg: "bg-red-600 hover:bg-red-700",
  },
  default: {
    icon: AlertTriangle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBg: "bg-[#364687] hover:bg-[#2d3a6a]",
  },
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  const config = variantConfig[variant] || variantConfig.default;
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} size="sm">
      <div className="text-center px-6 py-6">
        <div
          className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <Icon size={24} className={config.iconColor} />
        </div>
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-white transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2 ${config.confirmBg}`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? `${confirmText}...` : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
