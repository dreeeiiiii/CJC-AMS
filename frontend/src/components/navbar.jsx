import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Handle navigation
  const handleNavigate = async (path) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Tiny delay for smooth UX
      navigate(path);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setLoading(true);
      // Simulate async logout (API call, etc.)
      await new Promise((resolve) => setTimeout(resolve, 300)); 
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setShowLogoutConfirm(false);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        variant="danger"
        loading={loading}
      />

      <nav className="sticky top-0 z-40 shadow-md bg-white">
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 text-[#364687]">
          {/* Logo Section */}
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src="/LOGO.png"
              alt="CJCRSG LOGO"
              className="w-10 h-10 md:w-[50px] md:h-[50px]"
            />
            <p className="font-montserrat font-bold text-sm md:text-base lg:text-xl">CJCRSG PHILS. INC.</p>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-10 lg:gap-16 font-montserrat text-md lg:text-xl items-center">
            <li className="relative group">
              <button
                onClick={() => handleNavigate("/home")}
                className="relative group"
              >
                Home
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>

            {isLoggedIn ? (
              <>
                <li className="relative group">
                  <button
                    onClick={() => handleNavigate("/member/home")}
                    className="relative group"
                  >
                    Dashboard
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>

                <li className="relative group">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="relative group text-red-600 hover:text-red-700"
                  >
                    Logout
                    <span className="absolute left-0 -bottom-1 w-0 h-[3px] bg-red-600 transition-all duration-300 group-hover:w-full rounded"></span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="relative group">
                  <button
                    onClick={() => handleNavigate("/login")}
                    className="relative group"
                  >
                    Log In
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
                <li className="relative group">
                  <button
                    onClick={() => handleNavigate("/signup")}
                    className="relative group"
                  >
                    Sign Up
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="flex flex-col py-4 px-4 gap-4 font-montserrat text-base text-[#364687]">
                <li>
                  <button
                    onClick={() => { handleNavigate("/home"); setMobileMenuOpen(false); }}
                    className="block w-full text-left py-2"
                  >
                    Home
                  </button>
                </li>

                {isLoggedIn ? (
                  <>
                    <li>
                      <button
                        onClick={() => { handleNavigate("/member/home"); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-2"
                      >
                        Dashboard
                      </button>
                    </li>

                    <li>
                      <button
                        onClick={() => { setShowLogoutConfirm(true); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-2 text-red-600"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        onClick={() => { handleNavigate("/login"); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-2"
                      >
                        Log In
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { handleNavigate("/signup"); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-2"
                      >
                        Sign Up
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
