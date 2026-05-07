import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MemberLayout from "../../components/MemberLayout";

const MemberPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Gwy Tolentino",
      avatar: "/profile.jpg",
      quote: "This year, I look back in awe at the power of the cross. God's faithfulness carried me through as I just completed the 1st semester of my last year at UPLB. He provided all of my needs according to His riches and glory by Christ Jesus. Praise Him!",
    },
    
    {
      name: "Francine Molina",
      avatar: "/profile.jpg",
      quote: "Being part of this community has strengthened my faith. The fellowship and support I've received here have been truly life-changing.",
    },
    {
      name: "Hazel Malitig",
      avatar: "/profile.jpg",
      quote: "This church has become my second home. I'm grateful for the love and guidance I receive every time I attend service.",
    },
    {
      name: "Hannah Malitig",
      avatar: "/profile.jpg",
      quote: "The teachings here have helped me grow closer to God and understand His purpose for my life.",
    },
  ];

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

  return (
    <MemberLayout activeNav="home">
      {/* Verse of the Day Section */}
      <section className="bg-white px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3B4B89] mb-6">Verse of the Day!</h2>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed mb-4">
                "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God."
              </p>
              <p className="text-lg font-semibold text-[#3B4B89]">— John 1:12 (NIV)</p>
            </div>

            <div className="w-full md:w-72 lg:w-80 aspect-square rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-[#3B4B89]/20 to-[#3B4B89]/5 flex items-center justify-center">
                <div className="text-center p-6">
                  <p className="text-lg font-semibold text-[#3B4B89] mb-2">John 1:12</p>
                  <p className="text-sm text-gray-600 italic">Children of God</p>
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

          <div className="relative">
            <div className="flex flex-col items-center">
              <img
                src={testimonials[currentTestimonial].avatar}
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

            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  i === currentTestimonial ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </MemberLayout>
  );
};

export default MemberPage;