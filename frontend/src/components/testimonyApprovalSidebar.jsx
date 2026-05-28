import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:5000'

const initials = (name) =>
  name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

const avatarBg = (idx) => {
  const gradients = [
    'from-[#c8d0f0] to-[#8fa3d8]',
    'from-[#f0d0c8] to-[#d8a090]',
    'from-[#c8e0d0] to-[#80b890]',
    'from-[#d8d0f0] to-[#a090d8]',
    'from-[#f0e8c8] to-[#d8c890]',
    'from-[#c8e8f0] to-[#80b8c8]',
  ]
  return gradients[idx % gradients.length]
}

const TestimonyApprovalSidebar = ({ showToast }) => {
  const [testimonies, setTestimonies] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])
  const deleteTimeoutRef = useRef(null)
  const deletedTestimoniesRef = useRef([])

  const fetchTestimonies = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API}/api/testimonies?status=all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTestimonies(res.data)
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonies()
  }, [fetchTestimonies])

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API}/api/testimonies/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setTestimonies((prev) => prev.filter((t) => t._id || t.id !== id))
      showToast?.('Testimony approved', 'success')
    } catch (error) {
      console.error("Approval Error:", error.response?.data || error.message)
      showToast?.(error.response?.data?.message || 'Failed to approve testimony', 'error')
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API}/api/testimonies/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setTestimonies((prev) => prev.filter((t) => t._id || t.id !== id))
      showToast?.('Testimony rejected', 'error')
    } catch (error) {
      console.error("Rejection Error:", error.response?.data || error.message)
      showToast?.(error.response?.data?.message || 'Failed to reject testimony', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (pendingDeleteIds.includes(id)) return
    const testimony = testimonies.find((t) => (t._id || t.id) === id)
    if (!testimony) return

    setPendingDeleteIds((prev) => [...prev, id])
    deletedTestimoniesRef.current = [...deletedTestimoniesRef.current, testimony]
    setTestimonies((prev) => prev.filter((t) => (t._id || t.id) !== id))

    clearTimeout(deleteTimeoutRef.current)
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API}/api/testimonies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPendingDeleteIds((prev) => prev.filter((pid) => pid !== id))
        deletedTestimoniesRef.current = deletedTestimoniesRef.current.filter(
          (t) => (t._id || t.id) !== id,
        )
        showToast?.('Testimony deleted permanently', 'success')
      } catch (error) {
        setPendingDeleteIds((prev) => prev.filter((pid) => pid !== id))
        setTestimonies((prev) => [...prev, testimony])
        deletedTestimoniesRef.current = deletedTestimoniesRef.current.filter(
          (t) => (t._id || t.id) !== id,
        )
        showToast?.(error.response?.data?.message || 'Failed to delete testimony', 'error')
      }
    }, 5000)

    const handleUndo = () => {
      clearTimeout(deleteTimeoutRef.current)
      setPendingDeleteIds((prev) => prev.filter((pid) => pid !== id))
      setTestimonies((prev) => [...prev, testimony])
      deletedTestimoniesRef.current = deletedTestimoniesRef.current.filter(
        (t) => (t._id || t.id) !== id,
      )
    }

    showToast?.('Testimony deleted', 'error', { label: 'Undo', onClick: handleUndo })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#4A558F]">Testimony Management</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Approve, reject, or manage posted testimonies</p>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 text-xs font-semibold py-3 px-4 transition-colors relative ${
            activeTab === 'pending'
              ? 'text-[#4A558F]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Pending
          {testimonies.filter((t) => t.status === 'pending').length > 0 && (
            <span className="ml-1.5 bg-[#D9DFF2] text-[#4A558F] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {testimonies.filter((t) => t.status === 'pending').length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A558F]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 text-xs font-semibold py-3 px-4 transition-colors relative ${
            activeTab === 'approved'
              ? 'text-[#4A558F]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Posted
          {testimonies.filter((t) => t.status === 'approved').length > 0 && (
            <span className="ml-1.5 bg-[#D9DFF2] text-[#4A558F] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {testimonies.filter((t) => t.status === 'approved').length}
            </span>
          )}
          {activeTab === 'approved' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A558F]" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#4A558F]" size={24} />
          <p className="text-xs text-gray-400 mt-2">Loading testimonies...</p>
        </div>
      ) : (
        (() => {
          const filtered = testimonies.filter((t) => {
            if (activeTab === 'pending') return t.status === 'pending'
            if (activeTab === 'approved') return t.status === 'approved'
            return true
          })
          if (filtered.length === 0) {
            const msg =
              activeTab === 'pending'
                ? 'No pending approvals'
                : 'No posted testimonies'
            return (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <AlertCircle size={36} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">{msg}</p>
              </div>
            )
          }
          return (
            <div
              className="p-3 flex flex-col gap-2.5 max-h-[480px] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#dde0ea transparent',
              }}
            >
              <style>{`
                .testimony-scroll::-webkit-scrollbar { width: 4px; }
                .testimony-scroll::-webkit-scrollbar-track { background: transparent; }
                .testimony-scroll::-webkit-scrollbar-thumb { background: #dde0ea; border-radius: 4px; }
              `}</style>
              {filtered.map((t, idx) => (
                <div
                  key={t._id || t.id}
                  className={`bg-[#fafbfd] border border-[#f0f2f8] rounded-xl p-3 hover:border-gray-200 transition-colors ${
                    pendingDeleteIds.includes(t._id || t.id) ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarBg(idx)} flex items-center justify-center text-[11px] font-semibold text-[#1a2a5e] shrink-0`}
                    >
                      {initials(t.name || t.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#1a2a5e] truncate">
                        {t.name || t.fullName}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#6b7494] leading-relaxed mb-2.5 line-clamp-2">
                    {t.quote || t.testimony}
                  </p>
                  {activeTab === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(t._id || t.id)}
                        className="flex-1 bg-[#1b9a5c] text-white text-xs font-medium py-1.5 rounded-lg hover:bg-[#158a4e] transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(t._id || t.id)}
                        className="flex-1 bg-[#e8453c] text-white text-xs font-medium py-1.5 rounded-lg hover:bg-[#d03930] transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(t._id || t.id)}
                        className="flex-1 bg-[#e8453c] text-white text-xs font-medium py-1.5 rounded-lg hover:bg-[#d03930] transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })()
      )}
    </div>
  )
}

export default TestimonyApprovalSidebar