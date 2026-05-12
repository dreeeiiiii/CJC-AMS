import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Home, Bell, User, Camera, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MemberLayout = ({ children, activeNav = "home", onNavChange }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userData, setUserData] = useState({
    fullName: "Guest User",
    role: "VISITOR",
    profileImage: null
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Construct Full Name if the 'fullName' key isn't provided by the backend
        let nameToDisplay = parsedUser.fullName;
        
        if (!nameToDisplay && parsedUser.firstName) {
          const mInitial = parsedUser.middleName ? `${parsedUser.middleName.charAt(0)}.` : "";
          nameToDisplay = `${parsedUser.firstName} ${mInitial} ${parsedUser.lastName}`.replace(/\s+/g, ' ');
        }

        setUserData({
          fullName: nameToDisplay || "User",
          role: parsedUser.role || "VISITOR",
          profileImage: parsedUser.profileImage || null 
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        
        // 1. Update Layout State
        setUserData(prev => ({ ...prev, profileImage: newImage }));
        
        // 2. Update LocalStorage so other components (like Profile) see it
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, profileImage: newImage }));
      };
      reader.readAsDataURL(file);
    }
  };

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
    navigate("/login");
  };

  const displayRole = userData.role === "ADMIN" ? "Administrator" : 
                    userData.role === "MEMBER" ? "CJC Member" : "Visitor";

  const ProfileAvatar = ({ sizeClass }) => (
    <div 
      className={`relative group cursor-pointer overflow-hidden rounded-full border-4 border-[#3B4B89] shadow-md ${sizeClass}`}
      onClick={() => fileInputRef.current?.click()}
    >
      {userData.profileImage ? (
        <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <User className="text-gray-400 w-1/2 h-1/2" />
        </div>
      )}
      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${userData.profileImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        <Camera className="text-white w-1/3 h-1/3" />
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-montserrat">
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Cancel</button>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/LOGO.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10" />
          <span className="font-bold text-[#3B4B89] text-sm md:text-lg uppercase">CJCRSG PHILS. INC.</span>
        </div>

        <div className="relative flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
              className="flex items-center gap-2 bg-[#3B4B89] text-white px-3 py-1.5 md:py-2 rounded-lg text-sm font-medium hover:bg-[#2d3a6a] transition"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                {userData.profileImage ? (
                  <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-1 text-gray-500" />
                )}
              </div>
              <span className="hidden sm:inline capitalize">{userData.role.toLowerCase()}</span>
              <ChevronDown size={16} className={`transition-transform ${memberDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {memberDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMemberDropdownOpen(false)} />
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
                        setMemberDropdownOpen(false);
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
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)}>
            <motion.div className="w-64 h-full bg-[#F0F0F5] p-6 pt-20" initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center mb-8">
                <ProfileAvatar sizeClass="w-20 h-20 mb-3" />
                <p className="font-semibold text-[#3B4B89] text-sm text-center">{userData.fullName}</p>
                <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{displayRole}</span>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => handleNavClick(item.id, item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeNav === item.id ? "bg-[#3B4B89] text-white shadow-md" : "text-gray-600 hover:bg-white/50"}`}>
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex flex-col w-[22%] lg:w-[20%] fixed left-0 top-16 bottom-0 bg-[#F0F0F5] p-6 border-r border-gray-200">
        <div className="flex flex-col items-center text-center mb-10">
          <ProfileAvatar sizeClass="w-24 h-24 mb-4" />
          <p className="font-bold text-[#3B4B89] text-lg leading-tight">{userData.fullName}</p>
          <span className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-widest">{displayRole}</span>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleNavClick(item.id, item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeNav === item.id ? "bg-[#3B4B89] text-white shadow-md" : "text-gray-600 hover:bg-white/50"}`}>
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="md:ml-[22%] lg:ml-[20%] pt-16 min-h-screen transition-all">
        {children}
      </main>
    </div>
  );
};

export default MemberLayout;