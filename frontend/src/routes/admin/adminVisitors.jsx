import React, { useState, useEffect, useCallback } from 'react'
import AdminNavbar from '../../components/adminNavbar'
import Footer from '../../components/footer'
import { Search, Filter, Download, Plus, ArrowLeft, User, Building2, Calendar, CheckCircle, X, ChevronDown, Loader2, AlertCircle, Clock } from 'lucide-react'

const initialVisitors = [
  { id: 1, fullName: 'Pastor Kim', originalChurch: 'CJCRSG Korea', dateOfAttendance: '2026-05-01', timestamp: '08:45 AM', isFirstTime: true, invitedBy: '' },
  { id: 2, fullName: 'Sam', originalChurch: 'Living Epistle Ambulong', dateOfAttendance: '2026-04-28', timestamp: '09:15 AM', isFirstTime: false, invitedBy: 'Juan Dela Cruz' },
  { id: 3, fullName: 'Alex Manzanilla', originalChurch: 'VCCF Sto. Tomas', dateOfAttendance: '2026-04-25', timestamp: '08:30 AM', isFirstTime: true, invitedBy: '' },
  { id: 4, fullName: 'Claire Magsino', originalChurch: 'JPCC Sto. Tomas', dateOfAttendance: '2026-04-20', timestamp: '09:00 AM', isFirstTime: false, invitedBy: 'Maria Santos' },
  { id: 5, fullName: 'Joy', originalChurch: 'Victory Church', dateOfAttendance: '2026-04-15', timestamp: '10:30 AM', isFirstTime: true, invitedBy: '' },
]

const FloatingLabelInput = ({ label, name, value, onChange, type = 'text', placeholder, error, icon: Icon, ...props }) => (
  <div className="relative mt-4">
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className={`peer w-full border-2 rounded-xl px-4 pt-5 pb-2 focus:outline-none transition-colors text-sm ${
        error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#4A558F]'
      }`}
      {...props}
    />
    <label
      htmlFor={name}
      className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 transition-all duration-200 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#4A558F] ${
        error ? 'peer-focus:text-red-500' : ''
      } peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs`}
    >
      {Icon && <Icon size={14} className="inline mr-1" />}
      {label}
    </label>
    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
  </div>
)

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState(initialVisitors)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedVisitors, setSelectedVisitors] = useState([])
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')
  const [loadingMore, setLoadingMore] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    originalChurch: '',
    invitedBy: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const showToast = useCallback((message, type = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const filteredVisitors = visitors.filter(visitor => {
    const search = debouncedSearch.toLowerCase()
    return (
      visitor.fullName.toLowerCase().includes(search) ||
      visitor.originalChurch.toLowerCase().includes(search) ||
      visitor.dateOfAttendance.includes(search) ||
      (visitor.invitedBy && visitor.invitedBy.toLowerCase().includes(search))
    )
  })

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const visitorsThisWeek = visitors.filter(v => new Date(v.dateOfAttendance) >= weekStart).length
  const visitorsThisMonth = visitors.filter(v => new Date(v.dateOfAttendance) >= monthStart).length

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
    if (!formData.originalChurch.trim()) errors.originalChurch = 'Original church is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddVisitor = () => {
    if (!validateForm()) return

    const currentTime = new Date()
    const timestamp = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const isDuplicate = visitors.some(
      v => v.originalChurch.toLowerCase() === formData.originalChurch.toLowerCase() &&
           v.fullName.toLowerCase() === formData.fullName.toLowerCase()
    )

    const newVisitor = {
      id: Date.now(),
      fullName: formData.fullName.trim(),
      originalChurch: formData.originalChurch.trim(),
      dateOfAttendance: formData.dateOfVisit || new Date().toISOString().split('T')[0],
      timestamp,
      isFirstTime: !isDuplicate,
      invitedBy: formData.invitedBy.trim(),
    }
    setVisitors(prev => [newVisitor, ...prev])
    resetForm()
    setShowModal(false)
    showToast('Visitor added successfully!')
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      originalChurch: '',
      invitedBy: '',
      dateOfVisit: new Date().toISOString().split('T')[0],
    })
    setFormErrors({})
  }

  const toggleSelectAll = () => {
    if (selectedVisitors.length === filteredVisitors.length) {
      setSelectedVisitors([])
    } else {
      setSelectedVisitors(filteredVisitors.map(v => v.id))
    }
  }

  const toggleSelect = (id) => {
    setSelectedVisitors(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setLoadingMore(false)
    }, 1000)
  }

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-gradient-to-b from-[#D9DFF2]/30 to-white pb-8 font-montserrat">
        <div className="max-w-7xl mx-auto px-4">

          {/* Hero Section */}
          <div className="text-center py-8">
            <h2 className="text-4xl font-semibold text-[#4A558F]">CJC VISITORS</h2>
            <p className="text-gray-500 mt-2 text-sm">Manage the information of people who visit our church.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 bg-[#D9DFF2] text-[#4A558F] rounded-xl py-3 px-8 hover:bg-[#4A558F] hover:text-white transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add New Visitor
            </button>
          </div>

          {/* KPI Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{visitorsThisWeek}</p>
              <p className="text-sm text-gray-500 mt-1">Visitors This Week</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{visitorsThisMonth}</p>
              <p className="text-sm text-gray-500 mt-1">Visitors This Month</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{visitors.length}</p>
              <p className="text-sm text-gray-500 mt-1">Overall Visitors</p>
            </div>
          </div>

          {/* Data Management Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-[#4A558F]">Visitors</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 flex-1 sm:flex-none sm:w-64 focus-within:border-[#4A558F] transition-colors">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search by name, church..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full ml-2 focus:outline-none text-sm"
                    />
                  </div>

                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Filter size={16} />
                    Filter
                  </button>

                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>

              {selectedVisitors.length > 0 && (
                <div className="mt-3 flex items-center gap-3 bg-[#D9DFF2]/50 rounded-lg px-4 py-2">
                  <span className="text-sm text-[#4A558F]">{selectedVisitors.length} selected</span>
                  <button className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors">
                    <X size={14} />
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              {filteredVisitors.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No visitors found.</p>
                  {debouncedSearch && (
                    <p className="text-gray-400 text-xs mt-1">Try adjusting your search query.</p>
                  )}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#D9DFF2]/50">
                    <tr className="text-left">
                      <th className="py-3 px-5 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={filteredVisitors.length > 0 && selectedVisitors.length === filteredVisitors.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Full Name <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Original Church <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Date of Attendance <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Timestamp <ChevronDown size={14} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisitors.map((visitor, index) => (
                      <tr
                        key={visitor.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-3 px-5">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedVisitors.includes(visitor.id)}
                            onChange={() => toggleSelect(visitor.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{visitor.fullName}</span>
                            {visitor.isFirstTime && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                First Time
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Building2 size={14} className="text-gray-400" />
                            {visitor.originalChurch}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar size={14} className="text-gray-400" />
                            {visitor.dateOfAttendance}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock size={14} className="text-gray-400" />
                            {visitor.timestamp}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Load More */}
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 text-sm text-[#4A558F] hover:text-[#3a4575] transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Visitor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-[#4A558F]" />
              </button>
              <h3 className="text-lg font-semibold text-[#4A558F]">Add New Visitor</h3>
            </div>

            <div className="p-5">
              <FloatingLabelInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Juan Dela Cruz" error={formErrors.fullName} icon={User} />
              <FloatingLabelInput label="Original Church" name="originalChurch" value={formData.originalChurch} onChange={handleInputChange} placeholder="CJCRSG" error={formErrors.originalChurch} icon={Building2} />
              <FloatingLabelInput label="Invited By (Optional)" name="invitedBy" value={formData.invitedBy} onChange={handleInputChange} placeholder="Member who invited them" />
              <FloatingLabelInput label="Date of Visit" name="dateOfVisit" value={formData.dateOfVisit} onChange={handleInputChange} type="date" icon={Calendar} />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 bg-gray-200 text-gray-600 rounded-xl py-3 hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVisitor}
                  className="flex-1 bg-[#4A558F] text-white rounded-xl py-3 hover:bg-[#3a4575] transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Visitor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm ${
            toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toastType === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            {toast}
          </div>
        </div>
      )}

      <Footer />

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

export default AdminVisitors
