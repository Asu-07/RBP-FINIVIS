import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { Linkedin, Instagram, Facebook, ArrowRight } from 'lucide-react';
import CircularGallery from "@/components/CircularGallery";

interface GalleryStructure {
  images: string[];
  folders: Record<string, GalleryStructure>;
  generatedAt: string;
}

const founderInfo = {
  title: "Founder & Chairman",
  name: "Sam Gupta",
  bio: `Sam Gupta is the Founder and Chairman of RBP Finivis Pvt. Ltd., bringing extensive leadership experience across financial services, fintech operations, and business management. With a career spanning multiple years in regulated and process-driven environments, he has been closely involved in building, operating, and scaling financial service platforms focused on reliability, compliance, and long-term value creation.

Over the course of his professional journey, Mr. Gupta has held leadership and decision-making responsibilities across areas such as foreign exchange services, payment solutions, financial operations, partner management, and business strategy. His experience combines hands-on operational knowledge with high-level oversight, enabling him to design systems that are both commercially viable and institutionally sound.

As Chairman, he provides strategic direction to RBP Finivis, overseeing governance frameworks, operational discipline, and growth initiatives. He plays a key role in shaping the company's approach to compliance, risk awareness, and client trust—ensuring that every service offered aligns with regulatory expectations and ethical business practices.

Mr. Gupta is known for his structured leadership style, long-term vision, and commitment to building sustainable financial organizations rather than short-term ventures. His focus on transparency, accountability, and process excellence has helped establish RBP Finivis as a dependable financial services firm serving businesses and individuals with professionalism and integrity.

Under his stewardship, the company continues to strengthen its capabilities across fintech-enabled services while maintaining a strong foundation in compliance, security, and client confidence.`,
  image: "/gallery/Founder-ceo/founder.jpeg",
  linkedin: "https://www.linkedin.com/in/ssamguptta?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  social: [
    { icon: Linkedin, link: "https://www.linkedin.com/company/aeps-api-provider/", label: "LinkedIn" },
    { icon: Instagram, link: "https://www.instagram.com/rbp_finivis?igsh=MTh2b282aTlnZmt2MA==", label: "Instagram" },
    { icon: Facebook, link: "https://www.facebook.com/share/1DttDuhuxu/?mibextid=wwXIfr", label: "Facebook" },
  ]
};

// Color scheme for different sections
const colorSchemes: Record<string, { gradient: string; accent: string; dark: string; light: string }> = {
  'Investors-meet': {
    gradient: 'from-amber-500 to-orange-600',
    accent: 'bg-amber-500',
    dark: 'from-amber-600 to-orange-700',
    light: 'from-amber-50 to-orange-50'
  },
  'Office-staff': {
    gradient: 'from-blue-500 to-cyan-600',
    accent: 'bg-blue-500',
    dark: 'from-blue-600 to-cyan-700',
    light: 'from-blue-50 to-cyan-50'
  },
  'Office-building': {
    gradient: 'from-slate-500 to-gray-600',
    accent: 'bg-slate-500',
    dark: 'from-slate-600 to-gray-700',
    light: 'from-slate-50 to-gray-50'
  },
  "Horse's Stable": {
    gradient: 'from-purple-500 to-pink-600',
    accent: 'bg-purple-500',
    dark: 'from-purple-600 to-pink-700',
    light: 'from-purple-50 to-pink-50'
  },
};

const folderTitles: Record<string, string> = {
  'Investors-meet': 'Investors Meet',
  'Office': 'Office',
  'Office-staff': 'Office Staff',
  'Office-building': 'Office Building',
  'Logo': 'Company Logo',
  "Horse's Stable": 'The Biggest Deal in the History of Horses Stable',
};

const getEmojiForFolder = (folderName: string): string => {
  const emojiMap: Record<string, string> = {
    'Investors-meet': '🤝',
    'Office': '🏢',
    'Office-staff': '👥',
    'Office-building': '🏢',
    'Logo': '🎨',
    "Horse's Stable": '🐴',
  };
  return emojiMap[folderName] || '📸';
};

const getDescriptionForFolder = (folderName: string): string => {
  const descriptionMap: Record<string, string> = {
    'Investors-meet': 'Memorable moments with our valued investors and partners',
    'Office': 'Explore our workspace, team, and facilities',
    'Office-staff': 'Meet the talented team behind RBP FINIVIS',
    'Office-building': 'Our state-of-the-art workspace and facilities',
    'Logo': 'Our iconic brand identity and visual heritage',
    "Horse's Stable": 'The biggest milestone in our history',
  };
  return descriptionMap[folderName] || '';
};

const Gallery = () => {
  return (
    <Layout>
      <Helmet>
        <title>Gallery - RBP FINIVIS</title>
      </Helmet>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-6 inline-block"
              >
                <div className="text-6xl">📸</div>
              </motion.div>
              <p className="text-sm uppercase tracking-widest mb-4 text-purple-200 font-semibold">Our Moments</p>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Gallery</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                A glimpse into our workspace, team, and the moments that define RBP FINIVIS
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Founder Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 md:py-28 bg-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Founder Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl opacity-30 blur-2xl"
                ></motion.div>
                <div className="relative bg-white p-2 rounded-3xl shadow-2xl">
                  <img
                    src={founderInfo.image}
                    alt={founderInfo.name}
                    className="w-full h-auto rounded-3xl object-cover"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                </div>
                
                {/* Social Icons at bottom of image */}
                <div className="mt-8 flex justify-center gap-4 relative z-20">
                  {founderInfo.social.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all"
                        title={item.label}
                      >
                        <Icon size={20} />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Founder Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col justify-center"
            >
              <motion.p
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-sm uppercase tracking-widest mb-4"
              >
                {founderInfo.title}
              </motion.p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                {founderInfo.name}
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {founderInfo.bio}
              </p>
              <motion.a
                href={founderInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 8 }}
                className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition-all w-fit"
              >
                <Linkedin size={20} />
                View LinkedIn Profile
                <ArrowRight size={20} />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Gallery Sections */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <GalleryGroups />
        </div>
      </div>
    </Layout>
  );
};

function GalleryGroups() {
  const [data, setData] = useState<GalleryStructure | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/gallery/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error('manifest not found');
        return res.json();
      })
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((err) => {
        console.error('Failed to load gallery manifest:', err);
        if (mounted) setData({ images: [], folders: {}, generatedAt: new Date().toISOString() });
      });

    return () => { mounted = false; };
  }, []);

  if (!data) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block text-4xl mb-4"
        >
          ⏳
        </motion.div>
        <p className="text-gray-600">Loading gallery...</p>
      </div>
    );
  }

  // Filter out Founder-ceo and Logo folders
  const filteredFolders = Object.entries(data.folders).filter(
    ([name]) => name !== 'Founder-ceo' && name !== 'Logo'
  );

  // Combine Office-building and Office-staff into a single Office folder
  const combinedFolders = filteredFolders.reduce((acc: Array<[string, GalleryStructure]>, [folderName, folderData]) => {
    const existingOfficeIdx = acc.findIndex(([name]) => name === 'Office');
    
    if (folderName === 'Office-building' || folderName === 'Office-staff') {
      if (existingOfficeIdx !== -1) {
        // Merge with existing Office folder
        const [, existingData] = acc[existingOfficeIdx];
        const mergedData: GalleryStructure = {
          images: [...(existingData.images || []), ...(folderData.images || [])],
          folders: { ...existingData.folders, ...folderData.folders },
          generatedAt: new Date().toISOString(),
        };
        acc[existingOfficeIdx] = ['Office', mergedData];
      } else {
        acc.push(['Office', folderData]);
      }
    } else {
      acc.push([folderName, folderData]);
    }
    return acc;
  }, []);

  // Separate folders: sections before Horse's Stable, and sections after
  const horsesStableIdx = combinedFolders.findIndex(([name]) => name === "Horse's Stable");
  const beforeHorses = combinedFolders.slice(0, horsesStableIdx + 1);
  const afterHorses = combinedFolders.slice(horsesStableIdx + 1);

  return (
    <div className="space-y-24">
      {/* Sections before and including Horse's Stable */}
      {beforeHorses.map(([folderName, folderData], idx) => {
        const colors = colorSchemes[folderName] || colorSchemes['Office-staff'];
        const allImages = collectAllImages(folderData);
        
        return (
          <motion.div
            key={folderName}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
          >
            {folderName === "Horse's Stable" ? (
              <HorsesStableSection folderData={folderData} />
            ) : (
              <CircularGallery
                title={folderTitles[folderName] || folderName}
                images={allImages}
                colorScheme={colors}
                emoji={getEmojiForFolder(folderName)}
                description={getDescriptionForFolder(folderName)}
              />
            )}
          </motion.div>
        );
      })}

      {/* Sections after Horse's Stable - also use CircularGallery */}
      {afterHorses.map(([folderName, folderData], idx) => {
        const colors = colorSchemes[folderName] || colorSchemes['Office-staff'];
        const allImages = collectAllImages(folderData);
        
        return (
          <motion.div
            key={folderName}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: (beforeHorses.length + idx) * 0.15 }}
          >
            <CircularGallery
              title={folderTitles[folderName] || folderName}
              images={allImages}
              colorScheme={colors}
              emoji={getEmojiForFolder(folderName)}
              description={getDescriptionForFolder(folderName)}
            />
          </motion.div>
        );
      })}

      {/* Root level images */}
      {data.images && data.images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: (beforeHorses.length + afterHorses.length) * 0.15 }}
        >
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-xl">
            <h2 className="text-4xl md:text-5xl font-bold">Other Moments</h2>
            <div className="h-1 bg-white/30 mt-4 rounded-full w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.images.map((img, idx) => (
              <ImageCard key={img + idx} src={img} index={idx} colorScheme="Office-staff" />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function HorsesStableSection({ folderData }: { folderData: GalleryStructure }) {
  const screenshot = "/gallery/Horse's Stable/Screenshot 2026-02-03 023536.png";
  const logo = "/gallery/Horse's Stable/horses stable logo.jpg";
  const youtubeLink = "https://youtu.be/x3RKRGqN15s?si=Q4CrESPT_GzEOrIs";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 opacity-20"></div>
      <div className="bg-gradient-to-br from-gray-50 to-white relative z-10 p-8 md:p-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* YouTube Link Wrapper - Screenshot */}
          <motion.a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, rotate: 2 }}
            className="flex-1 group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/50">
              <motion.img
                src={screenshot}
                alt="Horse's Stable Deal"
                className="w-full h-auto object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-red-600 to-red-700 rounded-full p-6 shadow-2xl"
                >
                  <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.a>

          {/* Logo and Info */}
          <div className="flex-1 flex flex-col items-center lg:items-start gap-8">
            {/* Logo as Link */}
            <motion.a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08, rotate: -2 }}
              className="w-56 h-56 flex items-center justify-center bg-white rounded-2xl shadow-xl hover:shadow-purple-500/50 transition-all overflow-hidden border-4 border-gradient-to-r from-purple-300 to-pink-300"
            >
              <img
                src={logo}
                alt="Horse's Stable Logo"
                className="w-full h-full object-contain p-6"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
            </motion.a>

            {/* Info Text */}
            <div className="text-center lg:text-left">
              <p className="text-gray-700 text-lg leading-relaxed font-medium">
                Click to watch the exclusive YouTube video about this historic partnership and milestone!
              </p>
              <motion.a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 mt-6 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-full hover:shadow-xl transition-all"
              >
                <span>Watch on YouTube</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 15.472l-1.318-7.98c-.1-.59-.556-1.052-1.16-1.052h-.002c-.603 0-1.06.462-1.16 1.05l-1.318 7.98c-.12.69.415 1.33 1.118 1.33.702 0 1.238-.64 1.118-1.33zm-3.63-6.55c-.6 0-1.055.46-1.155 1.05l-1.32 7.98c-.118.69.418 1.33 1.12 1.33.7 0 1.236-.64 1.116-1.33l-1.32-7.98c-.1-.59-.556-1.05-1.16-1.05z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ImageGrid({ folderData, folderName, colors }: { folderData: GalleryStructure; folderName?: string; colors?: any }) {
  const allImages = collectAllImages(folderData);
  
  // Masonry-style layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
      {allImages.map((src, idx) => {
        // Create varied heights for masonry effect
        const heights = ['h-64', 'h-72', 'h-80'];
        const height = heights[idx % heights.length];
        return (
          <ImageCard
            key={src + idx}
            src={src}
            index={idx}
            colorScheme={folderName}
            height={height}
            colors={colors}
          />
        );
      })}
    </div>
  );
}

function ImageCard({ src, index, colorScheme, height = 'h-64', colors }: { src: string; index: number; colorScheme?: string; height?: string; colors?: any }) {
  const isInvestorsMeet = colorScheme === 'Investors-meet';
  const isOfficeBuilding = colorScheme === 'Office-building';
  const scheme = colors || colorSchemes[colorScheme || ''] || colorSchemes['Office-staff'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${height} cursor-pointer`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-0 group-hover:opacity-10 transition-all duration-300`}></div>
      
      <img
        src={src}
        alt="Gallery item"
        className="w-full h-full transition-transform duration-500 group-hover:scale-110"
        style={{
          objectFit: isOfficeBuilding ? 'contain' : 'cover',
          objectPosition: isInvestorsMeet ? 'center 35%' : 'center',
        }}
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
      />
      
      {/* Gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent`}
      />
      
      {/* Floating action button on hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 flex items-center justify-center`}
      >
        <div className={`bg-gradient-to-r ${scheme.gradient} rounded-full p-4 shadow-2xl`}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

function collectAllImages(folderData: GalleryStructure): string[] {
  let images = [...(folderData.images || [])];
  for (const subFolder of Object.values(folderData.folders || {})) {
    images.push(...collectAllImages(subFolder));
  }
  return images;
}

// Interactive Collage Section Component
function InteractiveCollageSection({ folders, startIdx }: { folders: Array<[string, GalleryStructure]>; startIdx: number }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Process folders to combine Office Building and Office Staff
  const processedFolders = folders.reduce((acc: Array<[string, GalleryStructure]>, [folderName, folderData]) => {
    if (folderName === 'Office-building' || folderName === 'Office-staff') {
      const existingOfficeIdx = acc.findIndex(([name]) => name === 'Office');
      if (existingOfficeIdx !== -1) {
        // Merge with existing Office folder
        const [, existingData] = acc[existingOfficeIdx];
        const mergedData: GalleryStructure = {
          images: [...(existingData.images || []), ...(folderData.images || [])],
          folders: { ...existingData.folders, ...folderData.folders },
          generatedAt: new Date().toISOString(),
        };
        acc[existingOfficeIdx] = ['Office', mergedData];
      } else {
        acc.push(['Office', folderData]);
      }
    } else {
      acc.push([folderName, folderData]);
    }
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Decorative Background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-3xl opacity-40 blur-2xl"></div>

      <div className="relative z-10 bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-16 shadow-2xl border border-gray-100">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Our World in Focus
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our diverse collection of moments, spaces, and achievements
          </p>
          <div className="mt-6 h-1 w-24 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full mx-auto"></div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <motion.button
            onClick={() => setSelectedCategory(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Categories
          </motion.button>
          {processedFolders.map(([folderName]) => (
            <motion.button
              key={folderName}
              onClick={() => setSelectedCategory(folderName)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === folderName
                  ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {folderName === 'Office' ? '🏢 Office' : folderName === 'Investors-meet' ? '🤝 Investors' : folderName}
            </motion.button>
          ))}
        </div>

        {/* Interactive Collage */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-max">
          {processedFolders.map(([folderName, folderData], folderIdx) => {
            if (selectedCategory && selectedCategory !== folderName) return null;

            const allImages = collectAllImages(folderData);
            const displayLimit = selectedCategory === folderName ? allImages.length : 4;

            return (
              <motion.div
                key={folderName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: folderIdx * 0.1 }}
                className={selectedCategory === folderName ? 'lg:col-span-4' : ''}
              >
                {selectedCategory === folderName && (
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800"
                  >
                    <span className={`text-3xl ${
                      folderName === 'Office' ? '🏢' :
                      folderName === 'Investors-meet' ? '🤝' :
                      '📸'
                    }`}></span>
                    {folderName === 'Office' ? 'Office' : folderName === 'Investors-meet' ? 'Investors Meet' : folderName}
                  </motion.h3>
                )}

                <div className={`grid gap-4 md:gap-5 ${selectedCategory === folderName ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-max' : 'grid-cols-1'}`}>
                  {allImages.slice(0, displayLimit).map((src, imgIdx) => (
                    <CollageImageItem
                      key={src + imgIdx}
                      src={src}
                      index={imgIdx}
                      folderName={folderName}
                      isHovered={hoveredImage === src}
                      onHover={(img) => setHoveredImage(img)}
                      isExpanded={selectedCategory === folderName}
                    />
                  ))}
                </div>

                {/* View More Button */}
                {selectedCategory !== folderName && allImages.length > 4 && (
                  <motion.button
                    onClick={() => setSelectedCategory(folderName)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    View {allImages.length - 4} More
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Collage Image Item Component
function CollageImageItem({
  src,
  index,
  folderName,
  isHovered,
  onHover,
  isExpanded,
}: {
  src: string;
  index: number;
  folderName: string;
  isHovered: boolean;
  onHover: (img: string | null) => void;
  isExpanded: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getColorGradient = () => {
    if (folderName === 'Office') return 'from-blue-500 to-cyan-500';
    if (folderName === 'Investors-meet') return 'from-amber-500 to-orange-500';
    return 'from-indigo-500 to-purple-500';
  };

  const randomHeight = isExpanded ? ['h-56', 'h-64', 'h-72'][index % 3] : 'h-48';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ scale: 1.08, zIndex: 20 }}
        onMouseEnter={() => onHover(src)}
        onMouseLeave={() => onHover(null)}
        onClick={() => setIsModalOpen(true)}
        className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${randomHeight}`}
      >
        {/* Image */}
        <img
          src={src}
          alt="Gallery item"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
        />

        {/* Gradient Overlay on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent`}
        />

        {/* Icon on Hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 flex items-center justify-center`}
        >
          <div className={`bg-gradient-to-r ${getColorGradient()} rounded-full p-4 shadow-2xl backdrop-blur-sm`}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Corner Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 10-2 0v1a1 1 0 102 0v-1z" />
          </svg>
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh]"
            >
              <img
                src={src}
                alt="Enlarged view"
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Gallery;