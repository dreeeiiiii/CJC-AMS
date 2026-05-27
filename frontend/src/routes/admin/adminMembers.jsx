import React, { useState, useEffect, useCallback, useRef } from 'react'
import AdminNavbar from '../../components/adminNavbar'
import Footer from '../../components/footer'
import TestimonyApprovalSidebar from '../../components/testimonyApprovalSidebar'
import { 
  Search, Filter, Plus, ArrowLeft, User, Phone, 
  MapPin, CheckCircle, X, ChevronDown, Trash2, 
  AlertCircle, Loader2, Download, Undo2, Calendar,
} from 'lucide-react'

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

const MemberDetailModal = ({ member, onClose, onDelete, onEdit }) => {
  if (!member) return null

  const fullName = `${member.firstName} ${member.lastName}`.trim()
  const initials = (member.firstName?.[0] || '') + (member.lastName?.[0] || '')
  const memberSince = member.joinDate
    ? new Date(member.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-montserrat">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-[#1a2a5e] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#b8c8e8] to-[#6a85c0] flex items-center justify-center text-white text-lg font-semibold border-2 border-white/25 flex-shrink-0 overflow-hidden">
              {member.profileImage ? (
                <img src={member.profileImage} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-base">{fullName}</p>
              <p className="text-white/60 text-xs mt-0.5">ID: {member.id}</p>
              <div className="flex gap-2 mt-1.5">
                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                  member.status === 'Old Member'
                    ? 'bg-white/10 text-white/70'
                    : 'bg-green-400/20 text-green-200'
                }`}>
                  {member.status === 'Old Member' ? '◉ Old Member' : '✦ New Member'}
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

          {/* Personal Information */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2 pb-1.5 border-b border-gray-100">
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">First Name</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.firstName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Last Name</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.lastName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Middle Name</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.middleName || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Email</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.email || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Gender</p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.gender || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.status === 'Old Member' ? 'bg-[#D9DFF2] text-[#4A558F]' : 'bg-green-100 text-green-700'
                }`}>
                  {member.status}
                </span>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <MapPin size={10} /> Address
                </p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.address || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Phone size={10} /> Contact No.
                </p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{member.contactNo || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Member Since
                </p>
                <p className="text-sm font-semibold text-[#1a2a5e]">{memberSince}</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2 pb-1.5 border-b border-gray-100">
              Attendance Summary
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Total</p>
                <p className="text-xl font-bold text-[#1a2a5e]">{member.totalAttendance ?? 0}</p>
                <p className="text-[10px] text-gray-400">sessions</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-medium mb-1">This Month</p>
                <p className="text-xl font-bold text-[#1a2a5e]">{member.monthlyAttendance ?? 0}</p>
                <p className="text-[10px] text-gray-400">sessions</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Testimonies</p>
                <p className="text-xl font-bold text-[#1a2a5e]">{member.testimonyCount ?? 0}</p>
                <p className="text-[10px] text-gray-400">submitted</p>
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
            onClick={() => onDelete(member)}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Remove Member
          </button>
          <button
            onClick={() => onEdit(member)}
            className="px-4 py-2 rounded-xl bg-[#1a2a5e] text-white text-sm font-medium hover:bg-[#253570] transition-colors"
          >
            Edit Member
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminMembers = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')
  const [toastAction, setToastAction] = useState(null)
  const deleteTimeoutRef = useRef(null)
  const deletedMembersRef = useRef([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMemberId, setEditingMemberId] = useState(null)

  // --- Filter and Sort State ---
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest') 
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    contactNo: '',
    email: '',
    address: '',
    gender: '',
    status: 'New Member',
    joinDate: '',
    mode: 'admin'
  })
  const [formErrors, setFormErrors] = useState({})

  // Merged: keep getAuthHeader helper AND define dismissToast/showToast
  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })

  const dismissToast = useCallback(() => {
    setToast(null)
    setToastType('success')
    setToastAction(null)
  }, [])

  const showToast = useCallback((message, type = 'success', action = null) => {
    setToast(message)
    setToastType(type)
    setToastAction(action)
    setTimeout(() => setToast(null), 5000)
  }, [])

  // Fetch Members — uses getAuthHeader, includes 401 guard from the other branch
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: getAuthHeader(),
      })

      if (response.status === 401) {
        showToast('Unauthorized. Please login again.', 'error')
        return
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }

      setMembers(data)
    } catch (error) {
      console.error(error)
      showToast('Failed to load members', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Click outside listener for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    return () => {
      clearTimeout(deleteTimeoutRef.current)
    }
  }, [])

  // 📌 Combined Filter and Sort Logic
  const filteredMembers = members
    .filter(member => {
      const search = debouncedSearch.toLowerCase()
      const fullName = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.toLowerCase()
      const matchesSearch = fullName.includes(search) || member.status?.toLowerCase().includes(search)
      const matchesStatus = statusFilter === 'All' || member.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'firstName') return a.firstName.localeCompare(b.firstName)
      if (sortBy === 'lastName') return a.lastName.localeCompare(b.lastName)
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      return 0
    })

  const newMembersCount = members.filter(m => m.status === 'New Member').length
  const oldMembersCount = members.filter(m => m.status === 'Old Member').length

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.contactNo.trim()) errors.contactNo = 'Contact number is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.gender) errors.gender = 'Please select a gender'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddMember = async () => {
    if (!validateForm()) return
    try {
      const url = editingMemberId
        ? `http://localhost:5000/api/users/${editingMemberId}`
        : 'http://localhost:5000/api/users'
      const response = await fetch(url, {
        method: editingMemberId ? 'PUT' : 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        showToast(editingMemberId ? 'Member updated successfully!' : 'Member added successfully!');
        resetForm();
        setShowModal(false);
        fetchMembers();
      } else {
        const err = await response.json();
        showToast(err.message || "Error saving member", "error");
      }
    } catch (error) {
      showToast("Server error", "error");
    }
  }

  const resetForm = () => {
    setEditingMemberId(null)
    setFormData({ firstName: '', middleName: '', lastName: '', email: '', contactNo: '', address: '', gender: '', status: 'New Member', joinDate: '', mode: 'admin' })
    setFormErrors({})
  }

  const handleBulkDelete = () => {
    if (selectedMembers.length === 0) return
    const ids = [...selectedMembers]
    const removed = members.filter(m => ids.includes(m.id))

    setSelectedMembers([])
    setPendingDeleteIds(ids)
    deletedMembersRef.current = removed

    clearTimeout(deleteTimeoutRef.current)
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await Promise.all(ids.map(id =>
          fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE', headers: getAuthHeader() })
        ))
        setMembers(prev => prev.filter(m => !ids.includes(m.id)))
        setPendingDeleteIds([])
        deletedMembersRef.current = []
        dismissToast()
        showToast(`${ids.length} member(s) deleted successfully.`, 'success');
      } catch (error) {
        setPendingDeleteIds([])
        deletedMembersRef.current = []
        dismissToast()
        showToast('Failed to delete members.', 'error')
      }
    }, 5000)

    const handleUndo = () => {
      clearTimeout(deleteTimeoutRef.current)
      setPendingDeleteIds([])
      deletedMembersRef.current = []
      dismissToast()
    }

    showToast(`${ids.length} member(s) deleted`, 'error', { label: 'Undo', onClick: handleUndo })
  }

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      showToast("No data to export", "error");
      return;
    }
    showToast('Generating CSV file...', 'success')
    const headers = ["First Name", "Middle Name", "Last Name", "Email","Contact No", "Gender", "Status", "Address", "Date Registered"];
    const rows = filteredMembers.map(m => [
      `"${m.firstName}"`,
      `"${m.middleName || ''}"`,
      `"${m.lastName}"`,
      `"${m.email || ''}"`,
      `"${m.contactNo || ''}"`,
      `"${m.gender || ''}"`,
      `"${m.status}"`,
      `"${(m.address || '').replace(/"/g, '""')}"`,
      `"${new Date(m.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CJC_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id))
    }
  }

  const toggleSelect = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleRowClick = (member, e) => {
    if (e.target.type === 'checkbox') return
    setSelectedMember(member)
  }

  const handleDetailDelete = (member) => {
    setSelectedMember(null)
    const ids = [member.id]
    const removed = [member]
    setPendingDeleteIds(ids)
    deletedMembersRef.current = removed

    clearTimeout(deleteTimeoutRef.current)
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`http://localhost:5000/api/users/${member.id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        })
        setMembers(prev => prev.filter(m => m.id !== member.id))
        setPendingDeleteIds([])
        deletedMembersRef.current = []
        dismissToast()
        showToast(`1 member(s) deleted successfully.`, 'success');
      } catch (error) {
        setPendingDeleteIds([])
        deletedMembersRef.current = []
        dismissToast()
        showToast('Failed to delete member.', 'error')
      }
    }, 5000)

    const handleUndo = () => {
      clearTimeout(deleteTimeoutRef.current)
      setPendingDeleteIds([])
      deletedMembersRef.current = []
      dismissToast()
    }

    showToast(`Member deleted`, 'error', { label: 'Undo', onClick: handleUndo })
  }

  const handleDetailEdit = (member) => {
    setEditingMemberId(member.id)
    setFormData({
      firstName: member.firstName || '',
      middleName: member.middleName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      contactNo: member.contactNo || '',
      address: member.address || '',
      gender: member.gender || '',
      status: member.status || 'New Member',
      joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : '',
      mode: 'admin',
    })
    setSelectedMember(null)
    setShowModal(true)
  }

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-gradient-to-b from-[#D9DFF2]/30 to-white pb-8 font-montserrat">
        <div className="max-w-7xl mx-auto px-4">

          {/* Hero Section */}
          <div className="text-center py-8">
            <h2 className="text-4xl font-semibold text-[#4A558F]">CJC MEMBERS</h2>
            <p className="text-gray-500 mt-2 text-sm">Manage and track all registered members.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 bg-[#4A558F] text-white rounded-xl py-3 px-8 hover:bg-[#3a4575] transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add New Member
            </button>
          </div>

          {/* KPI Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{loading ? '...' : newMembersCount}</p>
              <p className="text-sm text-gray-500 mt-1">New Members</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{loading ? '...' : oldMembersCount}</p>
              <p className="text-sm text-gray-500 mt-1">Old Members</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{loading ? '...' : members.length}</p>
              <p className="text-sm text-gray-500 mt-1">Overall Members</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">

          {/* Left Column */}
          <div>
          {/* Data Management Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-[#4A558F]">Members List</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  
                  {/* Filter & Sort Dropdown */}

                  <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 flex-1 sm:flex-none sm:w-64 focus-within:border-[#4A558F] transition-colors bg-white">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full ml-2 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="relative" ref={filterRef}>
                    <button 
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#4A558F] transition-all bg-white"
                    >
                      <Filter size={16} />
                      <span>Filter & Sort</span>
                      <ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden p-2 animate-slide-up">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filter Status</div>
                        {['All', 'New Member', 'Old Member'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => { setStatusFilter(opt); setShowFilterDropdown(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === opt ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {opt}
                          </button>
                        ))}
                        <div className="my-1 border-t border-gray-100"></div>
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort By</div>
                        {[
                          { label: 'First Name', val: 'firstName' },
                          { label: 'Last Name', val: 'lastName' },
                          { label: 'Newest Registered', val: 'newest' },
                          { label: 'Oldest Registered', val: 'oldest' }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => { setSortBy(opt.val); setShowFilterDropdown(false); }}
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
                    <Download size={16} />
                    Export
                  </button>

                </div>
              </div>

              {selectedMembers.length > 0 && (
                <div className="mt-3 flex items-center justify-between gap-3 bg-[#D9DFF2]/50 rounded-lg px-4 py-2 animate-slide-up">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#4A558F] font-medium">{selectedMembers.length} selected</span>
                    <button onClick={() => setSelectedMembers([])} className="text-xs text-gray-500 hover:underline">Clear Selection</button>
                  </div>
                  <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors font-medium">
                    <Trash2 size={14} /> Delete Selected
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#4A558F] mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Fetching members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No members found.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#D9DFF2]/50">
                    <tr className="text-left">
                      <th className="py-3 px-5 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium">First Name</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Middle Initial</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Last Name</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Email</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Status</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Member Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => {
                      const isPendingDelete = pendingDeleteIds.includes(member.id)
                      return (
                      <tr
                        key={member.id}
                        onClick={(e) => !isPendingDelete && handleRowClick(member, e)}
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
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => toggleSelect(member.id)}
                            disabled={isPendingDelete}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className={isPendingDelete ? 'text-red-700' : 'text-gray-700'}>{member.firstName}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{member.middleName ? member.middleName.charAt(0).toUpperCase() + '.' : '-'}</td>
                        <td className="py-3 px-4">
                          <span className={isPendingDelete ? 'text-red-700' : 'text-gray-700'}>{member.lastName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={isPendingDelete ? 'text-red-700' : 'text-gray-700'}>{member.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            member.status === 'Old Member' ? 'bg-[#D9DFF2] text-[#4A558F]' : 'bg-green-100 text-green-700'
                          }`}>
                            <CheckCircle size={12} /> {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-500">{new Date(member.joinDate).toLocaleDateString()}</span>
                          {isPendingDelete && (
                            <div className="flex items-center gap-1.5 text-red-500 text-[10px] mt-0.5">
                              <Loader2 size={12} className="animate-spin" />
                              Deleting...
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

          {/* Right Column */}
          <div>
            <TestimonyApprovalSidebar showToast={showToast} />
          </div>

        </div>
      </div>
      </div>

      {/* ── Member Detail Modal ─────────────────────────────────────────── */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onDelete={handleDetailDelete}
          onEdit={handleDetailEdit}
        />
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-montserrat">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-[#4A558F]" />
              </button>
              <h3 className="text-lg font-semibold text-[#4A558F]">{editingMemberId ? 'Edit Member' : 'Add New Member'}</h3>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-4">
                <FloatingLabelInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Juan" error={formErrors.firstName} icon={User} />
                <FloatingLabelInput label="Middle Name" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Middle" />
              </div>
              <FloatingLabelInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Dela Cruz" error={formErrors.lastName} />
              <FloatingLabelInput label="Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email...." error={formErrors.email} />
              <FloatingLabelInput label="Contact No." name="contactNo" value={formData.contactNo} onChange={handleInputChange} type="tel" placeholder="09XXXXXXXXX" error={formErrors.contactNo} icon={Phone} />
              <FloatingLabelInput label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St, City" icon={MapPin} />
            
              <div className="relative mt-4">
                <label className="block text-sm text-gray-600 mb-2 font-medium">Gender</label>
                <div className="flex gap-4">
                  {['Male', 'Female'].map((g) => (
                    <label key={g} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.gender === g ? 'border-[#4A558F] bg-[#D9DFF2]/50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleInputChange} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.gender === g ? 'border-[#4A558F]' : 'border-gray-300'}`}>
                        {formData.gender === g && <div className="w-2 h-2 rounded-full bg-[#4A558F]" />}
                      </div>
                      <span className="text-sm">{g}</span>
                    </label>
                  ))}
                </div>
                {formErrors.gender && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.gender}</p>}
              </div>

              <div className="relative mt-8">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="peer w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A558F] transition-colors text-sm appearance-none bg-white"
                >
                  <option value="New Member">New Member</option>
                  <option value="Old Member">Old Member</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <label className="absolute left-4 top-0 -translate-y-1/2 text-xs text-[#4A558F] bg-white px-1">Status</label>
              </div>

              {editingMemberId && (
                <FloatingLabelInput label="Member Since" name="joinDate" value={formData.joinDate} onChange={handleInputChange} type="date" />
              )}

              <div className="flex gap-3 mt-8">
                <button onClick={() => { setShowModal(false); resetForm() }} className="flex-1 bg-gray-200 text-gray-600 rounded-xl py-3 hover:bg-gray-300 transition-colors text-sm font-medium">Cancel</button>
                <button onClick={handleAddMember} className="flex-1 bg-[#4A558F] text-white rounded-xl py-3 hover:bg-[#3a4575] transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2">
                  <Plus size={18} /> {editingMemberId ? 'Update Member' : 'Add Member'}
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
            {toastType === 'success' ? <CheckCircle size={18} /> : <Loader2 size={18} className="animate-spin" />}
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default AdminMembers;
