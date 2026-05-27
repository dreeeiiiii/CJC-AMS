import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import MemberLayout from "../../components/MemberLayout";
import ShareStoryModal from "../../components/ShareStoryModal";
import TestimonyCarousel from "../../components/TestimonyCarousel";

// -------------------- CONSTANTS --------------------

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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

// -------------------- COMPONENT --------------------

const MemberPage = () => {
  const [verse, setVerse] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showStoryModal, setShowStoryModal] = useState(false);

  // ✅ NEW: raw attendance records from backend
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // -------------------- CLOSE DROPDOWN --------------------

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

  const { attendedCount, absentCount } = useMemo(() => {
    let total = 0;
    let attended = 0;

    for (let m = 0; m < 12; m++) {
      getSundaysInMonth(selectedYear, m).forEach((d) => {
        if (!isFuture(d)) {
          total++;

          const key = toKey(d);

          if (attendanceMap[key]) {
            attended++;
          }
        }
      });
    }

    return {
      attendedCount: attended,
      absentCount: total - attended
    };
  }, [attendanceMap, selectedYear]);

  // -------------------- LOADING --------------------

  if (loading) {
    return (
      <MemberLayout activeNav="home">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#1E3A8A]" size={48} />
        </div>
      </MemberLayout>
    );
  }

  // -------------------- UI (UNCHANGED) --------------------

  return (
    <MemberLayout activeNav="home">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A]">
            My Attendance
          </h1>
        </div>

        {/* OVERVIEW */}
        <div className="bg-white rounded-2xl p-6 border flex justify-between items-center">
          <h3 className="font-bold text-lg">Attendance Overview</h3>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="border px-4 py-1 rounded-lg text-sm"
            >
              {selectedYear}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="bg-white rounded-2xl p-6 border overflow-x-auto">
          <div className="min-w-[700px]">

            <div className="grid grid-cols-13 text-xs text-gray-500 text-center mb-3">
              <div></div>
              {MONTHS.map((m) => <div key={m}>{m}</div>)}
            </div>

            <div className="grid grid-cols-13 gap-2">
              <div className="text-xs font-bold text-[#1E3A8A]">Sun</div>

              {MONTHS.map((_, mi) => (
                <div key={mi} className="flex flex-col gap-1">
                  {getSundaysInMonth(selectedYear, mi).map((d) => {
                    const key = toKey(d);
                    const attended = attendanceMap[key];
                    const future = isFuture(d);

                    return (
                      <div
                        key={key}
                        className={[
                          "aspect-square rounded border flex items-center justify-center text-[10px] font-bold",
                          future
                            ? "bg-gray-100 opacity-40"
                            : attended
                            ? "bg-[#1E3A8A] border-[#1E3A8A] text-white"
                            : "bg-red-50 border-red-300 text-red-500"
                        ].join(" ")}
                      >
                        {d.getDate()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Attended</p>
                <p className="text-xl font-bold text-[#1E3A8A]">
                  {attendedCount}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Absent</p>
                <p className="text-xl font-bold text-red-600">
                  {absentCount}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Records</p>
                <p className="text-xl font-bold text-[#1E3A8A]">
                  {attendanceHistory.length}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* VERSE + TESTIMONY stays unchanged */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border">
            <h2 className="font-bold text-[#1E3A8A] mb-3">
              Verse of the Day
            </h2>

            <p className="text-gray-700">
              "{verse?.content || "Trust in the Lord with all your heart"}"
            </p>

            <p className="text-sm text-[#1E3A8A] mt-2">
              — {verse?.reference || "Proverbs 3:5-6"}
            </p>
          </div>

          <div className="bg-[#1E3A8A] text-white p-6 rounded-2xl">
            <h2 className="font-bold mb-3">Testimonies</h2>
            <TestimonyCarousel
              testimonials={testimonials}
              onShareStory={() => setShowStoryModal(true)}
            />
          </div>
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