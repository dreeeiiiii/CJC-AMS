import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import MemberLayout from "../../components/MemberLayout";
import ShareStoryModal from "../../components/ShareStoryModal";
import TestimonyCarousel from "../../components/TestimonyCarousel";

// -------------------- CONSTANTS --------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2023 + 1 }, (_, i) => CURRENT_YEAR - i);

// -------------------- HELPERS --------------------

function getSundaysInMonth(year, month) {
  const sundays = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) {
    sundays.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return sundays;
}

// timezone-safe key — avoids UTC offset shifting the date
function toKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFuture(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

function getDailyBg() {
  const day = new Date().getDay(); // 0 (Sun) – 6 (Sat)
  return `/BG-${day + 1}.jpg`;
}

// -------------------- COMPONENT --------------------

const MemberPage = () => {
  const [verse, setVerse] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showStoryModal, setShowStoryModal] = useState(false);

  // raw attendance records from backend
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const firstName = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.firstName || "User";
      }
    } catch (e) {
      // ignore
    }
    return "User";
  }, []);

  // -------------------- FETCH --------------------

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const base = "http://localhost:5000/api";

        const [verseRes, testRes, attRes] = await Promise.all([
          fetch(`${base}/content/verse/today`),
          fetch(`${base}/content/testimonies`),
          fetch(`${base}/attendance/my-attendance`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        if (verseRes.ok) setVerse(await verseRes.json());
        if (testRes.ok) setTestimonials(await testRes.json());

        if (attRes.ok) {
          const data = await attRes.json();
          setAttendanceHistory(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

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

  // -------------------- BUILD ATTENDANCE MAP (FROM BACKEND DATA) --------------------

  const attendanceMap = useMemo(() => {
    const map = {};

    attendanceHistory.forEach((record) => {
      const d = new Date(record.createdAt);
      map[toKey(d)] = true;
    });

    return map;
  }, [attendanceHistory]);

  // -------------------- STATS --------------------

  // FIXED (teammate): useMemo to avoid recomputing on every render
  const { attendedCount, absentCount } = useMemo(() => {
    let total = 0;
    let attended = 0;

    for (let m = 0; m < 12; m++) {
      getSundaysInMonth(selectedYear, m).forEach((d) => {
        if (!isFuture(d)) {
          total++;
          // FIXED (teammate): strict boolean — avoids truthy mismatches from API
          if (attendanceMap[toKey(d)] === true) attended++;
        }
      });
    }

    return {
      attendedCount: attended,
      absentCount: total - attended,
    };
  }, [attendanceMap, selectedYear]);

  // -------------------- LOADING --------------------

  if (loading) {
    return (
      <MemberLayout activeNav="home">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#3B4B89]" size={48} />
        </div>
      </MemberLayout>
    );
  }

  // -------------------- UI --------------------

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
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl" role="img" aria-label="waving hand">👋</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hi, {firstName}!</h3>
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

          {/* Stats row — outside grid card, centered on mobile */}
          <div className="grid grid-cols-3 gap-3 text-center md:text-left max-w-md mx-auto md:max-w-none md:mx-0">
            {[
              { label: "Attended", value: attendedCount, color: "text-[#1E3A8A]" },
              { label: "Absent",   value: absentCount,   color: "text-red-600"   },
              { label: "Records",  value: attendanceHistory.length, color: "text-[#1E3A8A]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 md:px-4 md:py-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Attendance Grid Matrix */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <div className="min-w-[640px]">

              {/* Month header row */}
              <div
                className="grid gap-2 mb-3 text-center text-xs font-semibold text-gray-500"
                style={{ gridTemplateColumns: "2.5rem repeat(12, 1fr)" }}
              >
                <div />
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
                        // FIXED (teammate): strict boolean check
                        const attended = attendanceMap[k] === true;

                        return (
                          <div
                            key={k}
                            title={sd.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            className={[
                              "w-full aspect-square rounded border flex items-center justify-center text-[10px] font-bold transition",
                              future
                                ? "bg-gray-50 border-gray-100 cursor-default opacity-50"
                                : attended
                                ? "bg-[#1E3A8A] border-[#1E3A8A] text-white cursor-default"
                                // FIXED (teammate): red styling for absent (not just empty white)
                                : "bg-red-50 border-red-300 text-red-500 cursor-default",
                            ].join(" ")}
                          >
                            {!future && sd.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mt-6 pt-4 border-t border-gray-50 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#1E3A8A] rounded" />
                  <span>Attended</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-300 rounded" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* Verse of the Day */}
          <section
            className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden"
            style={{
              backgroundImage: `url("${getDailyBg()}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4">Verse of the Day</h2>
              <p className="text-lg font-medium text-white/90 font-light leading-relaxed mb-3">
                {verse?.content
                  ? `"${verse.content}"`
                  : '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."'}
              </p>
              <p className="text-sm font-semibold text-white/80">
                — {verse?.reference || "Proverbs 3:5-6"}{" "}
                {verse?.topic ? `(${verse.topic})` : verse?.content ? "" : "(NIV)"}
              </p>
            </div>
          </section>

          {/* Testimonies */}
          <section className="bg-[#3B4B89] rounded-2xl p-6 shadow-sm text-white text-center flex flex-col">
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
