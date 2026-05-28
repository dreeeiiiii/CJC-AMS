import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Container */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 bg-[#3B4B89]/10 rounded-full flex items-center justify-center mx-auto">
            <Search size={48} className="text-[#3B4B89] opacity-20 absolute" />
            <span className="text-6xl font-bold text-[#3B4B89]">404</span>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            The link you followed may be broken, or the page may have been removed. 
            Don't worry, you can find your way back home below.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition shadow-sm bg-white"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#3B4B89] text-white font-medium rounded-xl hover:bg-[#2d3a6a] transition shadow-md shadow-[#3B4B89]/20"
          >
            <Home size={18} />
            Return Home
          </button>
        </motion.div>

        {/* Branding Footer */}
        <motion.div 
          className="mt-16 opacity-40 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.6 }}
        >
          <img src="/LOGO.png" alt="Logo" className="w-12 h-12 grayscale" />
          <p className="text-xs font-semibold text-[#3B4B89]">
            Church of Jesus Christ the Risen Son of God Phils. Inc.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPage;