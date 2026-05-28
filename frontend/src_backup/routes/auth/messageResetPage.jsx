import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { FaArrowLeft } from "react-icons/fa";

export const MessageReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/forgotpassword`, {
        email,
      });

      // ✅ SAVE EMAIL FOR OTP FLOW (IMPORTANT FIX)
      localStorage.setItem("resetEmail", email);

      // go to OTP page
      navigate("/verifyReset", { state: { email } });

    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
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
            <Link to="/login">
              <FaArrowLeft />
            </Link>
            <h1 className="text-xl font-bold text-blue-900">
              Reset your password
            </h1>
          </div>

          <div className="text-center">
            Enter your <span className="text-blue-800">email address</span> to reset your password
          </div>

          <form onSubmit={handleSendOTP} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition cursor-pointer"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

        </div>

        <div className="absolute bottom-4 text-white text-sm flex flex-wrap justify-center gap-4 font-montserrat">
          <span>Connect with us:</span>
          <a href="https://www.facebook.com/cjcrsg" target="_blank" className="underline hover:text-blue-300">
            Facebook
          </a>
          <a href="mailto:cjcrsgonline@gmail.com" className="underline hover:text-blue-300">
            Gmail
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
};