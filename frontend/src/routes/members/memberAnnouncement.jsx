import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import MemberLayout from "../../components/memberLayout";

// RSS Configuration
const RSS_FEED_URL = "https://rss.app/feeds/RAkZj7EHehFaskRk.xml";
const CONVERTER_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;

// FIX: decode HTML safely
const decodeHTML = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition flex flex-col h-full">
      
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <img src="/LOGO.png" alt="Logo" className="w-10 h-10 object-contain" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#3B4B89] truncate">
            {announcement.author}
          </p>
          <p className="text-xs text-gray-500">{announcement.timestamp}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-[#3B4B89]/10 text-[#3B4B89] rounded-full font-medium">
          {announcement.category}
        </span>
      </div>

      {/* Post Text */}
      <div className="px-4 pt-3 flex-grow">
        <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
          {announcement.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
          {announcement.content}
        </p>
      </div>

      {/* Featured Image */}
      {announcement.image && (
        <div className="mt-4 px-4">
          <img
            src={announcement.image}
            alt="Announcement"
            referrerPolicy="no-referrer"
            className="w-full h-52 object-cover rounded-lg border border-gray-100"
            onError={(e) => {
              // SAFE FAIL (no layout break)
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-4 mt-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/30">
        <a
          href={announcement.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-[#3B4B89] font-semibold hover:underline"
        >
          View Full Post <ExternalLink size={14} />
        </a>
      </div>
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
    const fetchDynamicAnnouncements = async () => {
      try {
        const res = await axios.get(CONVERTER_URL);

        if (res.data?.items) {
          const formatted = res.data.items.map((item, index) => {

            // 1. ALWAYS decode first (critical)
            const decodedDescription = decodeHTML(item.description || "");

            // 2. clean text safely
            const plainText = decodedDescription.replace(/<[^>]*>/g, "");

            // 3. SMART IMAGE RESOLVER (FIXED)
            const getImage = () => {
              const rssImage =
                item.enclosure?.link ||
                item.thumbnail ||
                null;

              const htmlImageMatch = decodedDescription.match(
                /<img[^>]+src=["']([^"']+)["']/i
              );

              const htmlImage = htmlImageMatch?.[1] || null;

              const ogImageMatch = decodedDescription.match(
                /og:image[^>]*content=["']([^"']+)["']/i
              );

              const ogImage = ogImageMatch?.[1] || null;

              return rssImage || htmlImage || ogImage || null;
            };

            return {
              id: index,
              title: item.title || "Church Update",
              content: plainText || "Click to view details on Facebook.",
              image: getImage(),
              timestamp: new Date(item.pubDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              category: "General",
              author: "CJCRSG Phils. Inc.",
              link: item.link,
            };
          });

          setAnnouncements(formatted);
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicAnnouncements();
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
      {/* UI unchanged below */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3B4B89] mb-3">
            Church Announcements
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
            Stay updated with the latest events and spiritual updates from our official page.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3B4B89] focus:border-transparent"
                />
              </div>

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

      <section className="px-6 md:px-12 pb-12">
        <div className="max-w-5xl mx-auto">
          {filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredAnnouncements.map((ann) => (
                <AnnouncementCard key={ann.id} announcement={ann} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
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