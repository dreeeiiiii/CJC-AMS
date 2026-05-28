import React, { useState, useRef, useEffect, useMemo } from 'react'
import AdminNavbar from '../../components/adminNavbar'
import Footer from '../../components/footer'
import ConfirmDialog from '../../components/confirmDialog'
import {
  ImagePlus,
  Send,
  Edit2,
  Trash2,
  Paperclip,
  X,
  Bold,
  Italic,
  Smile,
  Loader2,
  Type,
  Tag,
  User,
  Link as LinkIcon,
  Pin,
  CalendarClock,
  CheckCircle
} from 'lucide-react'

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([])

  // Create states
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState('General')
  const [postAuthor, setPostAuthor] = useState('CJCRSG Phils. Inc.')
  const [postLink, setPostLink] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Edit states
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editLink, setEditLink] = useState('')

  // Pagination states
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, withImages: 0, pinned: 0, scheduled: 0, byCategory: {} })
  const ITEMS_PER_PAGE = 5

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [userName, setUserName] = useState('Admin')

  // Feature 2 - Scheduled posting
  const [scheduledMode, setScheduledMode] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  // Feature 3 - Category filter
  const [activeFilter, setActiveFilter] = useState('All')

  const fileInputRef = useRef(null)

  // Word count logic
  const maxWords = 5000
  const wordCount =
    postContent.trim() === ''
      ? 0
      : postContent.trim().split(/\s+/).length

  const API_URL = import.meta.env.VITE_API_URL

  const token = localStorage.getItem('token')

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/announcements?page=1&limit=${ITEMS_PER_PAGE}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          setAnnouncements(data.data || [])
          setHasMore(data.hasMore !== false)
          setStats(data.stats || { total: 0, thisWeek: 0, withImages: 0, pinned: 0, scheduled: 0, byCategory: {} })
          setPage(1)
        }
      } catch (error) {
        console.error('Failed to load announcements:', error)
      }
    }

    fetchAnnouncements()
  }, [API_URL, token])

  // Get current logged in user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/users/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }

        const data = await response.json()

        console.log(data)

        setUserName(data.firstName || 'Admin')

        setPostAuthor(
          `${data.firstName || ''} ${data.lastName || ''}`.trim()
        )
      } catch (e) {
        console.log(e)
      }
    }

    getCurrentUser()
  }, [API_URL, token])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]

    if (file) {
      setSelectedFile(file)

      const reader = new FileReader()

      reader.onloadend = () => {
        setImagePreview(reader.result)
      }

      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSelectedFile(null)
    setImagePreview(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePost = async () => {
    if (
      !postTitle.trim() ||
      !postContent.trim() ||
      wordCount > maxWords
    ) {
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()

      formData.append('title', postTitle)
      formData.append('content', postContent)
      formData.append('category', postCategory)
      formData.append('author', postAuthor)

      if (postLink.trim()) {
        formData.append('link', postLink)
      }

      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      if (scheduledAt) {
        formData.append('scheduledAt', scheduledAt)
      }

      const response = await fetch(
        `${API_URL}/api/announcements`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (response.ok) {
        const newPost = await response.json()

        setAnnouncements((prev) => [newPost, ...prev])
        setStats((prev) => ({
          total: prev.total + 1,
          thisWeek: prev.thisWeek + 1,
          withImages: newPost.image ? prev.withImages + 1 : prev.withImages,
          pinned: newPost.pinned ? prev.pinned + 1 : prev.pinned,
          scheduled: newPost.scheduledAt ? prev.scheduled + 1 : prev.scheduled,
        }))

        // Reset form
        setPostTitle('')
        setPostContent('')
        setPostCategory('General')
        setPostLink('')
        setScheduledMode(false)
        setScheduledAt('')

        clearImage()
      }
    } catch (error) {
      console.error('Error posting announcement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/announcements/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const deleted = announcements.find((a) => a.id === id)

        setAnnouncements((prev) =>
          prev.filter((a) => a.id !== id)
        )
        setStats((prev) => ({
          total: Math.max(0, prev.total - 1),
          thisWeek: Math.max(0, prev.thisWeek - 1),
          withImages: deleted?.image ? Math.max(0, prev.withImages - 1) : prev.withImages,
          pinned: deleted?.pinned ? Math.max(0, prev.pinned - 1) : prev.pinned,
          scheduled: deleted?.scheduledAt ? Math.max(0, prev.scheduled - 1) : prev.scheduled,
        }))

        setDeleteModal(null)
      }
    } catch (error) {
      console.error('Error removing announcement:', error)
    }
  }

  const handleEdit = (id) => {
    const announcement = announcements.find(
      (a) => a.id === id
    )

    if (announcement) {
      setEditingId(id)
      setEditTitle(announcement.title || '')
      setEditContent(announcement.content || '')
      setEditCategory(announcement.category || 'General')
      setEditAuthor(
        announcement.author || 'CJCRSG Phils. Inc.'
      )
      setEditLink(announcement.link || '')
    }
  }

  const handleSaveEdit = async (id) => {
    if (!editTitle.trim() || !editContent.trim()) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/announcements/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
            category: editCategory,
            author: editAuthor,
            link: editLink,
          }),
        }
      )

      if (response.ok) {
        const updated = await response.json()

        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          )
        )

        setEditingId(null)
      }
    } catch (error) {
      console.error('Error updating announcement:', error)
    }
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1

    try {
      const response = await fetch(
        `${API_URL}/api/announcements?page=${nextPage}&limit=${ITEMS_PER_PAGE}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const result = await response.json()

        setAnnouncements((prev) => {
          const existingIds = new Set(prev.map((a) => a.id))
          const newItems = (result.data || []).filter(
            (a) => !existingIds.has(a.id)
          )
          return [...prev, ...newItems]
        })

        setHasMore(result.hasMore !== false)
        setStats(result.stats || { total: 0, thisWeek: 0, withImages: 0, pinned: 0, scheduled: 0 })
        setPage(nextPage)
      }
    } catch (error) {
      console.error('Error loading more entries:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Feature 1 - Pin / Unpin
  const handleTogglePin = async (id) => {
    const target = announcements.find((a) => a.id === id)

    if (!target) return

    const newPinned = !target.pinned

    try {
      const response = await fetch(
        `${API_URL}/api/announcements/${id}/pin`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pinned: newPinned }),
        }
      )

      if (response.ok) {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, pinned: newPinned } : a
          )
        )
        setStats((prev) => ({
          ...prev,
          pinned: newPinned ? prev.pinned + 1 : Math.max(0, prev.pinned - 1),
        }))
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  // Feature 4 - Acknowledgment
  const handleAcknowledge = async (id) => {
    const target = announcements.find((a) => a.id === id)

    if (!target) return

    const wasAcknowledged = target.selfAcknowledged
    const method = wasAcknowledged ? 'DELETE' : 'POST'

    try {
      const response = await fetch(
        `${API_URL}/api/announcements/${id}/acknowledge`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  selfAcknowledged: !wasAcknowledged,
                  acknowledgmentCount: wasAcknowledged
                    ? Math.max(0, (a.acknowledgmentCount || 0) - 1)
                    : (a.acknowledgmentCount || 0) + 1,
                }
              : a
          )
        )
      }
    } catch (error) {
      console.error('Error toggling acknowledgment:', error)
    }
  }

  // Feature 3 - Derived sorted / filtered list
  const filteredAnnouncements = useMemo(() => {
    const isScheduled = (a) =>
      a.scheduledAt && new Date(a.scheduledAt) > new Date()

    const pinned = announcements.filter((a) => a.pinned && !isScheduled(a))
    const unpinned = announcements.filter((a) => !a.pinned && !isScheduled(a))
    const scheduled = announcements.filter((a) => isScheduled(a))

    const ordered = [...pinned, ...scheduled, ...unpinned]

    if (activeFilter === 'All') return ordered
    return ordered.filter((a) => a.category === activeFilter)
  }, [announcements, activeFilter])

  const totalForFilter = activeFilter === 'All'
    ? stats.total
    : (stats.byCategory?.[activeFilter] || 0)
  const showLoadMore = filteredAnnouncements.length < totalForFilter

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now'

    const date = new Date(timestamp)
    const now = new Date()

    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const insertFormat = (syntax) => {
    const textarea = document.getElementById('postEditor')

    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      const text = postContent
      const selectedText = text.substring(start, end)

      let wrapper = ''

      switch (syntax) {
        case 'bold':
          wrapper = `**${selectedText || 'bold text'}**`
          break

        case 'italic':
          wrapper = `*${selectedText || 'italic text'}*`
          break

        case 'emoji':
          wrapper = '😊'
          break

        default:
          break
      }

      const newText =
        text.substring(0, start) +
        wrapper +
        text.substring(end)

      setPostContent(newText)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + wrapper.length,
          start + wrapper.length
        )
      }, 0)
    }
  }
    return (
      <>
        <AdminNavbar />

        <div className="min-h-screen bg-gradient-to-b from-[#D9DFF2]/40 to-white font-montserrat">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

            {/* Left Column - Sticky Hero */}
            <div className="lg:w-1/3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-3xl font-semibold text-[#4A558F]">Hi, Admin {userName}!</h2>
                  <p className="text-gray-500 text-sm mt-2">Create and manage announcements for the community.</p>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">Announcement Stats</h3>
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Posts</span>
                      <span className="font-semibold text-[#4A558F]">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">This Week</span>
                      <span className="font-semibold text-[#4A558F]">{stats.thisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">With Images</span>
                      <span className="font-semibold text-[#4A558F]">{stats.withImages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Pinned</span>
                      <span className="font-semibold text-[#4A558F]">{stats.pinned}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Scheduled</span>
                      <span className="font-semibold text-[#4A558F]">{stats.scheduled}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feed */}
            <div className="lg:w-2/3 space-y-6">

              {/* Create Post Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-[#4A558F] mb-4">Create Announcement</h3>

                {/* Metadata Inputs (Title, Category, Author, Link) */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 focus-within:border-[#4A558F] transition-colors">
                    <Type size={16} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Announcement Title *"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full focus:outline-none text-sm font-medium"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 focus-within:border-[#4A558F] transition-colors">
                      <Tag size={16} className="text-gray-400 mr-2" />
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full focus:outline-none text-sm text-gray-600 bg-transparent"
                      >
                        <option value="General">General</option>
                        <option value="Event">Event</option>
                        <option value="Youth">Youth</option>
                        <option value="Update">Update</option>
                      </select>
                    </div>
                    <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 focus-within:border-[#4A558F] transition-colors">
                      <User size={16} className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Author"
                        value={postAuthor}
                        onChange={(e) => setPostAuthor(e.target.value)}
                        className="w-full focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 focus-within:border-[#4A558F] transition-colors">
                    <LinkIcon size={16} className="text-gray-400 mr-2" />
                    <input
                      type="url"
                      placeholder="External Link (Optional)"
                      value={postLink}
                      onChange={(e) => setPostLink(e.target.value)}
                      className="w-full focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Schedule for later */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!scheduledMode) setScheduledAt('')
                      setScheduledMode(!scheduledMode)
                    }}
                    className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 ${
                      scheduledMode ? 'bg-[#4A558F]' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle scheduled posting"
                  >
                    <span
                      className={`absolute top-[3px] w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                        scheduledMode ? 'left-[17px]' : 'left-[3px]'
                      }`}
                    />
                  </button>
                  <span
                    className="text-xs text-gray-500 flex items-center gap-1.5 cursor-pointer select-none"
                    onClick={() => {
                      if (!scheduledMode) setScheduledAt('')
                      setScheduledMode(!scheduledMode)
                    }}
                  >
                    <CalendarClock size={14} />
                    Schedule for later
                  </span>
                  {scheduledMode && (
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-[#4A558F] transition-colors flex-1 max-w-[220px]">
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full focus:outline-none text-xs text-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => insertFormat('bold')}
                    className="p-3 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#4A558F] transition-colors"
                    title="Bold"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('italic')}
                    className="p-3 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#4A558F] transition-colors"
                    title="Italic"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('emoji')}
                    className="p-3 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#4A558F] transition-colors"
                    title="Add Emoji"
                  >
                    <Smile size={18} />
                  </button>
                </div>

                <textarea
                  id="postEditor"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write the announcement content... *"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A558F] transition-colors resize-none text-sm"
                  rows={8}
                />

                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${wordCount > maxWords ? 'text-red-600 font-bold' : wordCount > maxWords * 0.9 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {wordCount}/{maxWords} words
                  </span>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                    <button
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-[#4A558F] transition-colors text-sm">
                      <ImagePlus size={18} />
                      <span>Add Image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Paperclip size={12} />
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={isLoading || !postTitle.trim() || !postContent.trim() || wordCount > maxWords || (scheduledMode && !scheduledAt)}
                    className={`rounded-xl py-3 px-8 transition-all duration-300 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                      scheduledMode
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-[#4A558F] text-white hover:bg-[#3a4575]'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : scheduledMode ? (
                      <CalendarClock size={18} />
                    ) : (
                      <Send size={18} />
                    )}
                    {scheduledMode ? 'Schedule' : 'Post'}
                  </button>
                </div>
              </div>

              {/* Feature 3 - Category Filter Tabs */}
              {announcements.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {['All', 'General', 'Event', 'Youth', 'Update'].map((cat) => {
                    const count = cat === 'All'
                      ? stats.total
                      : (stats.byCategory?.[cat] || 0)
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all ${
                          activeFilter === cat
                            ? 'bg-[#4A558F] text-white border-[#4A558F]'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                        {count > 0 && <span className="ml-1 opacity-75">({count})</span>}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Announcement Feed */}
              {announcements.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-xl font-semibold text-[#4A558F] mb-2">No updates yet!</h3>
                  <p className="text-gray-500 text-sm">Create your first announcement to keep the community informed.</p>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center">
                  <div className="text-4xl mb-3 text-gray-300">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">No announcements in this category</h3>
                  <p className="text-gray-400 text-sm">Try selecting a different filter.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAnnouncements.map((announcement) => {
                    const isScheduled = announcement.scheduledAt && new Date(announcement.scheduledAt) > new Date()
                    return (
                    <div
                      key={announcement.id}
                      className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                        announcement.pinned && !isScheduled
                          ? 'border-[#4A558F] border-2'
                          : 'border-gray-100'
                      }`}
                    >
                      {/* Pin banner */}
                      {announcement.pinned && !isScheduled && (
                        <div className="bg-[#EEF0FA] px-5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#4A558F]">
                          <Pin size={13} />
                          Pinned announcement
                        </div>
                      )}

                      {/* Scheduled banner */}
                      {isScheduled && (
                        <div className="bg-amber-50 px-5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <CalendarClock size={13} />
                          Scheduled — {new Date(announcement.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      )}

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img src="/LOGO.png" alt="Logo" className="w-10 h-10 rounded-full" />
                            <div>
                              <h4 className="font-semibold text-[#4A558F] text-sm">{announcement.author || 'Church of Jesus Christ'}</h4>
                              <p className="text-xs text-gray-400">
                                {formatTimestamp(announcement.createdAt || announcement.timestamp)} 
                                {announcement.category && ` • ${announcement.category}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        {editingId === announcement.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Title"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[#4A558F] text-sm font-semibold"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                placeholder="Category"
                                className="w-1/2 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[#4A558F] text-sm"
                              />
                              <input
                                type="text"
                                value={editAuthor}
                                onChange={(e) => setEditAuthor(e.target.value)}
                                placeholder="Author"
                                className="w-1/2 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[#4A558F] text-sm"
                              />
                            </div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A558F] transition-colors resize-none text-sm"
                              rows={8}
                            />
                            <input
                              type="url"
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              placeholder="Link"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[#4A558F] text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(announcement.id)}
                                disabled={!editTitle.trim() || !editContent.trim()}
                                className="bg-[#4A558F] text-white text-sm rounded-lg px-4 py-1.5 hover:bg-[#3a4575] transition-colors disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-gray-200 text-gray-600 text-sm rounded-lg px-4 py-1.5 hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {announcement.title && (
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.title}</h3>
                            )}
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">{announcement.content}</p>
                            
                            {announcement.link && (
                              <a 
                                href={announcement.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#4A558F] hover:underline font-medium"
                              >
                                <LinkIcon size={14} />
                                Learn More / View Link
                              </a>
                            )}
                          </div>
                        )}

                        {/* Image Attachment */}
                        {announcement.image && (
                          <div className="mt-4">
                            <img
                              src={announcement.image}
                              alt={announcement.title || "Announcement"}
                              className="w-full h-auto max-h-80 object-cover rounded-xl"
                            />
                          </div>
                        )}
                      </div>

                      {/* Feature 4 + Feature 1 - Actions */}
                      <div className="border-t border-gray-100 px-4 sm:px-5 py-3 flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-0 justify-between">
                        <div className="flex items-center gap-2 w-full xs:w-auto">
                          <button
                            onClick={() => handleAcknowledge(announcement.id)}
                            className={`flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-lg border transition-colors ${
                              announcement.selfAcknowledged
                                ? 'text-green-700 bg-green-50 border-green-200'
                                : 'text-gray-500 border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700'
                            }`}
                          >
                            <CheckCircle size={16} />
                            {announcement.selfAcknowledged ? 'Acknowledged' : 'Got it'}
                          </button>
                          {announcement.acknowledgmentCount > 0 && (
                            <span className="text-xs text-gray-400">
                              {announcement.acknowledgmentCount} {announcement.acknowledgmentCount === 1 ? 'person' : 'people'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 w-full xs:w-auto justify-end">
                          <button
                            onClick={() => handleTogglePin(announcement.id)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-lg transition-colors ${
                              announcement.pinned
                                ? 'text-[#4A558F] bg-[#EEF0FA] font-medium'
                                : 'text-gray-500 hover:text-[#4A558F] hover:bg-[#EEF0FA]'
                            }`}
                          >
                            <Pin size={16} />
                            <span className="hidden xs:inline">{announcement.pinned ? 'Unpin' : 'Pin'}</span>
                          </button>
                          <button
                            onClick={() => handleEdit(announcement.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#4A558F] transition-colors px-3 py-2.5 rounded-lg hover:bg-[#D9DFF2]/50"
                          >
                            <Edit2 size={16} />
                            <span className="hidden xs:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteModal(announcement.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors px-3 py-2.5 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            <span className="hidden xs:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}

              {/* Load More */}
              {announcements.length > 0 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore || !showLoadMore}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl border-2 text-sm font-semibold shadow-sm transition-all duration-300 ${
                      showLoadMore
                        ? 'border-[#D9DFF2] text-[#4A558F] bg-white hover:bg-[#D9DFF2] hover:border-[#4A558F]'
                        : 'border-gray-200 text-gray-400 bg-gray-50 cursor-default'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Loading...
                      </>
                    ) : showLoadMore ? (
                      'Load More Announcements'
                    ) : (
                      'All announcements loaded'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <ConfirmDialog
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={() => handleDelete(deleteModal)}
          title="Delete Announcement?"
          message="This action cannot be undone. Are you sure you want to delete this post?"
          confirmText="Delete"
          variant="danger"
        />

        <Footer />
      </>
    )
  }

  export default AdminAnnouncement