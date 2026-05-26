import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import AdminNavbar from "../../components/adminNavbar"
import Footer from '../../components/footer'
import { 
  Search, Printer, Trash2, CheckCircle, Loader2, 
  Undo2, AlertCircle, X, Filter, ChevronDown
} from 'lucide-react'

const AdminAttendance = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState([])
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')
  const [toastAction, setToastAction] = useState(null)
  const deleteTimeoutRef = useRef(null)
  const deletedRecordsRef = useRef([])

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/attendance`, getAuthHeader())
      setRecords(response.data)
    } catch (error) {
      showToast("Failed to load attendance records", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  useEffect(() => {
    return () => clearTimeout(deleteTimeoutRef.current)
  }, [])

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

  const groups = [...new Set(records.map(r => r.group))].sort()

  const filteredRecords = records.filter(record => {
    const search = searchTerm.toLowerCase()
    const nameMatch = record.name.toLowerCase().includes(search)
    const dateMatch = !dateFilter || record.date === dateFilter
    const grpMatch = groupFilter === 'All' || record.group === groupFilter
    return nameMatch && dateMatch && grpMatch
  })

  const toggleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(filteredRecords.map(r => r.id))
    }
  }

  const toggleSelect = (id) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    if (selectedRecords.length === 0) return
    const ids = [...selectedRecords]
    const removed = records.filter(r => ids.includes(r.id))

    setSelectedRecords([])
    setPendingDeleteIds(ids)
    deletedRecordsRef.current = removed

    clearTimeout(deleteTimeoutRef.current)
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        const config = getAuthHeader()
        await Promise.all(ids.map(id =>
          fetch(`${API_BASE_URL}/api/attendance/${id}`, {
            method: 'DELETE',
            headers: config.headers
          })
        ))
        setRecords(prev => prev.filter(r => !ids.includes(r.id)))
        setPendingDeleteIds([])
        deletedRecordsRef.current = []
        dismissToast()
        showToast(`${ids.length} record(s) deleted successfully.`, 'success')
      } catch (error) {
        setPendingDeleteIds([])
        deletedRecordsRef.current = []
        dismissToast()
        showToast('Failed to delete records.', 'error')
      }
    }, 5000)

    const handleUndo = () => {
      clearTimeout(deleteTimeoutRef.current)
      setPendingDeleteIds([])
      deletedRecordsRef.current = []
      dismissToast()
    }

    showToast(`${ids.length} record(s) deleted`, 'error', { label: 'Undo', onClick: handleUndo })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-gradient-to-b from-[#D9DFF2]/30 to-white pb-8 font-montserrat">
        <div className="max-w-7xl mx-auto px-4">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start lg:items-center justify-between py-8 gap-4">
            <div className="text-left md:text-center w-full">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#4A558F]">
                ATTENDANCE RECORDS
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Manage recorded attendance.
              </p>
            </div>
          </div>

          {/* Main Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search */}
                <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 flex-1 sm:flex-none sm:w-72 focus-within:border-[#4A558F] transition-colors bg-white">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ml-2 focus:outline-none text-sm"
                  />
                </div>

                {/* Date Filter + Group Filter + Print */}
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#4A558F] transition-colors"
                  />

                  <div className="relative">
                    <button
                      onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#4A558F] transition-all bg-white"
                    >
                      <Filter size={16} />
                      <span>{groupFilter === 'All' ? 'Group' : groupFilter}</span>
                      <ChevronDown size={14} className={`transition-transform ${showGroupDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showGroupDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden p-2 animate-slide-up">
                        <button
                          onClick={() => { setGroupFilter('All'); setShowGroupDropdown(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${groupFilter === 'All' ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          All 
                        </button>
                        {groups.map(g => (
                          <button
                            key={g}
                            onClick={() => { setGroupFilter(g); setShowGroupDropdown(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${groupFilter === g ? 'bg-[#D9DFF2] text-[#4A558F] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:text-[#4A558F] hover:border-[#4A558F] transition-all bg-white"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                </div>
              </div>

              {/* Delete Selected Bar */}
              {selectedRecords.length > 0 && (
                <div className="mt-3 flex items-center justify-between gap-3 bg-[#D9DFF2]/50 rounded-lg px-4 py-2 animate-slide-up">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#4A558F] font-medium">{selectedRecords.length} selected</span>
                    <button onClick={() => setSelectedRecords([])} className="text-xs text-gray-500 hover:underline">Clear Selection</button>
                  </div>
                  <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors font-medium">
                    <Trash2 size={14} /> Delete Selected
                  </button>
                </div>
              )}
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#4A558F] mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Fetching attendance records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No attendance records found.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#D9DFF2]/50">
                    <tr className="text-left">
                      <th className="py-3 px-5 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={filteredRecords.length > 0 && selectedRecords.length === filteredRecords.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Name</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Group</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Date</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const isPendingDelete = pendingDeleteIds.includes(record.id)
                      return (
                        <tr
                          key={record.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            isPendingDelete
                              ? 'bg-red-50'
                              : index % 2 === 0
                                ? 'bg-white'
                                : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="py-3 px-5">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedRecords.includes(record.id)}
                              onChange={() => toggleSelect(record.id)}
                              disabled={isPendingDelete}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className={isPendingDelete ? 'text-red-700' : 'text-gray-700'}>{record.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.group === 'Mommies' || record.group === 'Daddies'
                                ? 'bg-[#D9DFF2] text-[#4A558F]'
                                : record.group === 'YouthCampus' || record.group === 'YouthAdult'
                                  ? 'bg-green-100 text-green-700'
                                  : record.group === 'Kids'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                              {record.group}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{record.date}</td>
                          <td className="py-3 px-4 text-gray-500">
                            {record.time}
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
      </div>

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

export default AdminAttendance
