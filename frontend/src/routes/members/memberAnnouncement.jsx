import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ExternalLink, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import MemberLayout from "../../components/memberLayout";

const BACKEND_API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/announcements` 
  : "http://localhost:5000/api/announcements"; 

const AnnouncementCard = ({ announcement }) => {
  // Toggle state for See More / See Less
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Character limit before truncating
  const maxLength = 150;
  const contentText = announcement.content || "";
  const isLongText = contentText.length > maxLength;
  
  // Determine what text to show based on state
  const displayText = isExpanded 
    ? contentText 
    : contentText.slice(0, maxLength) + (isLongText ? "..." : "");

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      
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
        <div className="w-full border-t border-b border-gray-100 bg-gray-50 mt-auto">
          <img
            src={announcement.image}
            alt="Announcement"
            referrerPolicy="no-referrer"
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Action Bar */}
      {announcement.link && (
        <div className={`px-4 py-1.5 flex items-center justify-between border-t border-gray-200 ${!announcement.image && 'mt-auto'}`}>
          <a
            href={announcement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 text-[15px] font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ExternalLink size={18} />
            View Full Post
          </a>
        </div>
      )}
    </div>
  );
};

const MemberAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = ["all", "Events", "General", "Youth", "Service Updates"];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(BACKEND_API_URL);
        setAnnouncements(res.data);
      } catch (error) {
        console.error("Error fetching announcements from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || ann.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Latest Updates
            </h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent outline-none"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`p-2 rounded-full border transition-colors ${
                    filterOpen || selectedCategory !== "all"
                      ? "bg-[#3B4B89] text-white border-[#3B4B89]"
                      : "border-gray-300 text-gray-600 bg-white hover:bg-gray-100"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                </button>

                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedCategory === cat
                              ? "bg-[#3B4B89] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feed Section - Updated to 2 columns on laptop (md:grid-cols-2) */}
      <section className="px-4 md:px-12 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto pt-4">
          {filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {filteredAnnouncements.map((ann) => (
                <AnnouncementCard key={ann.id} announcement={ann} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg font-medium">
                No announcements found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </MemberLayout>
  );
};

export default MemberAnnouncements;