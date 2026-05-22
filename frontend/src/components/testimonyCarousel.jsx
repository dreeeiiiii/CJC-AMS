import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";

const TestimonyCarousel = ({ testimonials, onShareStory }) => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const total = testimonials.length + 1;

  const slideWidth = containerRef.current?.offsetWidth || 0;

  const goTo = useCallback((index) => {
    if (index < 0) setCurrent(total - 1);
    else if (index >= total) setCurrent(0);
    else setCurrent(index);
  }, [total]);

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const isTestimony = current < testimonials.length;
  const t = isTestimony ? testimonials[current] : null;

  const handleDragEnd = (_, { offset, velocity }) => {
    const swipe = offset.x * velocity.x;
    if (Math.abs(offset.x) > slideWidth * 0.2 || Math.abs(swipe) > 5000) {
      if (offset.x < 0) next();
      else prev();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="overflow-hidden rounded-xl">
        <motion.div
          className="flex"
          animate={{ x: -current * (slideWidth || 1) }}
          drag="x"
          dragConstraints={{ left: -(total - 1) * (slideWidth || 1), right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {testimonials.map((t, i) => (
            <div
              key={`t-${i}`}
              className="w-full flex-shrink-0 flex flex-col items-center px-4 py-8"
              style={{ minWidth: 0 }}
            >
              {t.avatar && (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-16 h-16 rounded-full mb-4 border-2 border-white/50 object-cover"
                />
              )}
              <p className="text-white/90 text-lg md:text-xl font-light italic leading-relaxed mb-6 max-w-2xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-white font-semibold text-base">{t.name}</p>
            </div>
          ))}

          <div
            key="share"
            className="w-full flex-shrink-0 flex flex-col items-center justify-center px-4 py-10"
            style={{ minWidth: 0 }}
          >
            <MessageSquareQuote size={48} className="text-white/40 mb-4" />
            <p className="text-white/90 text-lg italic mb-2 text-center">
              {testimonials.length === 0
                ? "No testimonies have been shared yet. How has God worked in your life lately?"
                : "Your story can inspire someone. Share your testimony and encourage the community."}
            </p>
            <button
              onClick={onShareStory}
              className="mt-4 px-6 py-2 bg-white text-[#3B4B89] rounded-full font-semibold text-sm hover:bg-gray-100 transition-all duration-300"
            >
              Share My Story
            </button>
          </div>
        </motion.div>
      </div>

      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
              i === current ? "bg-white" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonyCarousel;
