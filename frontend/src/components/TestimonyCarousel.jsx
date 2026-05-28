import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";

const MAX_CHARS = 125;

const TestimonyCarousel = ({ testimonials, onShareStory }) => {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
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

  const handleDragEnd = (_, { offset, velocity }) => {
    const swipe = offset.x * velocity.x;
    if (Math.abs(offset.x) > slideWidth * 0.2 || Math.abs(swipe) > 5000) {
      if (offset.x < 0) next();
      else prev();
    }
  };

  return (
    <div className="flex flex-col" ref={containerRef}>

      {/* Slides */}
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
              className="w-full flex-shrink-0 flex flex-col items-center px-2 pt-4 pb-2"
              style={{ minWidth: 0 }}
            >
              {t.avatar && (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full mb-3 border-2 border-white/50 object-cover"
                />
              )}
              {(() => {
                const isLong = t.quote && t.quote.length > MAX_CHARS;
                const displayQuote = isLong && !expanded
                  ? t.quote.slice(0, MAX_CHARS)
                  : t.quote;
                return (
                  <div className="text-white/90 text-base font-light italic leading-relaxed mb-2">
                    <span>&ldquo;{displayQuote}{isLong && !expanded ? "…" : ""}&rdquo;</span>
                    {isLong && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="inline-flex items-center text-xs font-bold text-[#3B4B89] bg-white px-2.5 py-1 rounded-full hover:bg-white/90 transition ml-1.5 align-middle shadow-sm"
                      >
                        {expanded ? "See Less" : "See More"}
                      </button>
                    )}
                  </div>
                );
              })()}
              <p className="text-white font-semibold text-sm">— {t.name}</p>
            </div>
          ))}

          {/* Share slide */}
          <div
            key="share"
            className="w-full flex-shrink-0 flex flex-col items-center justify-center px-2 pt-4 pb-2"
            style={{ minWidth: 0 }}
          >
            <MessageSquareQuote size={36} className="text-white/40 mb-3" />
            <p className="text-white/90 text-sm italic text-center leading-relaxed">
              {testimonials.length === 0
                ? "No testimonies yet. How has God worked in your life lately?"
                : "Your story can inspire someone. Share your testimony and encourage the community."}
            </p>
            <button
              onClick={onShareStory}
              className="mt-4 px-5 py-1.5 bg-white text-[#3B4B89] rounded-full font-semibold text-sm hover:bg-gray-100 transition-all duration-300"
            >
              Share My Story
            </button>
          </div>
        </motion.div>
      </div>

      {/* Prev / Next + Dots — all in one row */}
      {total > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition cursor-pointer ${
                  i === current ? "bg-white" : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition flex-shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default TestimonyCarousel;