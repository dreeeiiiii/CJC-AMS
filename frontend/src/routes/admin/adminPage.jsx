import React, { useState, useRef, useEffect, useCallback } from 'react'
import AdminNavbar from "../../components/adminNavbar"
import Footer from '../../components/footer'
import { Search, Filter, Download, ChevronDown, ChevronUp, UserPlus, Users, CalendarCheck, ChevronRight, CheckCircle, User, ArrowLeft, QrCode, Camera, X, Check } from 'lucide-react'

const initialMembers = [
  { id: 1, firstName: 'Juan', middleInitial: 'D', lastName: 'Dela Cruz', status: 'Old Member' },
  { id: 2, firstName: 'Maria', middleInitial: 'S', lastName: 'Santos', status: 'New Member' },
  { id: 3, firstName: 'Pedro', middleInitial: 'R', lastName: 'Reyes', status: 'Old Member' },
  { id: 4, firstName: 'Ana', middleInitial: 'G', lastName: 'Garcia', status: 'New Member' },
  { id: 5, firstName: 'Jose', middleInitial: 'M', lastName: 'Mendoza', status: 'Old Member' },
  { id: 6, firstName: 'Luz', middleInitial: 'T', lastName: 'Torres', status: 'New Member' },
  { id: 7, firstName: 'Carlos', middleInitial: 'B', lastName: 'Bautista', status: 'Old Member' },
  { id: 8, firstName: 'Rosa', middleInitial: 'L', lastName: 'Lopez', status: 'Old Member' },
]

const AdminPage = () => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [members] = useState(initialMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMembers, setFilteredMembers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedMember, setSelectedMember] = useState(null)
  const [toast, setToast] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState([])

  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const recentActivity = [
    { id: 1, name: 'Juan Dela Cruz', status: 'Old Member', date: '2026-05-01', time: '8:30 AM' },
    { id: 2, name: 'Maria Santos', status: 'New Member', date: '2026-05-01', time: '8:45 AM' },
    { id: 3, name: 'Pedro Reyes', status: 'Old Member', date: '2026-05-02', time: '9:00 AM' },
    { id: 4, name: 'Ana Garcia', status: 'New Member', date: '2026-05-02', time: '9:15 AM' },
    { id: 5, name: 'Jose Ramos', status: 'Old Member', date: '2026-05-03', time: '8:00 AM' },
    { id: 6, name: 'Luz Mendoza', status: 'Old Member', date: '2026-05-03', time: '10:30 AM' },
    { id: 7, name: 'Carlos Torres', status: 'New Member', date: '2026-05-04', time: '7:45 AM' },
    { id: 8, name: 'Rosa Bautista', status: 'Old Member', date: '2026-05-04', time: '8:15 AM' },
  ]

  const weeklyData = [
    { week: 'W1', count: 320 },
    { week: 'W2', count: 280 },
    { week: 'W3', count: 350 },
    { week: 'W4', count: 300 },
  ]

  const maxWeekly = Math.max(...weeklyData.map(d => d.count))

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers([])
      setShowDropdown(false)
      return
    }

    const filtered = members.filter(member => {
      const fullName = `${member.firstName} ${member.middleInitial} ${member.lastName}`.toLowerCase()
      return fullName.includes(searchTerm.toLowerCase())
    })

    setFilteredMembers(filtered)
    setShowDropdown(filtered.length > 0)
    setActiveIndex(-1)
  }, [searchTerm, members])

  const handleKeyDown = (e) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev < filteredMembers.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredMembers.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredMembers.length) {
          selectMember(filteredMembers[activeIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  const selectMember = (member) => {
    setSelectedMember(member)
    setSearchTerm(`${member.firstName} ${member.middleInitial} ${member.lastName}`)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleAddAttendance = () => {
    const memberToAdd = selectedMember || members.find(m =>
      `${m.firstName} ${m.middleInitial} ${m.lastName}`.toLowerCase() === searchTerm.toLowerCase()
    )

    if (!memberToAdd) {
      showToast('Please select a valid member', 'error')
      return
    }

    const now = new Date()
    const newRecord = {
      id: Date.now(),
      memberId: memberToAdd.id,
      name: `${memberToAdd.firstName} ${memberToAdd.middleInitial} ${memberToAdd.lastName}`,
      status: memberToAdd.status,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    setAttendanceRecords(prev => [newRecord, ...prev])

    setSearchTerm('')
    setSelectedMember(null)
    setShowDropdown(false)
    showToast('Attendance Recorded!')

    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2000)
  }

  const closeModal = () => {
    setShowAttendanceModal(false)
    setSearchTerm('')
    setSelectedMember(null)
    setShowDropdown(false)
    setShowScanner(false)
  }

  return (
    <>
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-montserrat">

        {/* Hero / Action Section with Summary Cards */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Greeting & CTA */}
          <div className="lg:w-1/3 flex flex-col justify-center items-center lg:items-start gap-4 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-[#4A558F]">Hi, Admin Gwy!</h2>
            <p className="text-gray-500 text-sm">Manage and monitor attendance here.</p>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="bg-[#D9DFF2] text-[#4A558F] rounded-xl py-2.5 px-6 hover:bg-[#4A558F] hover:text-white transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add Attendance
            </button>
          </div>

          {/* Summary Cards */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Attendees Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Attendees Status</h3>
              <div className="w-full h-4 rounded-full overflow-hidden flex">
                <div className="bg-[#4A558F] h-full rounded-l-full" style={{ width: '89%' }}></div>
                <div className="bg-[#D9DFF2] h-full rounded-r-full" style={{ width: '11%' }}></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4A558F]"></div>
                    <span className="text-sm text-gray-600">Old</span>
                  </div>
                  <span className="text-sm font-medium text-[#4A558F]">267 / 89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D9DFF2]"></div>
                    <span className="text-sm text-gray-600">New</span>
                  </div>
                  <span className="text-sm font-medium text-[#4A558F]">33 / 11%</span>
                </div>
              </div>
            </div>

            {/* Monthly Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Monthly Summary</h3>
              <div className="flex items-end gap-4 h-32">
                {weeklyData.map((d) => (
                  <div key={d.week} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500 mb-1">{d.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-[#4A558F] transition-all duration-300 hover:bg-[#3a4575]"
                      style={{ height: `${(d.count / 400) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{d.week}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400 px-1">
                <span>0</span>
                <span>100</span>
                <span>200+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-evenly items-center py-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">33</p>
            </div>
            <p className="text-sm text-gray-500">New Attendees This Week</p>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Users size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">300</p>
            </div>
            <p className="text-sm text-gray-500">Total Attendees This Week</p>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck size={20} className="text-[#4A558F]" />
              <p className="font-bold text-2xl text-[#4A558F]">1,431</p>
            </div>
            <p className="text-sm text-gray-500">Monthly Attendance</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold text-[#4A558F]">Recent Activity</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 flex-1 sm:flex-none sm:w-56 focus-within:border-[#4A558F] transition-colors">
                <Search size={16} className="text-gray-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full ml-2 focus:outline-none text-sm"
                />
              </div>

              {/* Filter */}
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors">
                <Filter size={16} />
                Filter
              </button>

              {/* Export */}
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#4A558F]">
                      Name
                      <ChevronDown size={14} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#4A558F]">
                      Status
                      <ChevronDown size={14} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#4A558F]">
                      Date of Attendance
                      <ChevronDown size={14} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#4A558F]">
                      Timestamp
                      <ChevronDown size={14} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-3 px-4 text-gray-700">{row.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === 'Old Member'
                          ? 'bg-[#D9DFF2] text-[#4A558F]'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {row.status === 'Old Member' ? (
                          <CheckCircle size={12} />
                        ) : (
                          <User size={12} />
                        )}
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{row.date}</td>
                    <td className="py-3 px-4 text-gray-500">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-6">
            <button className="flex items-center gap-2 text-sm text-[#4A558F] hover:text-[#3a4575] transition-colors">
              Load More
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      <Footer />

      {/* Add Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-[#4A558F]" />
              </button>
              <h3 className="text-lg font-bold text-[#4A558F] flex-1 text-center mr-8">ATTENDANCE</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!showScanner ? (
                <>
                  <p className="text-sm text-gray-500 text-center mb-6">Add attendance for this Sunday using the member's name.</p>

                  {/* Autocomplete Input */}
                  <div className="relative">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setSelectedMember(null)
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => filteredMembers.length > 0 && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder=" "
                        className="peer w-full border-2 border-gray-200 rounded-xl px-4 pt-5 pb-2 focus:outline-none focus:border-[#4A558F] transition-colors text-sm"
                      />
                      <label className="absolute left-4 top-2 text-xs text-[#4A558F] bg-white px-1">
                        Member Name
                      </label>
                    </div>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                      >
                        {filteredMembers.map((member, index) => (
                          <div
                            key={member.id}
                            onClick={() => selectMember(member)}
                            className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                              index === activeIndex ? 'bg-[#D9DFF2]' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm text-gray-700">
                              {member.firstName} {member.middleInitial} {member.lastName}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.status === 'Old Member'
                                ? 'bg-[#D9DFF2] text-[#4A558F]'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAddAttendance}
                    className="w-full mt-6 bg-[#B8C4E8] text-[#4A558F] rounded-xl py-3 hover:bg-[#4A558F] hover:text-white transition-all duration-300 shadow-md text-sm font-medium"
                  >
                    Add
                  </button>

                  {/* Scan QR Code Link */}
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full mt-4 text-sm text-[#4A558F] hover:text-[#3a4575] transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode size={16} />
                    Scan QR code
                  </button>
                </>
              ) : (
                /* QR Scanner View */
                <div className="text-center">
                  <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center mb-4 relative overflow-hidden">
                    <Camera size={48} className="text-gray-400" />
                    <div className="absolute inset-0 border-2 border-[#4A558F] rounded-xl m-8 opacity-50"></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Position the QR code within the frame</p>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="w-full bg-[#D9DFF2] text-[#4A558F] rounded-xl py-3 hover:bg-[#4A558F] hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default AdminPage
