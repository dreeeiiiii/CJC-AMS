import React, { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import AdminNavbar from "../../components/AdminNavbar"
import Footer from "../../components/Footer"
import Modal from "../../components/Modal"
import { Html5QrcodeScanner } from 'html5-qrcode'
import { 
  Search, Filter, Download, ChevronDown, UserPlus, Users, 
  CalendarCheck, ChevronRight, CheckCircle, User, ArrowLeft, 
  QrCode, Camera, X, Check, RefreshCw
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
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([])
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0])
  const [memberStatus, setMemberStatus] = useState({
    active: 0, inactive: 0, total: 0, activePct: 0, inactivePct: 0, activityMap: {}
  })
  const [tableSearch, setTableSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [activityFilter, setActivityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterRef = useRef(null)
  const inputRef = useRef(null)

  // Compute consecutive weekly attendance streak per member name
  const computeStreaks = (records) => {
    const getWeekKey = (dateStr) => {
      const d = new Date(dateStr)
      const jan4 = new Date(d.getFullYear(), 0, 4)
      const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
      const weekNum = Math.ceil((dayOfYear + jan4.getDay() - 1) / 7)
      return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
    }

    const memberWeeks = {}
    records.forEach(r => {
      if (!r.name || !r.date) return
      if (!memberWeeks[r.name]) memberWeeks[r.name] = new Set()
      memberWeeks[r.name].add(getWeekKey(r.date))
    })

    const streaks = {}
    Object.entries(memberWeeks).forEach(([name, weeksSet]) => {
      const weeks = [...weeksSet].sort().reverse()
      if (weeks.length === 0) { streaks[name] = 0; return }

      const weekToDate = (wk) => {
        const [year, w] = wk.split('-W').map(Number)
        const jan4 = new Date(year, 0, 4)
        const monday = new Date(jan4)
        monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (w - 1) * 7)
        return monday
      }

      let streak = 1
      for (let i = 0; i < weeks.length - 1; i++) {
        const curr = weekToDate(weeks[i])
        const next = weekToDate(weeks[i + 1])
        const diffDays = (curr - next) / (1000 * 60 * 60 * 24)
        if (diffDays === 7) {
          streak++
        } else {
          break
        }
      }
      streaks[name] = streak
    })
    return streaks
  }

  const streakMap = computeStreaks(allAttendanceRecords)

  // --- API Configuration ---
  const API_BASE_URL = import.meta.env.VITE_API_URL
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  // --- Dynamic Analytics Computations ---
  const computeWeeklyData = (allRecords, currentWeekCount) => {
    const now = new Date()
    const getWeekStart = (date) => {
      const d = new Date(date)
      const day = d.getDay()
      d.setDate(d.getDate() - day)
      d.setHours(0, 0, 0, 0)
      return d
    }
    const currentWeekStart = getWeekStart(now)
    const weeks = []
    
    for (let i = 3; i >= 1; i--) {
      const weekStart = new Date(currentWeekStart)
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      weeks.push(allRecords.filter(r => {
        const d = new Date(r.createdAt || r.date)
        return d >= weekStart && d < weekEnd
      }).length)
    }
    weeks.push(currentWeekCount)
    return weeks
  }

  const computeMemberStatus = (memberList, allRecords) => {
    const now = new Date()
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
    const lastAttendance = {}
    
    allRecords.forEach(r => {
      const recordName = r.name || (r.member ? `${r.member.firstName} ${r.member.lastName}` : '')
      const recordDate = r.createdAt || r.date
      if (recordName && (!lastAttendance[recordName] || new Date(recordDate) > new Date(lastAttendance[recordName]))) {
        lastAttendance[recordName] = recordDate
      }
    })
    
    const activityMap = {}
    memberList.forEach(m => {
      const name = `${m.firstName} ${m.lastName}`
      const lastDate = lastAttendance[name]
      activityMap[name] = lastDate ? new Date(lastDate) >= fourWeeksAgo : false
    })
    
    const active = Object.values(activityMap).filter(Boolean).length
    const inactive = Object.values(activityMap).filter(v => !v).length
    const total = memberList.length
    
    return {
      active,
      inactive,
      total,
      activePct: total > 0 ? Math.round((active / total) * 100) : 0,
      inactivePct: total > 0 ? Math.round((inactive / total) * 100) : 0,
      activityMap
    }
  }

  // --- Normalizing API Data For Table Display ---
  // --- Normalizing API Data For Table Display ---
  const normalizedRecords = useMemo(() => {
      return attendanceRecords.map(rec => {
          const name = rec.name || (rec.member ? `${rec.member.firstName} ${rec.member.lastName}` : 'Unknown Member');
          const status = rec.status || rec.member?.status || 'Old Member';
          
          // ✅ Use the backend's formatted date and time directly
          // No conversion needed - backend already sends correct Philippine time
          const dateString = rec.date || "N/A";
          const timeString = rec.time || "12:00 AM";
          
          // Create a date object for sorting (combine date and time)
          let sortDate = new Date();
          if (rec.date && rec.time) {
              // Parse the date and time for sorting
              const [month, day, year] = rec.date.split('/');
              const timeMatch = rec.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
              if (timeMatch) {
                  let hours = parseInt(timeMatch[1]);
                  const minutes = parseInt(timeMatch[2]);
                  const isPM = timeMatch[3].toUpperCase() === 'PM';
                  if (isPM && hours !== 12) hours += 12;
                  if (!isPM && hours === 12) hours = 0;
                  sortDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
              }
          }
  
          return {
              id: rec.id,
              name,
              status,
              date: dateString,
              time: timeString,
              rawDateTime: sortDate
          };
      });
  }, [attendanceRecords]);

  // --- Memoized Table Filtering & Sorting ---
  const filteredRecords = useMemo(() => {
    return normalizedRecords
      .filter(row => {
        const matchesSearch = !tableSearch || row.name.toLowerCase().includes(tableSearch.toLowerCase())
        const matchesType = typeFilter === 'All' || row.status === typeFilter
        const isActive = memberStatus.activityMap?.[row.name] ?? false
        const matchesActivity = activityFilter === 'All' ||
          (activityFilter === 'Active' && isActive) ||
          (activityFilter === 'Inactive' && !isActive)
        return matchesSearch && matchesType && matchesActivity
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'date-asc') return a.rawDateTime - b.rawDateTime
        return b.rawDateTime - a.rawDateTime
      })
  }, [normalizedRecords, tableSearch, typeFilter, activityFilter, sortBy, memberStatus.activityMap])

  // --- Live Data Fetching ---
  const fetchDashboardData = async () => {
    try {
      const config = getAuthHeader()
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.firstName) setAdminName(storedUser.firstName);

      const [membersRes, activityRes, statsRes, allAttendanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`, config),
        axios.get(`${API_BASE_URL}/api/attendance/recent`, config),
        axios.get(`${API_BASE_URL}/api/attendance/stats`, config),
        axios.get(`${API_BASE_URL}/api/attendance`, config)
      ])
      
      const membersData = membersRes.data || []
      const activityData = activityRes.data || []
      const allData = allAttendanceRes.data || []
      const weekTotal = statsRes.data?.totalAttendeesWeek || 0

      setMembers(membersData)
      setAttendanceRecords(activityData)
      setAllAttendanceRecords(allData)
      
      setStats({ 
        newAttendeesWeek: statsRes.data?.newAttendeesWeek || 0,
        totalAttendeesWeek: weekTotal, 
        monthlyAttendance: allData.length,
        ratio: statsRes.data?.ratio || { old: 0, new: 0, oldPercentage: 0, newPercentage: 0 }
      })

      setWeeklyData(computeWeeklyData(allData, weekTotal))
      setMemberStatus(computeMemberStatus(membersData, allData))
    } catch (error) {
      console.error("Dashboard Fetch Error:", error)
      showToast("Could not sync data with server", "error")
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- QR Scanner Instance Lifecycle ---
  useEffect(() => {
    let scanner = null;
    let timeoutId = null;

    if (showScanner) {
      timeoutId = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner("reader", { 
            fps: 15, 
            qrbox: { width: 220, height: 220 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0
          });

          const onScanSuccess = async (decodedText) => {
            try {
                // Extract just the numbers from any format
                const numbers = decodedText.match(/\d+/g);
                if (!numbers) {
                    showToast('Invalid QR payload format', 'error');
                    return;
                }
                const memberId = parseInt(numbers[0], 10);
                
                await axios.post(
                    `${API_BASE_URL}/api/attendance`, 
                    { memberId: memberId }, 
                    getAuthHeader()
                );
                
                showToast('Attendance Recorded via QR!');
                closeModal();
                fetchDashboardData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Invalid QR Code', 'error');
            }
        };

          scanner.render(onScanSuccess, (err) => {});
        } catch (initErr) {
          console.error("Scanner init fail:", initErr);
        }
      }, 100);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (scanner) {
        scanner.clear().catch(error => console.error("Scanner cleanup failed", error));
      }
    }
  }, [showScanner]);

  // --- Search Member Input Field Filtering ---
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

  // --- Actions & Request Interactors ---
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
      document.body.removeChild(link)
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

  const nowPH = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  )
  
  const isFridayPH = nowPH.getDay() === 5  // 5 = Friday
  return (
    <>
      <AdminNavbar />

      {toast && (
        <div className={`toast-container fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg font-montserrat text-sm text-white transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#4A558F]'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-montserrat">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 flex flex-col justify-center items-center lg:items-start gap-4 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-[#4A558F]">Hi, Admin {adminName}!</h2>
            <p className="text-gray-500 text-sm">Manage and monitor attendance here.</p>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="bg-[#D9DFF2] text-[#4A558F] rounded-xl py-3 px-8 hover:bg-[#4A558F] hover:text-white transition-all duration-300 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <UserPlus size={20} />
              Add Attendance
            </button>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Member Status</h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-500">Total</span>
                <span className="text-xs font-semibold text-[#4A558F]">{memberStatus.total} / 100%</span>
              </div>
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-100">
                <div 
                  className="bg-[#4A558F] h-full transition-all duration-700" 
                  style={{ width: `${memberStatus.activePct}%` }}
                ></div>
                <div 
                  className="bg-[#D9DFF2] h-full transition-all duration-700" 
                  style={{ width: `${memberStatus.inactivePct}%` }}
                ></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4A558F]"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <span className="text-sm font-medium text-[#4A558F]">{memberStatus.active} / {memberStatus.activePct}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D9DFF2] border border-gray-300"></div>
                    <span className="text-sm text-gray-600">Inactive</span>
                  </div>
                  <span className="text-sm font-medium text-gray-400">{memberStatus.inactive} / {memberStatus.inactivePct}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Weekly Attendance</h3>
              <div className="flex items-end gap-4 h-32">
                {weeklyData.map((count, i) => {
                  const maxVal = Math.max(...weeklyData, 1)
                  const barHeightPx = maxVal > 0 ? Math.round((count / maxVal) * 100) : 0
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <span className="text-xs text-gray-500 mb-1">{count}</span>
                      <div className="w-full rounded-t-lg bg-[#4A558F]" style={{ height: `${barHeightPx}px` }}></div>
                      <span className="text-xs text-gray-500 mt-1">W{i+1}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        {/* Mobile: 3-col compact grid */}
        <div className="grid grid-cols-3 sm:hidden gap-0">
          <div className="flex flex-col items-center justify-center py-4 border-r border-gray-200">
            <p className="font-bold text-xl text-[#4A558F]">{stats.newAttendeesWeek}</p>
            <p className="text-[11px] text-gray-500 mt-1 text-center px-1">New This Week</p>
          </div>
          <div className="flex flex-col items-center justify-center py-4 border-r border-gray-200">
            <p className="font-bold text-xl text-[#4A558F]">{stats.totalAttendeesWeek}</p>
            <p className="text-[11px] text-gray-500 mt-1 text-center px-1">Total This Week</p>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <p className="font-bold text-xl text-[#4A558F]">{stats.monthlyAttendance}</p>
            <p className="text-[11px] text-gray-500 mt-1 text-center px-1">Monthly Total</p>
          </div>
        </div>
        {/* Tablet+: flex cards */}
        <div className="hidden sm:flex bg-white rounded-2xl shadow-sm border border-gray-100 flex-row justify-evenly items-center py-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">{stats.newAttendeesWeek}</p>
            </div>
            <p className="text-sm text-gray-500">New This Week</p>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <Users size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">{stats.totalAttendeesWeek}</p>
            </div>
            <p className="text-sm text-gray-500">Total This Week</p>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
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
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 flex-1 sm:flex-none sm:w-64 focus-within:border-[#4A558F] transition-colors bg-white">
                <Search size={16} className="text-gray-400" />
                <input
                  type="search"
                  placeholder="Search by name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full ml-2 focus:outline-none text-sm"
                />
              </div>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#4A558F] transition-all bg-white"
                >
                  <Filter size={16} />
                  <span className="hidden xs:inline">Filter & Sort</span>
                  <span className="xs:hidden">Filter</span>
                  <ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden p-2">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Type</div>
                    {['All', 'New Member', 'Old Member'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setTypeFilter(opt); setShowFilterDropdown(false) }}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${typeFilter === opt ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                    <div className="my-1 border-t border-gray-100"></div>
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activity</div>
                    {['All', 'Active', 'Inactive'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setActivityFilter(opt); setShowFilterDropdown(false) }}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${activityFilter === opt ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                    <div className="my-1 border-t border-gray-100"></div>
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort By</div>
                    {[
                      { label: 'Newest First', val: 'date-desc' },
                      { label: 'Oldest First', val: 'date-asc' },
                      { label: 'Name A-Z', val: 'name' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => { setSortBy(opt.val); setShowFilterDropdown(false) }}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${sortBy === opt.val ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-full text-sm text-gray-600 hover:text-[#4A558F] hover:border-[#4A558F] transition-all bg-white">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 text-gray-600 font-medium">Name</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Member type</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Status</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Date</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Time</th>
                  <th className="py-3 px-4 text-gray-600 font-medium">Streak</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((row) => {
                    const isActive = memberStatus.activityMap?.[row.name] ?? false
                    return (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-700 font-medium">{row.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#4A558F]' : 'bg-[#D9DFF2] border border-gray-300'}`}></span>
                          <span className={`ml-1.5 text-xs font-semibold ${isActive ? 'text-[#4A558F]' : 'text-gray-400'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{row.date}</td>
                        <td className="py-3 px-4 text-gray-500">{row.time}</td>
                        <td className="py-3 px-4">
                          {(() => {
                            const s = streakMap[row.name] || 0
                            if (s >= 4) return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
                                🔥 {s} wks
                              </span>
                            )
                            if (s >= 2) return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600">
                                ⚡ {s} wks
                              </span>
                            )
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                {s} wk
                              </span>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-400">No activity recorded today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />

      <Modal isOpen={showAttendanceModal} onClose={closeModal}>
        <div className="font-montserrat">
          <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-[#F8F9FD]">
            <button onClick={closeModal} className="p-3 hover:bg-gray-200/80 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-[#4A558F]" />
            </button>
            <h3 className="text-sm md:text-base font-bold text-[#4A558F] flex-1 text-center mr-8 uppercase tracking-widest">
              {showScanner ? "Scan QR Code" : "Record Attendance"}
            </h3>
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
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#4A558F] transition-colors text-sm"
                  />

                  {showDropdown && filteredMembers.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => selectMember(member)}
                          className="px-4 py-3 cursor-pointer hover:bg-[#F8F9FD] text-sm text-gray-700 flex justify-between items-center transition-colors"
                        >
                          <span className="font-medium">{member.firstName} {member.lastName}</span>
                          <span className="text-[10px] bg-[#D9DFF2] px-2 py-0.5 rounded font-semibold text-[#4A558F]">
                            {member.role || 'Member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

<button
onClick={handleAddAttendance}
disabled={!selectedMember || !isFridayPH}
className={`w-full mt-6 rounded-xl py-3.5 transition-all shadow-md text-sm font-bold uppercase tracking-widest ${
  selectedMember && isFridayPH
    ? 'bg-[#4A558F] text-white hover:bg-[#3a4575] active:scale-[0.98]'
    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
}`}
>
Confirm Attendance
</button>

<p className="text-xs text-center text-gray-500 mt-3 font-medium">
Attendance is only available every Friday
<br />
12:00 AM - 11:59 PM (Philippine Time)
</p>

                <div className="relative my-6 flex py-1 items-center font-medium">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

<button
onClick={() => setShowScanner(true)}
disabled={!isFridayPH}
className={`w-full py-3.5 font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-sm uppercase tracking-wider ${
  isFridayPH
    ? 'bg-[#D9DFF2] text-[#4A558F] hover:bg-[#4A558F] hover:text-white active:scale-[0.98]'
    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
}`}
>
<QrCode size={18} />
Use Camera Scanner
</button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full bg-[#111827] rounded-2xl p-4 shadow-inner relative border border-gray-800 mb-5 overflow-hidden group">
                  <div className="absolute inset-x-4 top-4 bottom-4 pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#4A558F] rounded-tl"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#4A558F] rounded-tr"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#4A558F] rounded-bl"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#4A558F] rounded-br"></div>
                  </div>
                  <div id="reader" className="w-full overflow-hidden rounded-xl"></div>
                </div>

                <button 
                  onClick={() => setShowScanner(false)} 
                  className="w-full bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AdminPage;