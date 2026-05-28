import { useState, useRef, useEffect } from "react";
import { Pencil, X, Download, User, Camera, Check, Loader2, Calendar, Shield, IdCard, Eye, EyeOff, Lock, ContactRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AdminNavbar from "../../components/adminNavbar";
import Modal from "../../components/Modal";
import Footer from "../../components/footer";
import { fetchMyProfile, updateMyProfile, changePassword } from "../../api/userApi";

const AdminProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    gender: "",
    status: "",
    group: "",
    joinDate: "",
    id: "N/A",
    profileImage: null,
    role: "ADMIN"
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const [saved, setSaved] = useState(false);

  const [pendingImage, setPendingImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const serverUser = await fetchMyProfile();
        const profileData = {
          firstName: serverUser.firstName || "",
          middleName: serverUser.middleName || "",
          lastName: serverUser.lastName || "",
          email: serverUser.email || "",
          contact: serverUser.contactNo || serverUser.contact || "",
          address: serverUser.address || "",
          gender: serverUser.gender || "",
          status: serverUser.status || "",
          group: serverUser.group || "",
          joinDate: serverUser.joinDate || serverUser.createdAt || "",
          id: serverUser.id || "N/A",
          profileImage: serverUser.profileImage || null,
          role: serverUser.role || "ADMIN"
        };
        setUserData(profileData);
        setEditForm(profileData);
        localStorage.setItem("user", JSON.stringify(serverUser));
      } catch {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const initialData = {
            firstName: parsed.firstName || "",
            middleName: parsed.middleName || "",
            lastName: parsed.lastName || "",
            email: parsed.email || "",
            contact: parsed.contactNo || parsed.contact || "",
            address: parsed.address || "",
            gender: parsed.gender || "",
            status: parsed.status || "",
            group: parsed.group || "",
            joinDate: parsed.joinDate || parsed.createdAt || "",
            id: parsed.id || "N/A",
            profileImage: parsed.profileImage || null,
            role: parsed.role || "ADMIN"
          };
          setUserData(initialData);
          setEditForm(initialData);
        }
      }
    };

    loadProfile();
  }, []);

  const handleEditToggle = () => {
    setEditForm({ ...userData });
    setEditMode(!editMode);
    setSaved(false);
    setEmailError("");
  };

  const handleSave = async () => {
    setEmailError("");

    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      setEmailError("First name, last name, and email are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (editForm.contact.trim() && !/^0\d{10}$/.test(editForm.contact.trim())) {
      setEmailError("Please enter a valid 11-digit mobile number");
      return;
    }

    const prevUserData = { ...userData };

    const mergedData = {
      firstName: editForm.firstName,
      middleName: editForm.middleName,
      lastName: editForm.lastName,
      email: editForm.email,
      contactNo: editForm.contact,
      address: editForm.address,
      joinDate: editForm.joinDate || undefined,
    };

    // Optimistic UI updates
    const optimisticData = { ...userData, ...editForm };
    setUserData(optimisticData);
    setEditForm(optimisticData);
    window.dispatchEvent(new Event("userDataUpdated"));

    setSaved(true);
    setTimeout(() => {
      setEditMode(false);
      setSaved(false);
    }, 1200);

    try {
      const serverUser = await updateMyProfile(mergedData);
      const syncedData = {
        ...optimisticData,
        firstName: serverUser.firstName || optimisticData.firstName,
        middleName: serverUser.middleName || optimisticData.middleName,
        lastName: serverUser.lastName || optimisticData.lastName,
        email: serverUser.email || optimisticData.email,
        contact: serverUser.contactNo || serverUser.contact || optimisticData.contact,
        address: serverUser.address || optimisticData.address,
        profileImage: serverUser.profileImage || optimisticData.profileImage,
      };
      setUserData(syncedData);
      setEditForm(syncedData);
      localStorage.setItem("user", JSON.stringify(serverUser));
      window.dispatchEvent(new Event("userDataUpdated"));
    } catch (err) {
      console.error("Failed to save profile fields:", err);
      setUserData(prevUserData);
      setEditForm(prevUserData);
      window.dispatchEvent(new Event("userDataUpdated"));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile) return;
    const prevImage = userData.profileImage;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/upload-profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      const newImageUrl = data.imageUrl;

      const updatedProfileState = {
        ...userData,
        profileImage: newImageUrl
      };

      setUserData(updatedProfileState);
      setEditForm(updatedProfileState);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, profileImage: newImageUrl }));

      setPendingImage(null);
      setSelectedFile(null);
      window.dispatchEvent(new Event("userDataUpdated"));

    } catch (error) {
      console.error("Error uploading profile image:", error);
      setUserData(prev => ({ ...prev, profileImage: prevImage }));
      setEditForm(prev => ({ ...prev, profileImage: prevImage }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelImage = () => {
    setPendingImage(null);
    setSelectedFile(null);
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

  const formattedFullName = `${userData.firstName}${userData.middleName ? ` ${userData.middleName.charAt(0)}.` : ''} ${userData.lastName}`;
  const qrValue = `${userData.id}|${userData.email}|${formattedFullName}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-montserrat">
      <AdminNavbar />

      <div className="flex-1 px-4 sm:px-6 md:px-12 py-6 sm:py-10 md:py-14">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#364687] text-center mb-6 sm:mb-10">
          Admin Profile
        </h1>

        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-[30px] p-4 sm:p-6 md:p-10 lg:p-12 shadow-sm relative">


          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div
                className="relative group cursor-pointer w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#364687] overflow-hidden bg-white shadow-lg"
                onClick={() => fileInputRef.current.click()}
              >
                {(userData.profileImage || pendingImage) ? (
                  <img src={pendingImage || userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <User size={48} />
                  </div>
                )}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${(userData.profileImage || pendingImage) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <Camera className="text-white" size={24} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              {pendingImage && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveImage}
                    disabled={isUploading}
                    className="px-4 py-1.5 bg-[#364687] text-white text-xs font-medium rounded-lg hover:bg-[#2d3a6a] transition flex items-center gap-1 disabled:opacity-70"
                  >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {isUploading ? "Saving..." : "Save Photo"}
                  </button>
                  <button
                    onClick={handleCancelImage}
                    disabled={isUploading}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-70"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-[#364687]">{formattedFullName}</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-[#364687]/10 text-[#364687] text-xs font-semibold uppercase tracking-wider rounded-full">
                <Shield size={12} className="inline mr-1" />
                Administrator
              </span>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">First Name</p>
                  <p className="text-[#364687] font-bold">{userData.firstName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Middle Name</p>
                  <p className="text-[#364687] font-bold">{userData.middleName || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Last Name</p>
                  <p className="text-[#364687] font-bold">{userData.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Gender</p>
                  <p className="text-[#364687] font-bold">{userData.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${userData.status === "Active" || userData.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {userData.status || "Active"}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Group</p>
                  <p className="text-[#364687] font-bold">{userData.group || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Contact Details */}
              <div className="flex-1 space-y-5">
                <h3 className="text-lg font-semibold text-[#364687] flex items-center gap-2">
                  <IdCard size={18} />
                  Contact Details
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Email Address", value: userData.email },
                    { label: "Contact Number", value: userData.contact },
                    { label: "Address", value: userData.address },
                    { label: "Member ID", value: `CJC-${String(userData.id).padStart(4, '0')}` }
                  ].map((item, index) => (
                    <div key={index}>
                      <p className="text-gray-500 text-sm font-medium mb-1">{item.label}</p>
                      <p className="text-[#364687] text-base font-bold">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Info & QR Code */}
              <div className="lg:w-72 flex-shrink-0 space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-[#364687] flex items-center gap-2 mb-4">
                    <ContactRound size={16} />
                    Account Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Member Since</p>
                      <p className="text-[#364687] font-semibold">{formatDate(userData.joinDate)}</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={handleEditToggle}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-100 min-h-[44px] transition shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-100 min-h-[44px] transition shadow-sm"
                      >
                        <Lock size={14} />
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center border border-gray-100">
                  <h3 className="text-sm font-semibold text-[#364687] mb-4">Your QR Code</h3>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <QRCodeSVG
                      ref={qrRef}
                      value={qrValue}
                      size={140}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition shadow-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <Modal isOpen={editMode} onClose={handleEditToggle} title="Edit Profile">
        <div className="p-6 space-y-4">
          {emailError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {emailError}
            </div>
          )}
          {[
            { label: "First Name", key: "firstName" },
            { label: "Middle Name", key: "middleName" },
            { label: "Last Name", key: "lastName" },
            { label: "Email", key: "email", type: "email" },
            { label: "Contact Number", key: "contact" },
            { label: "Address", key: "address" },
            { label: "Member Since", key: "joinDate", type: "date" }
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type || "text"}
                value={editForm[field.key]}
                onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#364687] focus:border-transparent outline-none"
              />
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg text-sm font-medium text-white transition ${
              saved ? "bg-green-500" : "bg-[#364687] hover:bg-[#2d3a6a]"
            }`}
          >
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showChangePassword}
        onClose={() => { setShowChangePassword(false); setPasswordError(""); setPasswordSuccess(""); setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" }); }}
        title="Change Password"
      >
        <div className="p-6 space-y-5">
          {passwordError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              {passwordSuccess}
            </div>
          )}

          {[
            { label: "Current Password", key: "currentPassword", showKey: "current" },
            { label: "New Password", key: "newPassword", showKey: "new" },
            { label: "Confirm New Password", key: "confirmNewPassword", showKey: "confirm" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type={showPassword[field.showKey] ? "text" : "password"}
                  placeholder={field.label}
                  value={passwordForm[field.key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#364687] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, [field.showKey]: !showPassword[field.showKey] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword[field.showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center">
          <button
            onClick={() => { setShowChangePassword(false); setPasswordError(""); setPasswordSuccess(""); setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" }); }}
            className="w-full sm:w-auto px-5 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setPasswordError("");
              setPasswordSuccess("");
              if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
                setPasswordError("All fields are required");
                return;
              }
              if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
                setPasswordError("New passwords do not match");
                return;
              }
              if (passwordForm.newPassword.length < 6) {
                setPasswordError("New password must be at least 6 characters");
                return;
              }
              setIsChangingPassword(true);
              try {
                await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                setPasswordSuccess("Password changed successfully");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                setTimeout(() => {
                  setShowChangePassword(false);
                  setPasswordSuccess("");
                }, 1500);
              } catch (err) {
                setPasswordError(err.response?.data?.message || "Failed to change password");
              } finally {
                setIsChangingPassword(false);
              }
            }}
            disabled={isChangingPassword}
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#364687] hover:bg-[#2d3a6a] transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : null}
            {isChangingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProfile;
