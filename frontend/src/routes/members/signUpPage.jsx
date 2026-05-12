import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "", // Optional
    email: "",
    password: "",
    contact: "",
    address: "",
    gender: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
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
    setMessage("");
    setIsError(false);

    // Prepare data to match your updated Backend logic
    const submissionData = {
      type: "member",
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      contactNo: formData.contact,
      address: formData.address,
      gender: formData.gender,
      email: formData.email,
      password: formData.password,
    };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/auth/register`, submissionData);

      setMessage("Account created successfully! Redirecting to login...");
      setIsError(false);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("❌ Signup Error:", error);
      setIsError(true);
      setMessage(error.response?.data?.message || error.response?.data?.error || "Error connecting to server");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-400 to-indigo-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-15 lg:gap-30 max-w-screen-xl p-6 font-montserrat">
          <div className="text-white flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Create your account</h1>
            <p className="text-xl lg:text-2xl mb-6">
              To become a part of our community, please sign up using your personal information.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row for First and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
                />
              </div>

              {/* Middle Name - Optional */}
              <input
                type="text"
                name="middleName"
                placeholder="Middle Name (Optional)"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />

              <input
                type="text"
                name="contact"
                placeholder="Contact No."
                required
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                required
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
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-400"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
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

              {message && (
                <p
                  className={`mt-4 text-center font-semibold ${
                    isError ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {message}
                </p>
              )}

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