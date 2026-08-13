import React, { useState } from 'react';
import { Film, Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { VideoCard } from '../components/video/VideoCard';
import { VideoModal } from '../components/video/VideoModal';
import { YoutubeChannelShowcase } from '../components/video/YoutubeChannelShowcase';
import { PublicWork } from '../types';

export const ExploreWorks: React.FC = () => {
  const { works } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkModal, setSelectedWorkModal] = useState<PublicWork | null>(null);

  const defaultCategories = [
    'Wedding Highlights',
    'Pre-Wedding Video Editing',
    'Haldi & Sangeeth Ceremonies',
    'Maternity Shoot Videos',
    'House Warming Ceremonies',
    'Spot Editing Available',
  ];

  const categories = [
    'all',
    ...Array.from(new Set([...defaultCategories, ...works.map((w) => w.category).filter(Boolean)])),
  ];

  const filteredWorks = works.filter((work) => {
    const matchesCategory = selectedCategory === 'all' || work.category === selectedCategory;
    const matchesSearch =
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.eventLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-12">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center justify-center gap-2">
          <Film className="w-3.5 h-3.5" /> Studio Post-Production Portfolio
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-100">
          Explore Works & Cinematic Reels
        </h1>
        <p className="text-xs sm:text-sm text-ivory-300 max-w-2xl mx-auto font-light">
          Browse through our curated portfolio of wedding films, pre-wedding visual narratives, and high-energy ceremony edits. Hover or tap to preview.
        </p>

        {/* Search & Filter Bar */}
        <div className="max-w-3xl mx-auto pt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by couple name, location, or ceremony..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm placeholder:text-ivory-400 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm text-gold focus:outline-none focus:border-gold font-medium"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-gold text-black shadow-gold-sm'
                  : 'bg-surface-100 text-ivory-400 hover:bg-surface-50 border border-surface-50'
              }`}
            >
              {cat === 'all' ? 'All Works' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Video Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredWorks.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel text-center space-y-3">
            <Film className="w-12 h-12 mx-auto text-gold opacity-50" />
            <h3 className="font-serif text-lg font-bold text-ivory-100">No Works Found</h3>
            <p className="text-xs text-ivory-300">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorks.map((work) => (
              <VideoCard
                key={work.id}
                work={work}
                onSelect={(w) => setSelectedWorkModal(w)}
              />
            ))}
          </div>
        )}
      </section>

      {/* YouTube Channel & Live Activity Streams */}
      <YoutubeChannelShowcase />

      {/* Video Modal Cinema View */}
      <VideoModal
        work={selectedWorkModal}
        onClose={() => setSelectedWorkModal(null)}
      />
    </div>
  );
};
