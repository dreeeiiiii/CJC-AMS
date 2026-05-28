import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, ChevronDown, User, Menu, X, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "./confirmDialog";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  const [adminDropdownOpen, setadminDropdownOpen] = useState(false);
  const [userData] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          fullName: parsed.fullName || "Admin",
          role: parsed.role || "ADMIN",
          profileImage: parsed.profileImage || null,
        };
      } catch (e) {}
    }
    return { fullName: "Admin", role: "ADMIN", profileImage: null };
  });

  const activePath = location.pathname;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setShowBackToTop(scrolled);
      setNearFooter(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleLogout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("userDataUpdated"));
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

      {/* Navbar */}
      <nav className="sticky top-0 z-40 shadow-md bg-white font-montserrat">
          <div className="flex justify-between items-center px-4 py-4 md:px-6 lg:px-8 text-[#364687]">
          {/* Logo */}
          <div className="flex flex-row justify-start items-center gap-4">
            <img src="/LOGO.png" alt="CJCRSG LOGO" className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]" />
            <p className="hidden lg:block font-montserrat font-bold text-sm md:text-lg">CJCRSG PHILS. INC.</p>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#364687]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links - Desktop */}
          <ul className="hidden md:flex md:gap-4 lg:gap-8 xl:gap-12 font-montserrat items-center md:text-sm lg:text-base xl:text-lg">
            {[
              { label: "Dashboard", path: "/admin/home" },
              { label: "Attendance", path: "/admin/attendance" },
              { label: "Announcements", path: "/admin/announcements" },
              { label: "Members", path: "/admin/members" },
              { label: "Visitors", path: "/admin/visitors" },
            ].map((link) => (
              <li key={link.path} className="relative group">
                <button
                  onClick={() => handleNavigate(link.path)}
                  className={`px-2 flex items-center transition-colors ${
                    activePath === link.path ? "font-semibold" : ""
                  }`}
                >
                  {link.label}
                  <span className={`absolute left-0 -bottom-1 h-[2px] bg-[#364687] transition-all duration-300 ${
                    activePath === link.path ? "w-full" : "w-0 group-hover:w-full"
                  }`}></span>
                </button>
              </li>
            ))}
            <li className="relative">
              <button
                onClick={() => setadminDropdownOpen(!adminDropdownOpen)}
                className="flex items-center gap-2 bg-[#364687] text-white px-3 py-2.5 md:py-3 rounded-lg text-sm font-medium hover:bg-[#2d3a6a] transition"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                  {userData.profileImage ? (
                    <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-1 text-gray-500" />
                  )}
                </div>
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
                          navigate("/admin/profile");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} />
                        Profile
                      </button>
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
              {/* User Info Card — tap to go to Profile */}
              <button
                onClick={() => {
                  handleNavigate("/admin/profile");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-6 py-4 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition text-left"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  {userData.profileImage ? (
                    <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#364687] truncate">{userData.fullName}</p>
                  <span className="text-xs text-gray-500 capitalize">{userData.role.toLowerCase()}</span>
                </div>
                <ChevronDown size={14} className="text-gray-400 -rotate-90" />
              </button>

              <ul className="flex flex-col py-2 font-montserrat text-[#364687]">
                {[
                  { label: "Dashboard", path: "/admin/home" },
                  { label: "Attendance", path: "/admin/attendance" },
                  { label: "Announcements", path: "/admin/announcements" },
                  { label: "Members", path: "/admin/members" },
                  { label: "Visitors", path: "/admin/visitors" },
                ].map((link) => (
                  <li key={link.path} className="px-4">
                    <button
                      onClick={() => {
                        handleNavigate(link.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left py-4 px-3 rounded-lg transition text-sm ${
                        activePath === link.path
                          ? "bg-[#364687]/10 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {showBackToTop && !activePath.includes("/admin/profile") && (
        <button
          onClick={scrollToTop}
          className={`group fixed z-50 bg-[#4A558F] text-white rounded-full p-3 shadow-lg hover:bg-[#3a4575] transition-all duration-300 ${nearFooter ? 'bottom-24' : 'bottom-6'} right-6`}
          aria-label="Back to top"
        >
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Back to Top
          </span>
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default AdminNavbar;
