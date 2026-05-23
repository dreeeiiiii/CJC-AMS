import Navbar from "../../components/navbar";
import Footer from '../../components/footer';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Eye, EyeOff, XCircle, X } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";

// 💡 Helper function for backend/network errors
const getFriendlyErrorMessage = (err, isGoogleAuth = false) => {
    if (err.message === "Network Error" || !err.response) {
        return "Oops! We're having trouble reaching our servers right now. Please check your internet connection.";
    }
    const status = err.response?.status;
    switch (status) {
        case 400:
        case 401:
            return "We couldn't find a match for that email and password. Please double-check and try again!";
        case 403:
            return "Your account is currently locked or disabled. Please contact support.";
        case 404:
            return "It looks like an account with that email doesn't exist yet. Would you like to sign up?";
        case 429:
            return "You've had a few too many login attempts. Please take a quick break and try again later!";
        case 500:
        case 502:
        case 503:
            return "Something went wrong on our end. We're looking into it, please try again a little later!";
        default:
            if (isGoogleAuth) return "We had a little trouble verifying your Google account. Please give it another try!";
            return "Something unexpected happened while trying to log you in. Please try again.";
    }
};

export const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorPopup, setErrorPopup] = useState({ show: false, message: "" });
    const navigate = useNavigate();

    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    

    const handleAuthSuccess = (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        if (user?.role === "ADMIN") {
            navigate('/admin/home');
        } else {
            navigate('/member');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // 🛑 1. Check for empty fields first!
        if (!email.trim() || !password.trim()) {
            setErrorPopup({
                show: true,
                message: "It looks like you missed a spot! Please fill in both your email and password."
            });
            return; // Stop the function here so it doesn't call the backend
        }

        setErrorPopup({ show: false, message: "" }); 

        try {
            const response = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
            const { token, user } = response.data;
            handleAuthSuccess(token, user);
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            setErrorPopup({ 
                show: true, 
                message: getFriendlyErrorMessage(err) 
            });
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setErrorPopup({ show: false, message: "" });
        try {
            const res = await axios.post(`${BACKEND_URL}/auth/google`, {
                token: credentialResponse.credential,
            });
            const { token, user } = res.data;
            handleAuthSuccess(token, user);
        } catch (err) {
            console.error("Google login error:", err.response?.data || err.message);
            setErrorPopup({ 
                show: true, 
                message: getFriendlyErrorMessage(err, true) 
            });
        }
    };

    const handleGoogleError = () => {
        setErrorPopup({ 
            show: true, 
            message: "We couldn't complete the Google sign-in. Please try again or use your email." 
        });
    };

    const closePopup = () => setErrorPopup({ show: false, message: "" });

    return (
        <>
            <Navbar/>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-l from-indigo-400 to-indigo-900 relative">
                
                {/* 🚨 ERROR POPUP MODAL 🚨 */}
                {errorPopup.show && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-in-up flex flex-col items-center text-center relative">
                            <button 
                                onClick={closePopup}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                            
                            <XCircle className="text-red-400 w-16 h-16 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Login Issue</h3>
                            <p className="text-gray-600 mb-6">{errorPopup.message}</p>
                            
                            <button 
                                onClick={closePopup}
                                className="w-full bg-indigo-500 text-white font-semibold py-2 rounded-xl hover:bg-indigo-600 transition"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-screen-xl p-6 font-montserrat">
                    <div className="text-white flex flex-col justify-center items-center text-center">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Enter your account</h1>
                        <p className="text-xl lg:text-2xl mb-6">Please log in using your personal information to stay connected with us.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-md w-full max-w-lg mx-auto">
                        <h2 className="text-2xl font-semibold text-center mb-6">Log In</h2>
                        {/* Added noValidate to stop default browser tooltips */}
                        <form onSubmit={handleLogin} noValidate className="space-y-4 text-sm lg:text-md">

                            <div className='w-full flex justify-center'>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size='large'
                                    theme='outline'
                                />
                            </div>

                            <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300">
                                <p className="mx-4 mb-0 text-center font-semibold text-gray-500 text-xs">OR</p>
                            </div>

                            {/* Removed the 'required' attribute here */}
                            <input 
                                type="email" 
                                placeholder="Email" 
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <div className="relative">
                                {/* Removed the 'required' attribute here */}
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password" 
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                                    {showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}
                                </button>
                            </div>

                            <div className="text-right text-sm lg:text-md">
                                <Link to="/messageReset" className="text-indigo-500 hover:underline">Forgot password?</Link>
                            </div>

                            <button type="submit" className="w-full bg-indigo-400 text-white text-lg font-semibold py-2 rounded-xl hover:bg-indigo-500 transition cursor-pointer shadow-md">
                                Log In
                            </button>

                            <p className="text-sm lg:text-md text-center">
                                Don't have an account?
                                <Link to="/Signup" className="text-indigo-600 hover:underline px-1 font-medium">Sign up</Link> 
                            </p>
                        </form>
                    </div>
                </div> 
            </div>
            <Footer />
        </>
    );
};