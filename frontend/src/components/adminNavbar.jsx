import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [adminDropdownOpen, setadminDropdownOpen] = useState(false);
  const [userData] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return { fullName: "Admin", role: "ADMIN" };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  const handleLogout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    navigate("/login");
    setLoading(false);
  };

  const handleNavigate = async (path) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    navigate(path);
    setLoading(false);
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 w-80 text-center font-montserrat"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 shadow-md bg-white font-montserrat">
        <div className="flex justify-between items-center px-4 py-4 md:px-8 md:text-lg lg:text-xl text-[#364687]">
          {/* Logo */}
          <div className="flex flex-row justify-start items-center gap-4">
            <img src="/LOGO.png" alt="CJCRSG LOGO" className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]" />
            <p className="hidden lg:block font-montserrat font-bold text-sm md:text-lg">CJCRSG PHILS. INC.</p>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-[#364687] transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#364687] transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#364687] transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>

          {/* Navigation Links - Desktop */}
          <ul className="hidden md:flex gap-8 lg:gap-16 font-montserrat items-center">
            <li className="relative group">
              <button onClick={() => handleNavigate("/admin/home")}>
                Dashboard
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
            <li className="relative group">
              <button onClick={() => handleNavigate("/admin/announcements")}>
                Announcements
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
            <li className="relative group">
              <button onClick={() => handleNavigate("/admin/members")}>
                Members
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
            <li className="relative group">
              <button onClick={() => handleNavigate("/admin/visitors")}>
                Visitors
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#364687] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>

            <li className="relative">
              <button
                onClick={() => setadminDropdownOpen(!adminDropdownOpen)}
                className="flex items-center gap-2 bg-[#364687] text-white px-3 py-1.5 md:py-2 rounded-lg text-sm font-medium hover:bg-[#2d3a6a] transition"
              >
                <span className="hidden sm:inline capitalize">{userData.role.toLowerCase()}</span>
                <ChevronDown size={16} className={`transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {adminDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setadminDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs font-semibold text-gray-400 uppercase">Account</p>
                      </div>
                      <button
                        onClick={() => {
                          setadminDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100"
            >
              <ul className="flex flex-col py-4 px-4 space-y-4 font-montserrat text-[#364687]">
                <li>
                  <button
                    onClick={() => {
                      handleNavigate("/admin/home");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 hover:text-blue-600 transition"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavigate("/admin/announcements");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 hover:text-blue-600 transition"
                  >
                    Announcements
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavigate("/admin/members");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 hover:text-blue-600 transition"
                  >
                    Members
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavigate("/admin/visitors");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 hover:text-blue-600 transition"
                  >
                    Visitors
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-2 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all w-full justify-center"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-[16px] text-red-600">Logout</span>
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default AdminNavbar;
