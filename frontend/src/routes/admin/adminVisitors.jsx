import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import axios from 'axios'
import AdminNavbar from '../../components/adminNavbar'
import Footer from '../../components/footer'
import { 
  Search, Filter, Download, Plus, ArrowLeft, User, 
  Building2, Calendar, CheckCircle, X, ChevronDown, 
  Loader2, AlertCircle, Clock, Trash2, Undo2, FileText
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api/visitors';

// ─── Floating Label Input ───────────────────────────────────────────────────
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

// ─── Floating Label Textarea ─────────────────────────────────────────────────
const FloatingLabelTextarea = ({ label, name, value, onChange, error, icon: Icon }) => (
  <div className="relative mt-4">
    <textarea
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      rows={3}
      className={`peer w-full border-2 rounded-xl px-4 pt-6 pb-2 focus:outline-none transition-colors text-sm resize-none ${
        error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#4A558F]'
      }`}
    />
    <label
      htmlFor={name}
      className={`absolute left-4 top-4 text-sm text-gray-400 transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#4A558F] peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs`}
    >
      {Icon && <Icon size={14} className="inline mr-1" />}
      {label}
    </label>
    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
  </div>
)

// ─── Visitor Detail Modal ────────────────────────────────────────────────────
const VisitorDetailModal = ({ visitor, onClose, onDelete, onEdit }) => {
  if (!visitor) return null

  const fullName = visitor.firstName
    ? `${visitor.firstName} ${visitor.lastName || ''}`.trim()
    : visitor.fullName || 'Unknown'

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const church = visitor.churchAffiliation || visitor.originalChurch || '—'
  const visitDate = new Date(visitor.visitedAt || visitor.dateOfAttendance || Date.now())
  const visitDateStr = visitDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const visitTimeStr = visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-montserrat">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-[#1a2a5e] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#b8c8e8] to-[#6a85c0] flex items-center justify-center text-white text-lg font-semibold border-2 border-white/25 flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-white font-semibold text-base">{fullName}</p>
              <p className="text-white/60 text-xs mt-0.5">🏛 {church}</p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {visitor.isFirstTime && (
                  <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-green-400/20 text-green-200">
                    ★ First Time Visitor
                  </span>
                )}
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/70">
                  {visitor.invitedBy ? 'Invited' : 'Walk-in'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Visitor Information */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2 pb-1.5 border-b border-gray-100">
              Visitor Information
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Full Name</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{fullName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Original Church</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{church}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Invited By</p>
                <p className={`text-sm font-semibold ${visitor.invitedBy ? 'text-[#1a2a5e]' : 'text-gray-400 italic'}`}>
                  {visitor.invitedBy || 'Walk-in'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Category</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">
                  {visitor.invitedBy ? 'Invited' : 'Walk-in'}
                </p>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2 pb-1.5 border-b border-gray-100">
              Visit Details
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Date of Visit
                </p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{visitDateStr}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Clock size={10} /> Time
                </p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{visitTimeStr}</p>
              </div>

              {/* Purpose of Visit — full width */}
              <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-2 flex items-center gap-1">
                  <FileText size={10} /> Purpose of Visit
                </p>
                {visitor.purposeOfVisit ? (
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    {visitor.purposeOfVisit}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No purpose provided.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onDelete(visitor)}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Remove Visitor
          </button>
          <button
            onClick={() => onEdit(visitor)}
            className="px-4 py-2 rounded-xl bg-[#1a2a5e] text-white text-sm font-medium hover:bg-[#253570] transition-colors"
          >
            Edit Visitor
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminVisitors = () => {
  // --- Data State ---
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ total: 0, week: 0, month: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterRef = useRef(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)  
  const [selectedVisitors, setSelectedVisitors] = useState([])
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])
  const [editingVisitorId, setEditingVisitorId] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')
  const [toastAction, setToastAction] = useState(null)
  const deleteTimeoutRef = useRef(null)
  const deletedVisitorsRef = useRef([])

  const [formData, setFormData] = useState({
    fullName: '',
    originalChurch: '',
    invitedBy: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
    purposeOfVisit: '',        
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
    };
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null)
    setToastType('success')
    setToastAction(null)
  }, [])

  const toastTimeoutRef = useRef(null)

  const showToast = useCallback((message, type = 'success', action = null) => {
    clearTimeout(toastTimeoutRef.current)

    setToast(message)
    setToastType(type)
    setToastAction(action)

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 5000)
  }, [])

  const fetchVisitors = useCallback(async () => {
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

  useEffect(() => { fetchVisitors() }, [fetchVisitors])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    return () => { clearTimeout(deleteTimeoutRef.current) }
  }, [])

  // --- Filter & Sort Logic ---
  const filteredVisitors = useMemo(() => {
    const search = debouncedSearch.toLowerCase()
    return visitors
      .filter(v => {
        const name = `${v.firstName || ''} ${v.lastName || v.fullName || ''}`.toLowerCase()
        const church = (v.churchAffiliation || v.originalChurch || '').toLowerCase()
        const matchesSearch = name.includes(search) || church.includes(search)
        const category = v.invitedBy ? 'Invited' : 'Walk-In'
        const matchesCategory = categoryFilter === 'All' || category === categoryFilter
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const aName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase()
          const bName = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase()
          return aName.localeCompare(bName)
        }
        if (sortBy === 'newest') return new Date(b.visitedAt) - new Date(a.visitedAt)
        if (sortBy === 'oldest') return new Date(a.visitedAt) - new Date(b.visitedAt)
        return 0
      })
  }, [visitors, debouncedSearch, categoryFilter, sortBy])

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSaveVisitor = async () => {
    if (!formData.fullName.trim() || !formData.originalChurch.trim()) {
      setFormErrors({ 
        fullName: !formData.fullName.trim() ? 'Required' : '',
        originalChurch: !formData.originalChurch.trim() ? 'Required' : ''
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingVisitorId) {
        const res = await axios.put(`${API_URL}/${editingVisitorId}`, formData, getAuthHeaders())
        setVisitors(prev => prev.map(v => v.id === editingVisitorId ? res.data : v))
        showToast('Visitor updated successfully!')
      } else {
        const res = await axios.post(API_URL, formData, getAuthHeaders())
        setVisitors(prev => [res.data, ...prev])
        showToast('Visitor saved successfully!')
      }
      const statsRes = await axios.get(`${API_URL}/stats`, getAuthHeaders())
      setStats(statsRes.data)
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      showToast('Error saving visitor.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingVisitorId(null)
    setFormData({
      fullName: '',
      originalChurch: '',
      invitedBy: '',
      dateOfVisit: new Date().toISOString().split('T')[0],
      purposeOfVisit: '',
    })
    setFormErrors({})
  }

  // --- Row Click → Detail Modal ---
  const handleRowClick = (visitor, e) => {
    // Don't open modal when clicking on the checkbox
    if (e.target.type === 'checkbox') return
    setSelectedVisitor(visitor)
  }

  // --- Detail Modal Actions ---
  const handleDetailDelete = (visitor) => {
    setSelectedVisitor(null)
    const ids = [visitor.id]
    const removed = [visitor]
    setPendingDeleteIds(ids)
    deletedVisitorsRef.current = removed

    clearTimeout(deleteTimeoutRef.current)
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.delete(API_URL, { ...getAuthHeaders(), data: { ids } })
        const statsRes = await axios.get(`${API_URL}/stats`, getAuthHeaders())
        setStats(statsRes.data)
        setVisitors(prev => prev.filter(v => !ids.includes(v.id)))
        setPendingDeleteIds([])
        deletedVisitorsRef.current = []
        dismissToast()
        showToast(`${ids.length} visitor(s) deleted successfully.`, 'success');
      } catch (error) {
        setPendingDeleteIds([])
        deletedVisitorsRef.current = []
        dismissToast()
        showToast('Failed to delete visitor.', 'error')
      }
    }, 5000)

    const handleUndo = () => {
      clearTimeout(deleteTimeoutRef.current)
      setPendingDeleteIds([])
      deletedVisitorsRef.current = []
      dismissToast()
    }

    showToast(`Visitor deleted`, 'error', { label: 'Undo', onClick: handleUndo })
  }

  const handleDetailEdit = (visitor) => {
    setEditingVisitorId(visitor.id)
    setFormData({
      fullName: visitor.firstName
        ? `${visitor.firstName} ${visitor.lastName || ''}`.trim()
        : visitor.fullName || '',
      originalChurch: visitor.churchAffiliation || visitor.originalChurch || '',
      invitedBy: visitor.invitedBy || '',
      dateOfVisit: visitor.visitedAt
        ? new Date(visitor.visitedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      purposeOfVisit: visitor.purposeOfVisit || '',
    })
    setSelectedVisitor(null)
    setShowAddModal(true)
  }

  // --- Selection & Bulk Delete ---
  const toggleSelectAll = () => {
    setSelectedVisitors(
      selectedVisitors.length === filteredVisitors.length
        ? []
        : filteredVisitors.map(v => v.id)
    )
  }

  const toggleSelect = (id) => {
    setSelectedVisitors(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    if (selectedVisitors.length === 0) return
    const ids = [...selectedVisitors]
    const removed = visitors.filter(v => ids.includes(v.id))

    setSelectedVisitors([])
    setPendingDeleteIds(ids)
    deletedVisitorsRef.current = removed

    clearTimeout(deleteTimeoutRef.current)
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.delete(API_URL, { ...getAuthHeaders(), data: { ids } })
        const statsRes = await axios.get(`${API_URL}/stats`, getAuthHeaders())
        setStats(statsRes.data)
        setVisitors(prev => prev.filter(v => !ids.includes(v.id)))
        setPendingDeleteIds([])
        deletedVisitorsRef.current = []
        dismissToast()
        showToast(`${ids.length} visitor(s) deleted successfully.`, 'success');
      } catch (error) {
        setPendingDeleteIds([])
        deletedVisitorsRef.current = []
        dismissToast()
        showToast('Failed to delete visitors. Restored.', 'error')
      }
    }, 5000)

    const handleUndo = () => {
      clearTimeout(deleteTimeoutRef.current)
      setPendingDeleteIds([])
      deletedVisitorsRef.current = []
      dismissToast()
    }

    showToast(`${ids.length} visitor(s) deleted`, 'error', { label: 'Undo', onClick: handleUndo })
  }

  // --- Export ---
  const handleExportCSV = () => {
    if (filteredVisitors.length === 0) {
      showToast('Nothing to export', 'error')
      return
    }
    showToast('Generating CSV file...', 'success')
    const headers = ["Full Name", "Original Church", "Invited By", "Visit Date", "Purpose of Visit"]
    const rows = filteredVisitors.map(v => [
      `"${v.firstName || ''} ${v.lastName || v.fullName || ''}"`,
      `"${v.churchAffiliation || v.originalChurch || ''}"`,
      `"${v.invitedBy || 'Walk-in'}"`,
      `"${new Date(v.visitedAt || v.dateOfAttendance).toLocaleDateString()}"`,
      `"${v.purposeOfVisit || ''}"`,
    ])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `CJC_Visitors_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
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
              onClick={() => { resetForm(); setShowAddModal(true) }}
              className="mt-6 bg-[#D9DFF2] text-[#4A558F] rounded-xl py-3 px-8 hover:bg-[#4A558F] hover:text-white transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add New Visitor
            </button>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{isLoading ? '...' : stats.week}</p>
              <p className="text-sm text-gray-500 mt-1">Visitors This Week</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{isLoading ? '...' : stats.month}</p>
              <p className="text-sm text-gray-500 mt-1">Visitors This Month</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{isLoading ? '...' : stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">Overall Visitors</p>
            </div>
          </div>

          {/* Data Table */}
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
                  <div className="relative" ref={filterRef}>
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#4A558F] transition-all bg-white"                    >
                      <Filter size={16} /> Filter & Sort
                      <ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden p-2 animate-slide-up">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</div>
                        {['All', 'Invited', 'Walk-In'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => { setCategoryFilter(opt); setShowFilterDropdown(false) }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === opt ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {opt}
                          </button>
                        ))}
                        <div className="my-1 border-t border-gray-100"></div>
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort By</div>
                        {[
                          { label: 'Name', val: 'name' },
                          { label: 'Newest Visit', val: 'newest' },
                          { label: 'Oldest Visit', val: 'oldest' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => { setSortBy(opt.val); setShowFilterDropdown(false) }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === opt.val ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:text-[#4A558F] hover:border-[#4A558F] transition-all bg-white"
                  >
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {selectedVisitors.length > 0 && (
                <div className="mt-3 flex items-center justify-between bg-[#D9DFF2]/50 rounded-lg px-4 py-2 animate-slide-up">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#4A558F] font-medium">{selectedVisitors.length} selected</span>
                    <button onClick={() => setSelectedVisitors([])} className="text-xs text-gray-500 hover:underline">Clear Selection</button>
                  </div>
                  <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors font-medium">
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
                    {filteredVisitors.map((visitor, index) => {
                      const isPendingDelete = pendingDeleteIds.includes(visitor.id)
                      return (
                        <tr
                          key={visitor.id}
                          onClick={(e) => !isPendingDelete && handleRowClick(visitor, e)}
                          className={`border-b border-gray-100 transition-colors ${
                            isPendingDelete
                              ? 'bg-red-50'
                              : index % 2 === 0
                                ? 'bg-white hover:bg-[#D9DFF2]/20 cursor-pointer'
                                : 'bg-gray-50/50 hover:bg-[#D9DFF2]/20 cursor-pointer'
                          }`}
                        >
                          <td className="py-3 px-5">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedVisitors.includes(visitor.id)}
                              onChange={() => toggleSelect(visitor.id)}
                              disabled={isPendingDelete}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isPendingDelete ? 'text-red-700' : 'text-gray-700'}`}>
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
                            {isPendingDelete ? (
                              <div className="flex items-center gap-1.5 text-red-500 text-[10px] mt-0.5">
                                <Loader2 size={12} className="animate-spin" /> Deleting...
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-0.5">
                                <Clock size={12} />
                                {new Date(visitor.visitedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Visitor Detail Modal ─────────────────────────────────────────── */}
      {selectedVisitor && (
        <VisitorDetailModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
          onDelete={handleDetailDelete}
          onEdit={handleDetailEdit}
        />
      )}

      {/* ── Add / Edit Visitor Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-montserrat">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <button
                onClick={() => { setShowAddModal(false); resetForm() }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-[#4A558F]" />
              </button>
              <h3 className="text-lg font-semibold text-[#4A558F]">{editingVisitorId ? 'Edit Visitor' : 'Add New Visitor'}</h3>
            </div>

            <div className="p-5">
              <FloatingLabelInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={formErrors.fullName}
                icon={User}
              />
              <FloatingLabelInput
                label="Original Church"
                name="originalChurch"
                value={formData.originalChurch}
                onChange={handleInputChange}
                error={formErrors.originalChurch}
                icon={Building2}
              />
              <FloatingLabelInput
                label="Invited By (Optional)"
                name="invitedBy"
                value={formData.invitedBy}
                onChange={handleInputChange}
              />
              <FloatingLabelInput
                label="Date of Visit"
                name="dateOfVisit"
                value={formData.dateOfVisit}
                onChange={handleInputChange}
                type="date"
                icon={Calendar}
              />

              <FloatingLabelTextarea
                label="Purpose of Visit (Optional)"
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleInputChange}
                icon={FileText}
              />

              <div className="flex gap-3 mt-8">
                <button
                  disabled={isSubmitting}
                  onClick={() => { setShowAddModal(false); resetForm() }}
                  className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSaveVisitor}
                  className="flex-1 bg-[#4A558F] text-white rounded-xl py-3 hover:bg-[#3a4575] transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <Loader2 size={18} className="animate-spin" />
                    : editingVisitorId
                      ? <><FileText size={18} /> Update Visitor</>
                      : <><Plus size={18} /> Save Visitor</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toastType === 'success'
              ? <CheckCircle size={18} />
              : <Loader2 size={18} className="animate-spin" />
            }
            {toast}
            {toastAction && (
              <button
                onClick={toastAction.onClick}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-bold"
              >
                <Undo2 size={14} />
                {toastAction.label}
              </button>
            )}
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
