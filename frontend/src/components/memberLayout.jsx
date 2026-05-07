import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Home, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MemberLayout = ({ children, activeNav = "home", onNavChange }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/homepage" },
    { id: "announcements", label: "Announcements", icon: Bell, path: "/member/announcements" },
    { id: "profile", label: "Profile", icon: User, path: "/member/profile" },
  ];

  const handleNavClick = (id, path) => {
    if (onNavChange) onNavChange(id);
    setMobileMenuOpen(false);
    if (path) navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
    setMemberDropdownOpen(false);
    navigate("/login");
  };

  const handleMemberNavClick = (path) => {
    setMemberDropdownOpen(false);
    if (path) navigate(path);
  };

  return (
    <div className="min-h-screen bg-white font-montserrat">
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 w-80 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
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

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/LOGO.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-[#3B4B89] text-sm">CJCRSG PHILS. INC.</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="w-64 h-full bg-[#F0F0F5] p-6 pt-16"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center mb-6">
                <img
                  src="/profile.jpg"
                  alt="Profile"
                  className="w-20 h-20 rounded-full mb-3 border-4 border-[#3B4B89] object-cover"
                />
                <p className="font-semibold text-[#3B4B89] text-sm text-center">Ven Andrei M. Manacop</p>
                <span className="text-xs text-gray-500 mt-1">CJC Member</span>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                        activeNav === item.id
                          ? "bg-[#3B4B89] text-white"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Full-Width Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/LOGO.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10" />
          <span className="font-bold text-[#3B4B89] text-base md:text-lg">CJCRSG PHILS. INC.</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
            className="flex items-center gap-2 bg-[#3B4B89] text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d3a6a] transition"
          >
            <img src="/profile.jpg" alt="" className="w-6 h-6 rounded-full object-cover" />
            <span className="hidden sm:inline">Member</span>
            <ChevronDown size={16} />
          </button>

          <AnimatePresence>
            {memberDropdownOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800 text-sm">Ven Andrei M. Manacop</p>
                  <p className="text-xs text-gray-500">CJC Member</p>
                </div>
                <button
                  onClick={() => handleMemberNavClick("/member/profile")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => handleMemberNavClick("/member/announcements")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  View Announcements
                </button>
                <button
                  onClick={() => handleMemberNavClick("/homepage")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Visit Homepage
                </button>
                <hr className="my-2" />
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[22%] lg:w-[25%] fixed left-0 top-16 bottom-0 bg-[#F0F0F5] p-6 border-r border-gray-200 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-3 border-4 border-[#3B4B89] object-cover"
          />
          <p className="font-semibold text-[#3B4B89] text-lg">Ven Andrei M. Manacop</p>
          <span className="text-sm text-gray-500 mt-1">CJC Member</span>
        </div>

        <nav className="space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeNav === item.id
                    ? "bg-[#3B4B89] text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-[22%] lg:ml-[25%] mt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MemberLayout;