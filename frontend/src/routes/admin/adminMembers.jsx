import React, { useState, useRef, useEffect, useCallback } from 'react'
import AdminNavbar from '../../components/adminNavbar'
import Footer from '../../components/footer'
import { Search, Filter, Download, Plus, ArrowLeft, User, Phone, MapPin, Calendar, CheckCircle, X, ChevronDown, Trash2, AlertCircle } from 'lucide-react'

const initialMembers = [
  { id: 1, firstName: 'Juan', middleInitial: 'D', lastName: 'Dela Cruz', status: 'Old Member', memberSince: '2024-01-15' },
  { id: 2, firstName: 'Maria', middleInitial: 'S', lastName: 'Santos', status: 'New Member', memberSince: '2026-04-20' },
  { id: 3, firstName: 'Pedro', middleInitial: 'R', lastName: 'Reyes', status: 'Old Member', memberSince: '2023-11-05' },
  { id: 4, firstName: 'Ana', middleInitial: 'G', lastName: 'Garcia', status: 'New Member', memberSince: '2026-05-01' },
  { id: 5, firstName: 'Jose', middleInitial: 'M', lastName: 'Mendoza', status: 'Old Member', memberSince: '2022-08-12' },
  { id: 6, firstName: 'Luz', middleInitial: 'T', lastName: 'Torres', status: 'New Member', memberSince: '2026-04-28' },
  { id: 7, firstName: 'Carlos', middleInitial: 'B', lastName: 'Bautista', status: 'Old Member', memberSince: '2025-03-10' },
  { id: 8, firstName: 'Rosa', middleInitial: 'L', lastName: 'Lopez', status: 'Old Member', memberSince: '2024-06-22' },
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

const AdminMembers = () => {
  const [members, setMembers] = useState(initialMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    contactNo: '',
    address: '',
    gender: '',
    memberSince: new Date().toISOString().split('T')[0],
    status: 'New Member',
  })
  const [formErrors, setFormErrors] = useState({})

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const showToast = useCallback((message, type = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const filteredMembers = members.filter(member => {
    const search = debouncedSearch.toLowerCase()
    const fullName = `${member.firstName} ${member.middleInitial} ${member.lastName}`.toLowerCase()
    return (
      fullName.includes(search) ||
      member.status.toLowerCase().includes(search) ||
      member.memberSince.includes(search)
    )
  })

  const newMembersCount = members.filter(m => m.status === 'New Member').length
  const oldMembersCount = members.filter(m => m.status === 'Old Member').length

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.contactNo.trim()) errors.contactNo = 'Contact number is required'
    if (!formData.gender) errors.gender = 'Please select a gender'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddMember = () => {
    if (!validateForm()) return

    const newMember = {
      id: Date.now(),
      firstName: formData.firstName.trim(),
      middleInitial: formData.middleInitial.trim().toUpperCase() || '-',
      lastName: formData.lastName.trim(),
      status: formData.status,
      memberSince: formData.memberSince || '-',
    }
    setMembers(prev => [newMember, ...prev])
    resetForm()
    setShowModal(false)
    showToast('Member added successfully!')
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleInitial: '',
      lastName: '',
      contactNo: '',
      address: '',
      gender: '',
      memberSince: new Date().toISOString().split('T')[0],
      status: 'New Member',
    })
    setFormErrors({})
  }

  const handleBulkDelete = () => {
    if (selectedMembers.length === 0) return
    setMembers(prev => prev.filter(m => !selectedMembers.includes(m.id)))
    setSelectedMembers([])
    showToast(`${selectedMembers.length} member(s) deleted.`, 'error')
  }

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
              <p className="font-bold text-3xl text-[#4A558F]">{newMembersCount}</p>
              <p className="text-sm text-gray-500 mt-1">New Members</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{oldMembersCount}</p>
              <p className="text-sm text-gray-500 mt-1">Old Members</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col items-center">
              <p className="font-bold text-3xl text-[#4A558F]">{members.length}</p>
              <p className="text-sm text-gray-500 mt-1">Overall Members</p>
            </div>
          </div>

          {/* Data Management Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-[#4A558F]">Members</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 flex-1 sm:flex-none sm:w-64 focus-within:border-[#4A558F] transition-colors">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full ml-2 focus:outline-none text-sm"
                    />
                  </div>

                  {/* Filter */}
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Filter size={16} />
                    Filter
                  </button>

                  {/* Export */}
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A558F] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedMembers.length > 0 && (
                <div className="mt-3 flex items-center gap-3 bg-[#D9DFF2]/50 rounded-lg px-4 py-2">
                  <span className="text-sm text-[#4A558F]">{selectedMembers.length} selected</span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No members found.</p>
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
                          checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          First Name <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Middle Initial <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Last Name <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Status <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium cursor-pointer hover:text-[#4A558F]">
                        <div className="flex items-center gap-1">
                          Member Since <ChevronDown size={14} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr
                        key={member.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-3 px-5">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => toggleSelect(member.id)}
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-700">{member.firstName}</td>
                        <td className="py-3 px-4 text-gray-700">{member.middleInitial}</td>
                        <td className="py-3 px-4 text-gray-700">{member.lastName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              member.status === 'Old Member'
                                ? 'bg-[#D9DFF2] text-[#4A558F]'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            <CheckCircle size={12} />
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{member.memberSince}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-[#4A558F]" />
              </button>
              <h3 className="text-lg font-semibold text-[#4A558F]">Add New Member</h3>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-4">
                <FloatingLabelInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Juan" error={formErrors.firstName} icon={User} />
                <FloatingLabelInput label="Middle Initial" name="middleInitial" value={formData.middleInitial} onChange={handleInputChange} placeholder="D" maxLength={1} />
              </div>
              <FloatingLabelInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Dela Cruz" error={formErrors.lastName} />
              <FloatingLabelInput label="Contact No." name="contactNo" value={formData.contactNo} onChange={handleInputChange} type="tel" placeholder="09XXXXXXXXX" error={formErrors.contactNo} icon={Phone} />
              <FloatingLabelInput label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St, City" icon={MapPin} />

              {/* Gender */}
              <div className="relative mt-4">
                <label className="block text-sm text-gray-600 mb-2 font-medium">Gender</label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.gender === 'Male' ? 'border-[#4A558F] bg-[#D9DFF2]/50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.gender === 'Male' ? 'border-[#4A558F]' : 'border-gray-300'
                    }`}>
                      {formData.gender === 'Male' && <div className="w-2 h-2 rounded-full bg-[#4A558F]" />}
                    </div>
                    <span className="text-sm">Male</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.gender === 'Female' ? 'border-[#4A558F] bg-[#D9DFF2]/50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.gender === 'Female' ? 'border-[#4A558F]' : 'border-gray-300'
                    }`}>
                      {formData.gender === 'Female' && <div className="w-2 h-2 rounded-full bg-[#4A558F]" />}
                    </div>
                    <span className="text-sm">Female</span>
                  </label>
                </div>
                {formErrors.gender && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.gender}</p>}
              </div>

              {/* Member Since & Status */}
              <div className="grid grid-cols-2 gap-x-4 mt-4">
                <FloatingLabelInput label="Member Since" name="memberSince" value={formData.memberSince} onChange={handleInputChange} type="date" icon={Calendar} />
                <div className="relative mt-4">
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
                  <label className="absolute left-4 top-0 -translate-y-1/2 text-xs text-[#4A558F] bg-white px-1">
                    Status
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 bg-gray-200 text-gray-600 rounded-xl py-3 hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-[#4A558F] text-white rounded-xl py-3 hover:bg-[#3a4575] transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Member
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

export default AdminMembers
