import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import MemberLayout from "../../components/memberLayout";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Upcoming Youth Service",
    content: "Join us this Saturday for a special youth service with guest speaker Pastor Mark. Bring a friend and experience an evening of worship and fellowship!",
    image: "/announcement1.jpg",
    timestamp: "2 hours ago",
    category: "Youth",
    author: "Church of Jesus Christ the Risen Son of God Phils. Inc",
  },
  {
    id: 2,
    title: "Sunday Service Schedule Update",
    content: "Please note the updated schedule for this Sunday. Morning service will start at 9:30 AM. Youth service remains at 2:00 PM. See you there!",
    image: "/announcement2.jpg",
    timestamp: "1 day ago",
    category: "Service Updates",
    author: "Church of Jesus Christ the Risen Son of God Phils. Inc",
  },
  {
    id: 3,
    title: "Community Outreach Program",
    content: "We're organizing a community outreach next month. Volunteers are needed for food distribution and medical mission. Sign up at the admin office.",
    image: "/announcement3.jpg",
    timestamp: "3 days ago",
    category: "Events",
    author: "Church of Jesus Christ the Risen Son of God Phils. Inc",
  },
  {
    id: 4,
    title: "New Member Orientation",
    content: "Welcome to all our new members! Please attend the orientation this Sunday after the morning service to get acquainted with our church community.",
    image: "/announcement4.jpg",
    timestamp: "5 days ago",
    category: "General",
    author: "Church of Jesus Christ the Risen Son of God Phils. Inc",
  },
];

const AnnouncementCard = ({ announcement, onComment }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <img src="/LOGO.png" alt="Logo" className="w-10 h-10 object-contain" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#3B4B89] truncate">
            {announcement.author || "Church of Jesus Christ the Risen Son of God Phils. Inc"}
          </p>
          <p className="text-xs text-gray-500">{announcement.timestamp}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-[#3B4B89]/10 text-[#3B4B89] rounded-full font-medium">
          {announcement.category}
        </span>
      </div>

      {/* Post Text */}
      <div className="px-4 pt-3">
        <h3 className="text-base font-semibold text-gray-800 mb-1">{announcement.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{announcement.content}</p>
      </div>

      {/* Featured Image */}
      {announcement.image && (
        <div className="mt-4 px-4 pb-2">
          <div className="w-full h-48 bg-gradient-to-br from-[#3B4B89]/10 to-[#3B4B89]/5 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-sm text-gray-400 italic">Featured Image</p>
          </div>
        </div>
      )}

      {/* Interaction Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onComment(announcement)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition"
        >
          <MessageCircle size={16} />
          Comment
        </button>
      </div>
    </div>
  );
};

const CommentModal = ({ announcement, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setCommentText("");
        setSubmitted(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Add Comment</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Announcement Preview */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-semibold text-[#3B4B89]">{announcement.title}</p>
          <p className="text-xs text-gray-500 mt-1">{announcement.timestamp}</p>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent resize-none h-28"
            required
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#3B4B89] text-white text-sm font-medium rounded-lg hover:bg-[#2d3a6a] transition"
            >
              {submitted ? "Posted!" : "Post Comment"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const MemberAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [commentAnnouncement, setCommentAnnouncement] = useState(null);

  const categories = ["all", "Events", "General", "Youth", "Service Updates"];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/announcements`);
        if (res.data && res.data.length > 0) {
          setAnnouncements(res.data);
        } else {
          setAnnouncements(MOCK_ANNOUNCEMENTS);
        }
      } catch {
        setAnnouncements(MOCK_ANNOUNCEMENTS);
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
      {/* Hero Section */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3B4B89] mb-3">Announcements</h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
            Stay informed with the latest announcements for this week and upcoming events.
          </p>
        </div>
      </section>

      {/* Control Bar */}
      <section className="px-6 md:px-12 py-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Important Updates</h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`p-2 rounded-lg border transition ${
                    filterOpen || selectedCategory !== "all"
                      ? "bg-[#3B4B89] text-white border-[#3B4B89]"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                </button>

                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition ${
                            selectedCategory === cat
                              ? "bg-[#3B4B89] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {cat === "all" ? "All" : cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Active Filter Badge */}
          {selectedCategory !== "all" && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Filter:</span>
              <span className="px-3 py-1 bg-[#3B4B89]/10 text-[#3B4B89] rounded-full text-sm font-medium">
                {selectedCategory}
              </span>
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Announcement Grid */}
      <section className="px-6 md:px-12 pb-12">
        <div className="max-w-5xl mx-auto">
          {filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAnnouncements.map((ann) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  onComment={setCommentAnnouncement}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No announcements found.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-3 text-[#3B4B89] text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comment Modal */}
      <AnimatePresence>
        {commentAnnouncement && (
          <CommentModal
            announcement={commentAnnouncement}
            onClose={() => setCommentAnnouncement(null)}
          />
        )}
      </AnimatePresence>
    </MemberLayout>
  );
};

export default MemberAnnouncements;