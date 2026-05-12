import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import AdminNavbar from "../../components/adminNavbar"
import Footer from '../../components/footer'
// 1. Import the Scanner library
import { Html5QrcodeScanner } from 'html5-qrcode'
import { 
  Search, Filter, Download, ChevronDown, UserPlus, Users, 
  CalendarCheck, ChevronRight, CheckCircle, User, ArrowLeft, 
  QrCode, Camera, X, Check 
} from 'lucide-react'

const AdminPage = () => {
  // --- States ---
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [members, setMembers] = useState([]) 
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMembers, setFilteredMembers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [toast, setToast] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState([]) 
  const [adminName, setAdminName] = useState('Admin')
  
  const [stats, setStats] = useState({
    newAttendeesWeek: 0,
    totalAttendeesWeek: 0,
    monthlyAttendance: 0,
    ratio: { old: 0, new: 0, oldPercentage: 0, newPercentage: 0 }
  })

  const inputRef = useRef(null)

  // --- API Configuration ---
  const API_BASE_URL = "http://localhost:5000"
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  // --- Data Fetching ---
  const fetchDashboardData = async () => {
    try {
      const config = getAuthHeader()
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.firstName) setAdminName(storedUser.firstName);

      const [membersRes, activityRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`, config),
        axios.get(`${API_BASE_URL}/api/attendance/recent`, config),
        axios.get(`${API_BASE_URL}/api/attendance/stats`, config)
      ])
      
      setMembers(membersRes.data)
      setAttendanceRecords(activityRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error("Dashboard Fetch Error:", error)
      showToast("Failed to sync with server", "error")
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // --- QR SCANNER LOGIC ---
  useEffect(() => {
    let scanner = null;

    if (showScanner) {
      // Initialize scanner on the 'reader' div
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      });

      const onScanSuccess = async (decodedText) => {
        try {
          // Send scanned ID directly to API
          await axios.post(
            `${API_BASE_URL}/api/attendance`, 
            { memberId: decodedText }, 
            getAuthHeader()
          )
          
          showToast('Attendance Recorded via QR!')
          closeModal();
          fetchDashboardData();
        } catch (error) {
          showToast(error.response?.data?.message || 'Invalid QR Code', 'error')
        }
      };

      scanner.render(onScanSuccess, (err) => { /* Ignore constant scanning errors */ });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Scanner cleanup failed", error));
      }
    }
  }, [showScanner]);

  // --- Search Logic ---
  useEffect(() => {
    if (searchTerm.trim() === '' || selectedMember) {
      setFilteredMembers([])
      setShowDropdown(false)
      return
    }

    const filtered = members.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      return fullName.includes(searchTerm.toLowerCase())
    })

    setFilteredMembers(filtered)
    setShowDropdown(filtered.length > 0)
  }, [searchTerm, members, selectedMember])

  // --- Handlers ---
  const handleAddAttendance = async () => {
    if (!selectedMember) {
      showToast('Please select a valid member', 'error')
      return
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/attendance`, 
        { memberId: selectedMember.id }, 
        getAuthHeader()
      )
      
      showToast('Attendance Recorded!')
      closeModal();
      fetchDashboardData() 
    } catch (error) {
      showToast(error.response?.data?.message || 'Error recording attendance', 'error')
    }
  }

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attendance/export`, {
        ...getAuthHeader(),
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Attendance_Report_${new Date().toLocaleDateString()}.csv`)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      showToast("Export failed", "error")
    }
  }

  const selectMember = (member) => {
    setSelectedMember(member)
    setSearchTerm(`${member.firstName} ${member.lastName}`)
    setShowDropdown(false)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const closeModal = () => {
    setShowAttendanceModal(false)
    setSearchTerm('')
    setSelectedMember(null)
    setShowScanner(false)
  }

  const getStatusStyles = (status) => {
    const normalized = status?.toLowerCase() || '';
    if (normalized === 'new member') return 'bg-green-100 text-green-700';
    if (normalized === 'old member') return 'bg-[#D9DFF2] text-[#4A558F]';
    return 'bg-gray-100 text-gray-500';
  }

  return (
    <>
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-montserrat">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 flex flex-col justify-center items-center lg:items-start gap-4 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-[#4A558F]">Hi, Admin {adminName}!</h2>
            <p className="text-gray-500 text-sm">Manage and monitor attendance here.</p>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="bg-[#D9DFF2] text-[#4A558F] rounded-xl py-2.5 px-6 hover:bg-[#4A558F] hover:text-white transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add Attendance
            </button>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Attendees Status</h3>
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-100">
                <div 
                  className="bg-[#4A558F] h-full transition-all duration-700" 
                  style={{ width: `${stats.ratio?.oldPercentage || 0}%` }}
                ></div>
                <div 
                  className="bg-[#D9DFF2] h-full transition-all duration-700" 
                  style={{ width: `${stats.ratio?.newPercentage || 0}%` }}
                ></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4A558F]"></div>
                    <span className="text-sm text-gray-600">Old Members</span>
                  </div>
                  <span className="text-sm font-medium text-[#4A558F]">{stats.ratio?.old || 0} / {stats.ratio?.oldPercentage || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D9DFF2]"></div>
                    <span className="text-sm text-gray-600">New Members</span>
                  </div>
                  <span className="text-sm font-medium text-[#4A558F]">{stats.ratio?.new || 0} / {stats.ratio?.newPercentage || 0}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Weekly Activity</h3>
              <div className="flex items-end gap-4 h-32">
                {[10, 25, 15, stats.totalAttendeesWeek].map((count, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500 mb-1">{count}</span>
                    <div className="w-full rounded-t-lg bg-[#4A558F]" style={{ height: `${Math.min((count / 50) * 100, 100)}%` }}></div>
                    <span className="text-xs text-gray-500 mt-1">W{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-evenly items-center py-6 gap-6 sm:gap-0">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">{stats.newAttendeesWeek}</p>
            </div>
            <p className="text-sm text-gray-500">New This Week</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <Users size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">{stats.totalAttendeesWeek}</p>
            </div>
            <p className="text-sm text-gray-500">Total This Week</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">{stats.monthlyAttendance}</p>
            </div>
            <p className="text-sm text-gray-500">Monthly Total</p>
          </div>
        </div>

        {/* --- RECENT ACTIVITY TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold text-[#4A558F]">Recent Activity</h3>
            <button onClick={handleExport} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors">
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 text-gray-600 font-medium">Name</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Status</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Date</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-700 font-medium">{row.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{row.date}</td>
                      <td className="py-3 px-4 text-gray-500">{row.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-400">No activity recorded today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />

      {/* --- ATTENDANCE MODAL --- */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-gray-50/50">
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-[#4A558F]" />
              </button>
              <h3 className="text-lg font-bold text-[#4A558F] flex-1 text-center mr-8 uppercase tracking-wider">Record Attendance</h3>
            </div>

            <div className="p-6">
              {!showScanner ? (
                <>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setSelectedMember(null)
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search Member Name..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A558F] transition-colors text-sm"
                    />

                    {showDropdown && filteredMembers.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => selectMember(member)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm text-gray-700 flex justify-between items-center"
                          >
                            <span className="font-medium">{member.firstName} {member.lastName}</span>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400">{member.role}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddAttendance}
                    disabled={!selectedMember}
                    className={`w-full mt-6 rounded-xl py-3.5 transition-all shadow-md text-sm font-bold uppercase tracking-widest ${
                      selectedMember ? 'bg-[#4A558F] text-white hover:bg-[#3a4575]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm Attendance
                  </button>

                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full mt-4 text-sm text-[#4A558F] font-medium flex items-center justify-center gap-2 hover:underline"
                  >
                    <QrCode size={16} /> Scan QR code
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="bg-gray-900 rounded-xl min-h-[300px] flex items-center justify-center mb-4 relative overflow-hidden">
                    <div id="reader" className="w-full"></div>
                  </div>
                  <button onClick={() => setShowScanner(false)} className="w-full bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-colors">
                    Back to Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
          <div className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-medium ${
            toast.type === 'success' ? 'bg-gray-900 text-white border-l-4 border-green-500' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <X size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        /* Scanner UI cleanup to match design */
        #reader { border: none !important; }
        #reader__scan_region { background: #111827 !important; }
        #reader__dashboard_section_csr button {
          background: #4A558F !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-family: inherit !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
        }
        #reader img { display: none; }
      `}</style>
    </>
  )
}

export default AdminPage;