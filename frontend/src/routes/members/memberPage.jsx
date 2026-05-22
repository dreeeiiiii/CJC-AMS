import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import MemberLayout from "../../components/MemberLayout";
import ShareStoryModal from "../../components/ShareStoryModal";
import TestimonyCarousel from "../../components/TestimonyCarousel";

const MemberPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);

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
          <TestimonyCarousel
            testimonials={testimonials}
            onShareStory={() => setShowStoryModal(true)}
          />
        </div>
      </section>
      <ShareStoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />
    </MemberLayout>
  );
};

export default MemberPage;