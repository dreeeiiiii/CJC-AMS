import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, XCircle, CheckCircle, X } from "lucide-react"; 
import axios from "axios";

// 💡 Helper function for backend/network errors
const getFriendlyErrorMessage = (err) => {
    if (err.message === "Network Error" || !err.response) {
        return "Oops! We're having trouble reaching our servers right now. Please check your internet connection.";
    }
    const status = err.response?.status;
    const backendMessage = err.response?.data?.message || "";

    switch (status) {
        case 400:
            return "It looks like some information is missing or invalid. Please check your details and try again.";
        case 409:
            return "An account with this email already exists. Would you like to log in instead?";
        case 500:
        case 502:
        case 503:
            return "Something went wrong on our end. We're looking into it, please try again a little later!";
        default:
            return backendMessage || "Something unexpected happened while trying to create your account. Please try again.";
    }
};

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "", // Optional
    email: "",
    password: "",
    contactNo: "", // 👈 Changed from 'contact' to 'contactNo'
    address: "",
    gender: "",
  });

  // 🔄 Replaced message strings with a robust popup state
  const [popup, setPopup] = useState({ show: false, message: "", isError: false });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenderChange = (value) => {
    const formatted = value.charAt(0).toUpperCase() + value.slice(1);
    setFormData((prev) => ({
      ...prev,
      gender: prev.gender === formatted ? "" : formatted,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🛑 1. Check for empty required fields! (Updated contact to contactNo)
    const { firstName, lastName, contactNo, address, gender, email, password } = formData;
    if (!firstName.trim() || !lastName.trim() || !contactNo.trim() || !address.trim() || !gender || !email.trim() || !password.trim()) {
        setPopup({
            show: true,
            isError: true,
            message: "It looks like you missed a spot! Please fill in all required fields (Middle Name is optional)."
        });
        return; // Stop the function here
    }

    setPopup({ show: false, message: "", isError: false });

    const submissionData = {
      type: "member",
      ...formData
    };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/auth/register`, submissionData);

      // 🎉 Show success popup
      setPopup({
          show: true,
          isError: false,
          message: "Account created successfully! Redirecting you to login..."
      });

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (error) {
      console.error("❌ Signup Error:", error);
      // 🚨 Show friendly error popup
      setPopup({
          show: true,
          isError: true,
          message: getFriendlyErrorMessage(error)
      });
    }
  };

  const closePopup = () => setPopup({ show: false, message: "", isError: false });

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-400 to-indigo-900 relative">
        
        {/* 🚨 POPUP MODAL (Handles both Error and Success) 🚨 */}
        {popup.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-in-up flex flex-col items-center text-center relative">
                    
                    {popup.isError && (
                        <button 
                            onClick={closePopup}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X size={20} />
                        </button>
                    )}
                    
                    {/* Dynamic Icon based on success/error */}
                    {popup.isError ? (
                        <XCircle className="text-red-400 w-16 h-16 mb-4" />
                    ) : (
                        <CheckCircle className="text-green-400 w-16 h-16 mb-4" />
                    )}

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {popup.isError ? "Signup Issue" : "Welcome!"}
                    </h3>
                    <p className="text-gray-600 mb-6">{popup.message}</p>
                    
                    {/* Only show the 'Got it' button for errors (success auto-redirects) */}
                    {popup.isError && (
                        <button 
                            onClick={closePopup}
                            className="w-full bg-indigo-500 text-white font-semibold py-2 rounded-xl hover:bg-indigo-600 transition"
                        >
                            Got it
                        </button>
                    )}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-15 lg:gap-30 max-w-screen-xl p-6 font-montserrat">
          <div className="text-white flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Create your account</h1>
            <p className="text-xl lg:text-2xl mb-6">
              To become a part of our community, please sign up using your personal information.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
                />
              </div>

              <input
                type="text"
                name="middleName"
                placeholder="Middle Name (Optional)"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />

              {/* 👇 Updated to use contactNo */}
              <input
                type="text"
                name="contactNo" 
                placeholder="Contact No."
                value={formData.contactNo} 
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />
              
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />

              <div className="flex space-x-8">
                <span className="text-md font-medium pl-4">Gender:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gender === "Female"}
                    onChange={() => handleGenderChange("female")}
                    className="accent-indigo-400"
                  />
                  <span>Female</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gender === "Male"}
                    onChange={() => handleGenderChange("male")}
                    className="accent-indigo-400"
                  />
                  <span>Male</span>
                </label>
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition-colors"
              >
                Sign Up
              </button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};