import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { FaArrowLeft } from "react-icons/fa";

export const VerifyReset = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // SAFE: fallback to localStorage (fix refresh issue)
  const email =
    location.state?.email || localStorage.getItem("resetEmail");

    const handleVerify = async (e) => {
      e.preventDefault();
  
      if (!email) {
        alert("Session expired. Please restart password reset.");
        navigate("/messageReset");
        return;
      }
  
      try {
        setLoading(true);
  
        await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, {
          email,
          otp,
        });
  
        // clear stored email after success
        localStorage.removeItem("resetEmail");
  
        navigate("/resetPassword", { state: { email } });
  
      } catch (err) {
        console.error(err);
        alert("Invalid or expired OTP");
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-200 to-indigo-900 px-4">

        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4 font-montserrat">

          {/* HEADER */}
          <div className="flex items-center gap-24">
            <Link to="/messageReset">
              <FaArrowLeft />
            </Link>
            <h1 className="text-xl font-bold text-blue-900">Verify OTP</h1>
          </div>

          <div className="text-center">
            <p>Enter the OTP sent to your email</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleVerify} className="space-y-4">

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-2 border rounded-md text-center tracking-widest"
              maxLength={6}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>
        </div>

        {/* FOOTER LINKS */}
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