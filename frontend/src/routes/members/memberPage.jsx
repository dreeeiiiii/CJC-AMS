import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, MessageSquareQuote } from "lucide-react";
import MemberLayout from "../../components/MemberLayout";

const MemberPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const baseUrl = "http://localhost:5000/api/content";
        
        const [verseRes, testimonyRes] = await Promise.all([
          fetch(`${baseUrl}/verse/today`),
          fetch(`${baseUrl}/testimonies`)
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

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

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
      {/* Verse of the Day Section */}
      <section className="bg-white px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3B4B89] mb-6">Verse of the Day!</h2>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed mb-4">
                {verse?.content ? `"${verse.content}"` : '"Trust in the Lord with all your heart..."'}
              </p>
              <p className="text-lg font-semibold text-[#3B4B89]">
                — {verse?.reference || "Proverbs 3:5"} {verse?.topic ? `(${verse.topic})` : verse?.content ? "" : "(Daily Encouragement)"}
              </p>
              {!verse?.content && (
                <p className="mt-2 text-xs text-gray-400 italic font-medium">Administrator has not updated today's verse yet.</p>
              )}
            </div>

            <div className="w-full md:w-72 lg:w-80 aspect-square rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-[#3B4B89]/20 to-[#3B4B89]/5 flex items-center justify-center">
                <div className="text-center p-6">
                  <p className="text-lg font-semibold text-[#3B4B89] mb-2">{verse?.reference || "Reflection"}</p>
                  <p className="text-sm text-gray-600 italic">{verse?.topic || "Check back soon"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#3B4B89] px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Testimonies</h2>

          {testimonials.length > 0 ? (
            <div className="relative">
              <div className="flex flex-col items-center">
                <img
                  src={testimonials[currentTestimonial].avatar || "/default-avatar.png"}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full mb-4 border-2 border-white/50 object-cover"
                />
                <p className="text-white/90 text-lg md:text-xl font-light italic leading-relaxed mb-6 max-w-2xl">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <p className="text-white font-semibold text-base">
                  {testimonials[currentTestimonial].name}
                </p>
              </div>

              {testimonials.length > 1 && (
                <>
                  <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${i === currentTestimonial ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="group flex flex-col items-center py-10 opacity-80 relative">
              <MessageSquareQuote
                size={48}
                className="text-white/40 mb-4"
              />

              <p className="text-white/90 text-lg italic">
                "No testimonies have been shared yet. How has God worked in your life lately?"
              </p>

              <a
                href="https://forms.gle/75P6vqRV255yVNZ36"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-6 px-6 py-2 bg-white text-[#3B4B89]
                  rounded-full font-semibold text-sm
                  hover:bg-gray-100 transition-all duration-300
                  opacity-0 translate-y-2
                  group-hover:opacity-100
                  group-hover:translate-y-0
                  inline-block
                "
              >
                Share My Story
              </a>
            </div>
          )}
        </div>
      </section>
    </MemberLayout>
  );
};

export default MemberPage;