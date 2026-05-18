import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import AdminNavbar from '../../components/adminNavbar'
import Footer from '../../components/footer'
import { 
  Search, Filter, Download, Plus, ArrowLeft, User, 
  Building2, Calendar, CheckCircle, X, ChevronDown, 
  Loader2, AlertCircle, Clock, Trash2 
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api/visitors';

const FloatingLabelInput = ({ label, name, value, onChange, type = 'text', error, icon: Icon, ...props }) => (
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
  // --- Data State ---
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ total: 0, week: 0, month: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedVisitors, setSelectedVisitors] = useState([])
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')

  const [formData, setFormData] = useState({
    fullName: '',
    originalChurch: '',
    invitedBy: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
  })
  const [formErrors, setFormErrors] = useState({})

  // --- Auth & Fetching ---
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token'); 
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const config = getAuthHeaders();
      const [visitorsRes, statsRes] = await Promise.all([
        axios.get(API_URL, config),
        axios.get(`${API_URL}/stats`, config)
      ])
      setVisitors(visitorsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      showToast('Could not load data from server.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [getAuthHeaders, showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // --- Search Logic ---
  const filteredVisitors = useMemo(() => {
    const search = debouncedSearch.toLowerCase()
    return visitors.filter(v => {
      const name = `${v.firstName || ''} ${v.lastName || v.fullName || ''}`.toLowerCase()
      const church = (v.churchAffiliation || v.originalChurch || '').toLowerCase()
      return name.includes(search) || church.includes(search)
    })
  }, [visitors, debouncedSearch])

  // --- Logic Functions ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleAddVisitor = async () => {
    if (!formData.fullName.trim() || !formData.originalChurch.trim()) {
      setFormErrors({ 
        fullName: !formData.fullName.trim() ? 'Required' : '',
        originalChurch: !formData.originalChurch.trim() ? 'Required' : ''
      })
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post(API_URL, formData, getAuthHeaders())
      showToast('Visitor saved successfully!')
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      showToast('Error saving visitor.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ fullName: '', originalChurch: '', invitedBy: '', dateOfVisit: new Date().toISOString().split('T')[0] })
    setFormErrors({})
  }

  const toggleSelectAll = () => {
    setSelectedVisitors(selectedVisitors.length === filteredVisitors.length ? [] : filteredVisitors.map(v => v.id))
  }

  const toggleSelect = (id) => {
    setSelectedVisitors(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  // --- Export Function ---
  const handleExport = () => {
    if (filteredVisitors.length === 0) {
      showToast('Nothing to export', 'error');
      return;
    }

    showToast('Generating CSV file...', 'success');

    // 1. Create headers
    const headers = ["Full Name", "Original Church", "Invited By", "Visit Date"];
    
    // 2. Map data to rows (handling commas in values by wrapping in quotes)
    const rows = filteredVisitors.map(v => [
      `"${v.firstName || ''} ${v.lastName || v.fullName || ''}"`,
      `"${v.churchAffiliation || v.originalChurch || ''}"`,
      `"${v.invitedBy || 'Walk-in'}"`,
      `"${new Date(v.visitedAt || v.dateOfAttendance).toLocaleDateString()}"`
    ]);

    // 3. Combine headers and rows
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

    // 4. Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CJC_Visitors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <p className="font-bold text-3xl text-[#4A558F]">{stats.week}</p>
              <p className="text-sm text-gray-500 mt-1">Visitors This Week</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{stats.month}</p>
              <p className="text-sm text-gray-500 mt-1">Visitors This Month</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">Overall Visitors</p>
            </div>
          </div>

          {/* Data Management Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-[#4A558F]">Visitors Log</h3>
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

                  <button 
                    onClick={handleExport} 
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>

              {selectedVisitors.length > 0 && (
                <div className="mt-3 flex items-center justify-between bg-[#D9DFF2]/50 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#4A558F] font-medium">{selectedVisitors.length} selected</span>
                    <button onClick={() => setSelectedVisitors([])} className="text-xs text-gray-500 hover:underline">Clear Selection</button>
                  </div>
                  <button className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium">
                    <Trash2 size={14} /> Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center py-20">
                  <Loader2 className="animate-spin text-[#4A558F] mb-2" size={40} />
                  <p className="text-gray-400 text-sm">Syncing records...</p>
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No visitors found.</p>
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
                      <th className="py-3 px-4 text-gray-600 font-medium">Full Name</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Original Church</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Invited By</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Date & Time</th>
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
                            <span className="text-gray-700 font-medium">
                              {visitor.firstName} {visitor.lastName || visitor.fullName}
                            </span>
                            {visitor.isFirstTime && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                First Time
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Building2 size={14} className="text-gray-400" />
                            {visitor.churchAffiliation || visitor.originalChurch}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={visitor.invitedBy ? "text-[#4A558F] font-medium" : "text-gray-400 italic text-xs"}>
                            {visitor.invitedBy || 'Walk-in'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(visitor.visitedAt || visitor.dateOfAttendance).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-0.5">
                            <Clock size={12} />
                            {new Date(visitor.visitedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
              <FloatingLabelInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} error={formErrors.fullName} icon={User} />
              
              <div className="flex gap-4">
                <div className="flex-[2]">
                   <FloatingLabelInput label="Original Church" name="originalChurch" value={formData.originalChurch} onChange={handleInputChange} error={formErrors.originalChurch} icon={Building2} />
                </div>
              </div>

              <FloatingLabelInput label="Invited By (Optional)" name="invitedBy" value={formData.invitedBy} onChange={handleInputChange} />
              <FloatingLabelInput label="Date of Visit" name="dateOfVisit" value={formData.dateOfVisit} onChange={handleInputChange} type="date" icon={Calendar} />

              <div className="flex gap-3 mt-8">
                <button
                  disabled={isSubmitting}
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleAddVisitor}
                  className="flex-1 bg-[#4A558F] text-white rounded-xl py-3 hover:bg-[#3a4575] transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Add Visitor</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
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

export default AdminVisitors;