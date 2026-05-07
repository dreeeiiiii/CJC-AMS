import { useState, useRef } from "react";
import { Pencil, X, Download, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import MemberLayout from "../../components/MemberLayout";

const MemberProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const qrRef = useRef(null);

  const [userData, setUserData] = useState({
    firstName: "Ven Andrei",
    lastName: "Manacop",
    email: "venandreimanacop02@gmail.com",
    contact: "09123456789",
    address: "Natatas, Tanauan, Batangas",
    id: "CJC-2024-001",
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const [saved, setSaved] = useState(false);

  const handleEditToggle = () => {
    setEditForm({ ...userData });
    setEditMode(!editMode);
    setSaved(false);
  };

  const handleSave = () => {
    setUserData({ ...editForm });
    setSaved(true);
    setTimeout(() => {
      setEditMode(false);
      setSaved(false);
    }, 1200);
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

  const fullName = `${userData.firstName} ${userData.lastName}`;
  const qrValue = `${userData.id}|${userData.email}|${userData.firstName} ${userData.lastName}`;

  return (
    <MemberLayout activeNav="profile">
      <div className="px-6 md:px-12 py-10 md:py-14 bg-white min-h-[calc(100vh-4rem)]">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#3B4B89] text-center mb-10">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto bg-[#F0F2F9] border border-gray-400 rounded-[30px] p-6 md:p-10 lg:p-12 relative">
          {/* Edit Button */}
          <button
            onClick={handleEditToggle}
            className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition shadow-sm"
          >
            <Pencil size={14} />
            Edit
          </button>

          {/* Avatar + Name */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#3B4B89] flex items-center justify-center flex-shrink-0">
              <User size={48} className="text-white" />
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-[#3B4B89]">{fullName}</h2>
              <p className="text-sm text-gray-500 mt-1">CJC Member</p>

              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-[#5A6BA8] font-medium">First Name</p>
                  <p className="text-[#3B4B89] font-bold">{userData.firstName}</p>
                </div>
                <div>
                  <p className="text-[#5A6BA8] font-medium">Last Name</p>
                  <p className="text-[#3B4B89] font-bold">{userData.lastName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details + QR Code */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Contact Details */}
            <div className="flex-1 space-y-5">
              <h3 className="text-lg font-semibold text-[#3B4B89] mb-4">Contact Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[#5A6BA8] text-sm font-medium mb-1">Email Address</p>
                  <p className="text-[#3B4B89] text-base font-bold">{userData.email}</p>
                </div>

                <div>
                  <p className="text-[#5A6BA8] text-sm font-medium mb-1">Contact Number</p>
                  <p className="text-[#3B4B89] text-base font-bold">{userData.contact}</p>
                </div>

                <div>
                  <p className="text-[#5A6BA8] text-sm font-medium mb-1">Address</p>
                  <p className="text-[#3B4B89] text-base font-bold">{userData.address}</p>
                </div>

                <div>
                  <p className="text-[#5A6BA8] text-sm font-medium mb-1">Member ID</p>
                  <p className="text-[#3B4B89] text-base font-bold">{userData.id}</p>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center">
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

      {/* Edit Modal */}
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
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
                <button onClick={handleEditToggle} className="p-1 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Footer */}
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