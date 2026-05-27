import { useState, useEffect } from "react";
import { Search, ExternalLink, MoreHorizontal, Pin, CheckCircle, X } from "lucide-react";
import axios from "axios";
import MemberLayout from "../../components/memberLayout";

const BACKEND_API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/announcements` 
  : "http://localhost:5000/api/announcements"; 

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AnnouncementCard = ({ announcement, onAcknowledge }) => {
  // Toggle state for See More / See Less
  const [isExpanded, setIsExpanded] = useState(false);
  // Lightbox state for full-size image
  const [lightboxImage, setLightboxImage] = useState(null);
  
  // Character limit before truncating
  const maxLength = 150;
  const contentText = announcement.content || "";
  const isLongText = contentText.length > maxLength;
  
  // Determine what text to show based on state
  const displayText = isExpanded 
    ? contentText 
    : contentText.slice(0, maxLength) + (isLongText ? "..." : "");

  useEffect(() => {
    document.body.style.overflow = lightboxImage ? "hidden" : "";
    document.body.classList.toggle("lightbox-open", !!lightboxImage);
    const handleKey = (e) => { if (e.key === "Escape") setLightboxImage(null); };
    if (lightboxImage) window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxImage]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Pinned Badge */}
      {announcement.pinned && (
        <div className="px-4 pt-3 pb-0">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF0FA] text-[#3B4B89]">
            <Pin size={12} />
            Pinned
          </span>
        </div>
      )}

      {/* FB-Style Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          <img 
            src="/LOGO.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-50" 
          />
          <div className="flex flex-col">
            {/* Author Name */}
            <span className="text-[15px] font-semibold text-gray-900 leading-tight hover:underline cursor-pointer">
              {announcement.author}
            </span>
            {/* Timestamp & Category */}
            <div className="flex items-center text-[13px] text-gray-500 gap-1.5 mt-0.5">
              <span>{announcement.timestamp}</span>
              <span aria-hidden="true">·</span>
              <span>{announcement.category}</span>
            </div>
          </div>
        </div>
        
        {/* FB Options Icon */}
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content Text with See More toggle */}
      <div className="px-4 pb-3 flex-grow">
        {announcement.title && (
          <h3 className="text-[16px] font-bold text-gray-900 mb-1">
            {announcement.title}
          </h3>
        )}
        <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-relaxed inline">
          {displayText}
        </p>
        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[15px] font-semibold text-gray-500 hover:text-[#3B4B89] ml-1 transition-colors"
          >
            {isExpanded ? "See Less" : "See More"}
          </button>
        )}
      </div>

      {/* Image (Fixed height for uniform grid alignment) */}
      {announcement.image && (
        <div className="w-full border-t border-b border-gray-100 bg-gray-50">
          <img
            src={announcement.image}
            alt="Announcement"
            referrerPolicy="no-referrer"
            className="w-full h-48 sm:h-64 object-cover cursor-pointer"
            onClick={() => setLightboxImage(announcement.image)}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-gray-200 mt-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAcknowledge?.(announcement.id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border min-h-[48px] transition-colors ${
              announcement.selfAcknowledged
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-gray-500 border-gray-300 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            }`}
          >
            <CheckCircle size={14} />
            {announcement.selfAcknowledged ? "Acknowledged" : "Got it"}
          </button>
          {announcement.acknowledgmentCount > 0 && (
            <span className="text-xs text-gray-400">
              · {announcement.acknowledgmentCount} {announcement.acknowledgmentCount === 1 ? "person" : "people"}
            </span>
          )}
        </div>
        {announcement.link && (
          <a
            href={announcement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-1.5 px-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-md min-h-[48px] transition-colors"
          >
            <ExternalLink size={16} />
            View Full Post
          </a>
        )}
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Full size announcement image"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Full size announcement"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const MemberAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "General", "Event", "Urgent", "Update"];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${BACKEND_API_URL}?limit=1000`);
        setAnnouncements(res.data.data || []);
      } catch (error) {
        console.error("Error fetching announcements from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Remove scheduled, apply search + category filter, sort pinned first
  const liveAnnouncements = announcements.filter(
    (ann) => !ann.scheduledAt || new Date(ann.scheduledAt) <= new Date()
  );

  const searchedAnnouncements = liveAnnouncements.filter((ann) =>
    ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnnouncements = searchedAnnouncements
    .filter((ann) => selectedCategory === "All" || ann.category === selectedCategory)
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  // Feature 4 — Acknowledge / un-acknowledge
  const handleAcknowledge = async (id) => {
    const target = announcements.find((a) => a.id === id);
    if (!target) return;

    const wasAcknowledged = target.selfAcknowledged;
    const method = wasAcknowledged ? "DELETE" : "POST";

    try {
      await axios({ method, url: `${API_BASE}/api/announcements/${id}/acknowledge` });
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
      );
    } catch (error) {
      console.error("Error toggling acknowledgment:", error);
    }
  };

  if (loading) {
    return (
      <MemberLayout activeNav="announcements">
        <div className="flex justify-center items-center h-96">
          <div className="w-12 h-12 border-4 border-[#3B4B89] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout activeNav="announcements">
      {/* Header Section */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3B4B89] mb-3">
            Church Announcements
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Stay updated with the latest events and spiritual updates from our official page.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="px-6 md:px-12 py-6 bg-gray-50">
        {/* Widened container to match the 2-column grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[auto_1fr_auto] gap-4 items-center">
            <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
              Latest Updates
            </h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap md:col-span-2 lg:col-span-1">
              {categories.map((cat) => {
                const count = cat === "All"
                  ? searchedAnnouncements.length
                  : searchedAnnouncements.filter((a) => a.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 text-[11px] sm:text-xs font-medium border rounded-full transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#3B4B89] text-white border-[#3B4B89]"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                    <span className="ml-1 opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feed Section - Updated to 2 columns on laptop (md:grid-cols-2) */}
      <section className="px-4 md:px-12 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto pt-4">
          {filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {filteredAnnouncements.map((ann) => (
                <AnnouncementCard key={ann.id} announcement={ann} onAcknowledge={handleAcknowledge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold text-[#4A558F] mb-2">No announcements found</h3>
              <p className="text-gray-500 text-sm">We couldn't find any announcements matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </MemberLayout>
  );
};

export default MemberAnnouncements;