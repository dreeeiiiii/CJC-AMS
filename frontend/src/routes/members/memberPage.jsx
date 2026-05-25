import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, ChevronDown } from "lucide-react";
import MemberLayout from "../../components/MemberLayout";
import ShareStoryModal from "../../components/ShareStoryModal";
import TestimonyCarousel from "../../components/TestimonyCarousel";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2023 + 1 }, (_, i) => CURRENT_YEAR - i); // [2026, 2025, 2024, 2023]

/** Returns an array of Date objects for every Sunday in the given month/year. */
function getSundaysInMonth(year, month) {
  const sundays = [];
  const d = new Date(year, month, 1);
  // Advance to the first Sunday
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) {
    sundays.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return sundays;
}

/** Returns a YYYY-MM-DD string key for a Date. */
function toKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Returns true if the date is strictly in the future (after today). */
function isFuture(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

// --- Component ---

const MemberPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Attendance state: Record<"YYYY-MM-DD", boolean>
  const [attendance, setAttendance] = useState({});

  // Year selector
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch verse + testimonies
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const baseUrl = "http://localhost:5000/api/content";
        const [verseRes, testimonyRes] = await Promise.all([
          fetch(`${baseUrl}/verse/today`),
          fetch(`${baseUrl}/testimonies`),
        ]);

        if (verseRes.ok) {
          const verseData = await verseRes.json();
          setVerse(verseData);
        }

        if (testimonyRes.ok) {
          const testimonyData = await testimonyRes.json();
          setTestimonials(testimonyData || []);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Toggle a Sunday cell's attendance
  const toggleAttendance = (date) => {
    if (isFuture(date)) return;
    const k = toKey(date);
    setAttendance((prev) => {
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = true;
      return next;
    });
  };

  // Derive stats for the selected year
  const { attendedCount, totalPast } = (() => {
    let attended = 0;
    let total = 0;
    for (let mi = 0; mi < 12; mi++) {
      getSundaysInMonth(selectedYear, mi).forEach((sd) => {
        if (!isFuture(sd)) {
          total++;
          if (attendance[toKey(sd)]) attended++;
        }
      });
    }
    return { attendedCount: attended, totalPast: total };
  })();

  const absentCount = totalPast - attendedCount;
  const attendanceRate = totalPast > 0 ? Math.round((attendedCount / totalPast) * 100) : 0;

  if (loading) {
    return (
      <MemberLayout activeNav="home">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#3B4B89]" size={48} />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout activeNav="home">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">My Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your Sunday service attendance.</p>
        </div>

        {/* ATTENDANCE SECTION */}
        <section className="space-y-6">

          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl" role="img" aria-label="waving hand">👋</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hi, Mary!</h3>
                <p className="text-xs text-gray-500 max-w-md mt-0.5">
                  Your Sunday service attendance for the year.
                </p>
              </div>
            </div>

            {/* Year Dropdown */}
            <div className="self-end md:self-start relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-1.5 text-sm font-semibold text-gray-700 bg-white shadow-sm hover:bg-gray-50 transition"
              >
                {selectedYear}
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-md z-10 overflow-hidden">
                  {YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 ${
                        year === selectedYear
                          ? "font-semibold text-[#1E3A8A]"
                          : "text-gray-700"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance Grid Matrix */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <div className="min-w-[640px]">

              {/* Month header row */}
              <div
                className="grid gap-2 mb-3 text-center text-xs font-semibold text-gray-500"
                style={{ gridTemplateColumns: "2.5rem repeat(12, 1fr)" }}
              >
                <div /> {/* empty corner */}
                {MONTHS.map((m) => <div key={m}>{m}</div>)}
              </div>

              {/* Sunday cells row */}
              <div
                className="grid gap-2 items-start"
                style={{ gridTemplateColumns: "2.5rem repeat(12, 1fr)" }}
              >
                <div className="text-xs font-bold text-[#3B4B89] pt-1">Sun</div>

                {MONTHS.map((_, mi) => {
                  const sundays = getSundaysInMonth(selectedYear, mi);
                  return (
                    <div key={mi} className="flex flex-col gap-1">
                      {sundays.map((sd) => {
                        const k = toKey(sd);
                        const future = isFuture(sd);
                        const attended = !!attendance[k];

                        return (
                          <div
                            key={k}
                            title={sd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            onClick={() => toggleAttendance(sd)}
                            className={[
                              "w-full aspect-square rounded border transition",
                              future
                                ? "bg-gray-50 border-gray-100 cursor-default opacity-50"
                                : attended
                                ? "bg-[#1E3A8A] border-[#1E3A8A] cursor-pointer"
                                : "bg-white border-gray-200 cursor-pointer hover:border-gray-400",
                            ].join(" ")}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: "Attended", value: attendedCount },
                  { label: "Absent", value: absentCount },
                  { label: "Rate", value: `${attendanceRate}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center items-center gap-8 mt-6 pt-4 border-t border-gray-50 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#1E3A8A] rounded" />
                  <span>Attended</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded bg-white" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-100 rounded opacity-50" />
                  <span>Future</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TWO COLUMN GRID: VERSE & TESTIMONIES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Verse of the Day */}
          <section className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-[#3B4B89] mb-4">Verse of the Day</h2>
              <p className="text-lg text-gray-700 font-light leading-relaxed mb-3">
                {verse?.content ? `"${verse.content}"` : '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."'}
              </p>
              <p className="text-sm font-semibold text-[#3B4B89]">
                — {verse?.reference || "Proverbs 3:5-6"}{" "}
                {verse?.topic ? `(${verse.topic})` : verse?.content ? "" : "(NIV)"}
              </p>
            </div>
          </section>

          {/* Testimonies */}
          <section className="bg-[#3B4B89] rounded-2xl p-6 shadow-sm text-white text-center">
            <h2 className="text-xl font-bold mb-4">Testimonies</h2>
            <TestimonyCarousel
              testimonials={testimonials}
              onShareStory={() => setShowStoryModal(true)}
            />
          </section>

        </div>
      </div>

      <ShareStoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />
    </MemberLayout>
  );
};

export default MemberPage;