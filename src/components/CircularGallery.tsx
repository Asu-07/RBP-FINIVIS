import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CircularGalleryProps {
  title: string;
  images: string[];
  colorScheme: {
    gradient: string;
    accent: string;
    dark: string;
    light: string;
  };
  emoji?: string;
  description?: string;
}

const CircularGallery: React.FC<CircularGalleryProps> = ({
  title,
  images,
  colorScheme,
  emoji = "📸",
  description = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  // Calculate positions for circular arrangement
  const getCircularPositions = (totalImages: number, isExpanded: boolean) => {
    const imgsPerRing = isExpanded ? 12 : 8; // More images per ring when expanded
    const maxRings = Math.ceil(totalImages / imgsPerRing);
    const expandedRadius = isExpanded ? 150 : 90; // Larger radius when expanded

    return Array.from({ length: totalImages }).map((_, idx) => {
      const ring = Math.floor(idx / imgsPerRing);
      const posInRing = idx % imgsPerRing;
      const angleSlice = (Math.PI * 2) / imgsPerRing;
      const angle = angleSlice * posInRing - Math.PI / 2;

      // Increase radius for outer rings
      const ringRadius = expandedRadius + (ring * (isExpanded ? 80 : 50));
      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius;

      return { x, y, ring, posInRing };
    });
  };

  const displayCount = Math.min(images.length, 8);
  const angleSlice = (Math.PI * 2) / displayCount;
  const radius = 90; // Distance from center

  const getThumbnailPosition = (index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  const getExpandedThumbnailPosition = (index: number) => {
    const positions = getCircularPositions(images.length, true);
    return positions[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12">
        {/* Left: Title Section with Creative Styling */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex-1 w-full lg:w-auto order-2 lg:order-1"
        >
          <div className="relative">
            {/* Decorative background blur */}
            <div className={`absolute -inset-6 bg-gradient-to-br ${colorScheme.gradient} opacity-10 blur-3xl rounded-3xl`}></div>

            <div className="relative bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-white/50">
              {/* Accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-2 w-24 bg-gradient-to-r ${colorScheme.gradient} rounded-full mb-8 origin-left`}
              ></motion.div>

              {/* Emoji */}
              <motion.div
                animate={{ rotate: [0, 10, 0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-6 inline-block drop-shadow-md"
              >
                {emoji}
              </motion.div>

              {/* Title with gradient */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent leading-tight tracking-tight"
              >
                {title}
              </motion.h2>

              {/* Description */}
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-gray-600 text-xl leading-relaxed mb-10 max-w-lg font-medium"
                >
                  {description}
                </motion.p>
              )}

              {/* Enhanced CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center gap-4 group cursor-default"
              >
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <span className={`text-lg font-bold bg-gradient-to-r ${colorScheme.gradient} bg-clip-text text-transparent uppercase tracking-wider`}>
                  Hover to Explore
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right: Circular Image Gallery */}
        <motion.div
          className="flex-1 w-full lg:w-auto order-1 lg:order-2 flex justify-center items-center"
          animate={{
            scale: isExpanded ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative w-96 h-96 cursor-pointer flex justify-center items-center"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
              setIsExpanded(false);
              setHoveredImageIndex(null);
            }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Center large image when expanded */}
            <AnimatePresence mode="wait">
              {isExpanded && hoveredImageIndex !== null ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white p-2 border-4 border-white"
                  onClick={() => setSelectedImage(images[hoveredImageIndex])}
                >
                  <motion.img
                    src={images[hoveredImageIndex]}
                    alt={`Gallery ${hoveredImageIndex}`}
                    className="w-full h-full object-cover rounded-2xl cursor-pointer transition-transform duration-300 hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl pointer-events-none"
                  ></motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {/* Central decorative circle */}
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br ${colorScheme.gradient} opacity-20 blur-xl`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  ></motion.div>

                  {/* Circular thumbnails */}
                  {images.slice(0, displayCount).map((img, idx) => {
                    const pos = getThumbnailPosition(idx);
                    return (
                      <motion.div
                        key={idx}
                        className="absolute top-1/2 left-1/2"
                        initial={{
                          x: pos.x,
                          y: pos.y,
                          translateX: '-50%',
                          translateY: '-50%',
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          x: pos.x,
                          y: pos.y,
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        onMouseEnter={() => setHoveredImageIndex(idx)}
                        onMouseLeave={() => setHoveredImageIndex(null)}
                        whileHover={{ scale: 1.3, zIndex: 10 }}
                      >
                        <motion.div
                          className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-gradient-to-br ${colorScheme.gradient} p-0.5 group`}
                          whileHover={{
                            boxShadow: `0 0 30px rgba(99, 102, 241, 0.5)`,
                          }}
                        >
                          <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                            <motion.img
                              src={img}
                              alt={`Thumbnail ${idx}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                            />

                            {/* Gradient overlay on hover */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                            ></motion.div>

                            {/* Badge for image count */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
                            >
                              {idx + 1}
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}

                  {/* More photos indicator */}
                  {images.length > displayCount && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold shadow-xl border-4 border-white">
                        +{images.length - displayCount}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded state gallery - larger circle */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full shadow-2xl"
              >
                {/* Background glow for expanded circle */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient} opacity-5 rounded-full blur-3xl`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.1, 0.05]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                ></motion.div>

                {/* Central decorative circle */}
                <motion.div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br ${colorScheme.gradient} opacity-15 blur-2xl`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0.2, 0.15]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                ></motion.div>

                {/* All images arranged in expanded circle */}
                {images.map((img, idx) => {
                  const pos = getExpandedThumbnailPosition(idx);
                  return (
                    <motion.div
                      key={idx}
                      className="absolute top-1/2 left-1/2"
                      initial={{
                        x: pos.x,
                        y: pos.y,
                        translateX: '-50%',
                        translateY: '-50%',
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        x: pos.x,
                        y: pos.y,
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{ duration: 0.5, delay: idx * 0.03 }}
                      onMouseEnter={() => setHoveredImageIndex(idx)}
                      onMouseLeave={() => setHoveredImageIndex(null)}
                      whileHover={{ scale: 1.25, zIndex: 20 }}
                    >
                      <motion.div
                        className={`relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-gradient-to-br ${colorScheme.gradient} p-0.5 group`}
                        whileHover={{
                          boxShadow: `0 0 40px rgba(99, 102, 241, 0.7)`,
                        }}
                        onClick={() => setSelectedImage(img)}
                      >
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                          <motion.img
                            src={img}
                            alt={`Expanded gallery ${idx}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                          />

                          {/* Gradient overlay on hover */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                          ></motion.div>

                          {/* Image number badge */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
                          >
                            {idx + 1}
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[85vh]"
            >
              <motion.img
                src={selectedImage}
                alt="Fullscreen view"
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedImage(null)}
                className="absolute -top-14 right-0 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-3 transition-all"
              >
                <X size={24} />
              </motion.button>

              {/* Info badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                Click anywhere to close
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CircularGallery;
