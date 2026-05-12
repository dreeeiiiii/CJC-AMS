import { useState, useRef, useEffect } from "react";
import { Pencil, X, Download, User, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import MemberLayout from "../../components/MemberLayout";

const MemberProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  // Updated state to include middleName
  const [userData, setUserData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    id: "N/A",
    profileImage: null,
    role: "MEMBER"
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const initialData = {
        firstName: parsed.firstName || "",
        middleName: parsed.middleName || "",
        lastName: parsed.lastName || "",
        email: parsed.email || "",
        contact: parsed.contactNo || parsed.contact || "", // Sync with backend key 'contactNo'
        address: parsed.address || "",
        id: parsed.id || "CJC-2024-001",
        profileImage: parsed.profileImage || null,
        role: parsed.role || "MEMBER"
      };
      setUserData(initialData);
      setEditForm(initialData);
    }
  }, []);

  const handleEditToggle = () => {
    setEditForm({ ...userData });
    setEditMode(!editMode);
    setSaved(false);
  };

  const handleSave = () => {
    const updatedUser = { ...editForm };
    setUserData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    setSaved(true);
    setTimeout(() => {
      setEditMode(false);
      setSaved(false);
    }, 1200);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...userData, profileImage: reader.result };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${userData.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Construct display name with initial if middleName exists
  const formattedFullName = `${userData.firstName}${userData.middleName ? ` ${userData.middleName.charAt(0)}.` : ''} ${userData.lastName}`;
  const qrValue = `${userData.id}|${userData.email}|${formattedFullName}`;

  return (
    <MemberLayout activeNav="profile">
      <div className="px-6 md:px-12 py-10 md:py-14 bg-white min-h-[calc(100vh-4rem)] font-montserrat">
        <h1 className="text-3xl md:text-4xl font-bold text-[#3B4B89] text-center mb-10">
          My Profile
        </h1>

        <div className="max-w-4xl mx-auto bg-[#F0F2F9] border border-gray-400 rounded-[30px] p-6 md:p-10 lg:p-12 relative">
          <button
            onClick={handleEditToggle}
            className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition shadow-sm z-10"
          >
            <Pencil size={14} />
            Edit
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
            <div 
                className="relative group cursor-pointer w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#3B4B89] overflow-hidden bg-white shadow-lg"
                onClick={() => fileInputRef.current.click()}
            >
              {userData.profileImage ? (
                <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <User size={48} />
                </div>
              )}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${userData.profileImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <Camera className="text-white" size={24} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-[#3B4B89]">{formattedFullName}</h2>
              <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">
                {userData.role === "ADMIN" ? "Administrator" : "CJC Member"}
              </p>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-[#5A6BA8] font-medium">First Name</p>
                  <p className="text-[#3B4B89] font-bold">{userData.firstName}</p>
                </div>
                <div>
                  <p className="text-[#5A6BA8] font-medium">Middle Name</p>
                  <p className="text-[#3B4B89] font-bold">{userData.middleName || "—"}</p>
                </div>
                <div>
                  <p className="text-[#5A6BA8] font-medium">Last Name</p>
                  <p className="text-[#3B4B89] font-bold">{userData.lastName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1 space-y-5">
              <h3 className="text-lg font-semibold text-[#3B4B89] mb-4">Contact Details</h3>
              <div className="space-y-4">
                {[
                  { label: "Email Address", value: userData.email },
                  { label: "Contact Number", value: userData.contact },
                  { label: "Address", value: userData.address },
                  { label: "Member ID", value: userData.id }
                ].map((item, index) => (
                  <div key={index}>
                    <p className="text-[#5A6BA8] text-sm font-medium mb-1">{item.label}</p>
                    <p className="text-[#3B4B89] text-base font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center border border-gray-100">
                <h3 className="text-sm font-semibold text-[#3B4B89] mb-4">Your QR Code</h3>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <QRCodeSVG
                    ref={qrRef}
                    value={qrValue}
                    size={160}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition shadow-sm"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editMode && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleEditToggle}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
                <button onClick={handleEditToggle} className="p-1 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {[
                  { label: "First Name", key: "firstName" },
                  { label: "Middle Name", key: "middleName" },
                  { label: "Last Name", key: "lastName" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Contact Number", key: "contact" },
                  { label: "Address", key: "address" }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type || "text"}
                      value={editForm[field.key]}
                      onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSave}
                  className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${
                    saved ? "bg-green-500" : "bg-[#3B4B89] hover:bg-[#2d3a6a]"
                  }`}
                >
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MemberLayout>
  );
};

export default MemberProfile;