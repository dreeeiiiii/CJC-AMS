import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import AdminPage from './routes/admin/adminPage';
import { Signup } from './routes/members/signUpPage';
import { Login } from './routes/members/loginPage';
import { MessageReset } from './routes/auth/messageResetPage';
import { VerifyReset } from './routes/auth/verifyResetPage';
import { ResetPassword } from './routes/auth/resetPasswordPage';
import MemberPage from './routes/members/memberPage';
import MemberProfile from './routes/members/memberProfile';
import MemberAnnouncements from './routes/members/memberAnnouncement';
import Visitors from './routes/admin/adminVisitors';
import Announcements from './routes/admin/adminAnnouncement';
import Members from './routes/admin/adminMembers';
import Attendance from './routes/admin/adminAttendance';
import AdminProfile from './routes/admin/adminProfile';
import ProtectedRoute from './components/protectedRoutes'; 
import ErrorPage from './components/errorPage';
import { Target, Eye } from 'lucide-react';

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setLoaded(true); }, []);
  const copyPhone = () => {
    navigator.clipboard.writeText('09695925076');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <>
      <Navbar />
      <main className="flex justify-center items-center flex-col font-montserrat text-[#364687] font-bold">
        <div className="container flex justify-center items-center flex-col px-6 sm:px-10 lg:px-16 py-6 sm:py-8 lg:py-10 text-center">
          {/* Desktop/Tablet hero text */}
          <div className="hidden sm:flex sm:flex-col">
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-wider text-[#364687]/80">WELCOME TO</p>
            <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-2">CHURCH OF JESUS CHRIST</p>
            <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">THE RISEN SON OF GOD PHILS. INC.</p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-[#364687]/80 mt-2">ATTENDANCE AND MEMBER MANAGEMENT SYSTEM</p>
          </div>
          {/* Mobile hero text */}
          <div className={`sm:hidden transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-wider text-[#364687]/80">WELCOME TO</p>
            <p className="text-3xl font-bold tracking-widest">CJC-AMS</p>
          </div>
        </div>
        <div className="w-full max-w-5xl px-4 sm:px-8 lg:px-12">
          <div className="w-full aspect-[16/7] md:aspect-[32/11] lg:aspect-[16/4] rounded-xl overflow-hidden shadow-lg">
            <img src="/COVER.jpg" alt="CJCRSG Cover Photo" className="w-full h-full object-cover" />
          </div>
        </div>
      </main>

      {/* Service Times */}
      <div className="flex justify-center items-center flex-col text-[#364687] font-montserrat py-10 sm:py-12 lg:py-14 px-4">
        <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-[#364687]/60 tracking-wider mb-4 sm:mb-6">Service starts at</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="flex items-center justify-between sm:justify-center bg-[#f4f6ff] border border-[#d0d8f5] rounded-xl px-5 sm:px-8 py-3 sm:py-4 flex-1 transition-transform duration-200 hover:scale-105 hover:shadow-md">
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-[#364687] sm:hidden">Morning Service</span>
            <span className="text-sm sm:text-base lg:text-2xl font-semibold text-[#364687]">9:00 AM</span>
            <span className="hidden sm:inline text-xs text-[#6b7db3] ml-2">Morning Service</span>
          </div>
          <div className="flex items-center justify-between sm:justify-center bg-[#f4f6ff] border border-[#d0d8f5] rounded-xl px-5 sm:px-8 py-3 sm:py-4 flex-1 transition-transform duration-200 hover:scale-105 hover:shadow-md">
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-[#364687] sm:hidden">Youth Service</span>
            <span className="text-sm sm:text-base lg:text-2xl font-semibold text-[#364687]">2:00 PM</span>
            <span className="hidden sm:inline text-xs text-[#6b7db3] ml-2">Youth Service</span>
          </div>
        </div>
      </div>

      {/* Connect + Mission & Vision Section */}
      <div className="flex sm:flex-row flex-col bg-[#364687]/10 mb-3">
        {/* Connect Column */}
        <div className="flex-1 border-b sm:border-b-0 sm:border-r border-[#d0d8f5] px-6 sm:px-8 lg:px-10 py-8 lg:py-10">
          <h2 className="font-montserrat font-semibold text-sm sm:text-base lg:text-lg text-[#364687] mb-5">Connect with us:</h2>
          <div className="flex justify-center lg:justify-start gap-6 sm:gap-8 lg:gap-10">
            
            {/* Facebook Link */}
            <a 
              href="https://www.facebook.com/cjcrsg" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visit our Facebook Page"
              className="flex flex-col items-center gap-2 group select-none"
            >
              {/* Kept a stable wrapper size */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:opacity-80 group-active:translate-y-0 group-active:scale-95">
                <img src="/FACEBOOK.png" alt="facebook_icon" className="w-full h-full object-contain scale-[2.5] sm:scale-[2.8] lg:scale-[3]" />
              </div>
              <p className="font-montserrat text-[11px] sm:text-xs text-[#6b7db3] font-medium transition-colors duration-300 group-hover:text-[#364687]">Facebook</p>
            </a>

            {/* Gmail Link */}
            <a 
              href="mailto:cjcrsgonline@gmail.com"
              aria-label="Email us"
              className="flex flex-col items-center gap-2 group select-none"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:opacity-80 group-active:translate-y-0 group-active:scale-95">
                <img src="/GMAIL.png" alt="gmail_icon" className="w-full h-full object-contain scale-[2.5] sm:scale-[2.8] lg:scale-[3]" />
              </div>
              <p className="font-montserrat text-[11px] sm:text-xs text-[#6b7db3] font-medium transition-colors duration-300 group-hover:text-[#364687]">Gmail</p>
            </a>

            {/* Contact Link */}
            <div className="relative flex flex-col items-center gap-2 group select-none cursor-pointer" onClick={copyPhone}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:opacity-80 group-active:translate-y-0 group-active:scale-95">
                <img src="/CONTACT.png" alt="contact_icon" className="w-full h-full object-contain scale-[2.5] sm:scale-[2.8] lg:scale-[3]" />
              </div>
              <p className="font-montserrat text-[11px] sm:text-xs text-[#6b7db3] font-medium transition-colors duration-300 group-hover:text-[#364687]">Contact</p>
              {copied && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#364687] text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Mission & Vision - Desktop/Tablet */}
        <div className="hidden sm:flex flex-1 flex-col justify-center px-6 sm:px-8 lg:px-10 py-8 lg:py-10">
          <div className="mb-6 lg:mb-8">
            <h2 className="font-montserrat font-bold text-lg sm:text-xl lg:text-2xl text-[#364687] mb-2">Mission</h2>
            <p className="font-montserrat font-light text-xs sm:text-sm lg:text-base text-[#6b7db3] leading-relaxed">
              To share the gospel of the kingdom, to make disciples of Christs and to plant in the Philippines and all over the world.
            </p>
          </div>
          <div>
            <h2 className="font-montserrat font-bold text-lg sm:text-xl lg:text-2xl text-[#364687] mb-2">Vision</h2>
            <p className="font-montserrat font-light text-xs sm:text-sm lg:text-base text-[#6b7db3] leading-relaxed">
              To bring people to God.
            </p>
          </div>
        </div>

        {/* Mission & Vision - Mobile Cards */}
        <div className="sm:hidden flex flex-col gap-3 p-4 bg-[#f4f6ff]">
          <div className="bg-white rounded-xl border border-[#d0d8f5] p-4">
            <Target className="text-[#364687] w-6 h-6 mb-2" />
            <h2 className="font-montserrat font-bold text-sm text-[#364687] mb-1">Mission</h2>
            <p className="font-montserrat text-xs text-[#6b7db3] leading-relaxed">
              To share the gospel of the kingdom, to make disciples of Christs and to plant in the Philippines and all over the world.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#d0d8f5] p-4">
            <Eye className="text-[#364687] w-6 h-6 mb-2" />
            <h2 className="font-montserrat font-bold text-sm text-[#364687] mb-1">Vision</h2>
            <p className="font-montserrat text-xs text-[#6b7db3] leading-relaxed">
              To bring people to God.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/messageReset" element={<MessageReset />} />
        <Route path="/verifyReset" element={<VerifyReset />} />
        <Route path="/resetPassword" element={<ResetPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute adminOnly={true}>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute adminOnly={true}>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/visitors"
          element={
            <ProtectedRoute adminOnly={true}>
              <Visitors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute adminOnly={true}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected Member Dashboard */}
        <Route
          path="/member/home"
          element={
            <ProtectedRoute adminOnly={false}>
              <MemberPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/announcements"
          element={
            <ProtectedRoute adminOnly={false}>
              <MemberAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/profile"
          element={
            <ProtectedRoute adminOnly={false}>
              <MemberProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;