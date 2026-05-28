import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { FaArrowLeft } from "react-icons/fa";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email || localStorage.getItem("resetEmail");

    const handleReset = async (e) => {
      e.preventDefault();
  
      if (!email) {
        alert("Session expired. Please restart reset process.");
        navigate("/messageReset");
        return;
      }
  
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
  
      try {
        setLoading(true);
  
        await axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password`, {
          email,
          password,
        });
  
        localStorage.removeItem("resetEmail");
  
        alert("Password reset successful!");
        navigate("/login");
  
      } catch (err) {
        console.error(err);
        alert("Failed to reset password");
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-200 to-indigo-900 px-4">

        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4 font-montserrat">

          <div className="flex items-center gap-12">
            <Link to="/verifyReset">
              <FaArrowLeft />
            </Link>
            <h1 className="text-xl font-bold text-blue-900">
              Reset your password
            </h1>
          </div>

          <div className="text-center">
            <p>Enter your new password</p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">

            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

        </div>

      </div>

      <Footer />
    </>
  );
};