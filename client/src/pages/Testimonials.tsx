import React, { useState } from 'react';
import { Star, MessageSquare, Volume2, VolumeX, ShieldCheck, Film, Sparkles, Play } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { Testimonial } from '../types';
import { getVideoType, getCleanVideoUrl, extractDriveFileId } from '../components/video/VideoCard';
import { CinematicVideoPlayer } from '../components/video/CinematicVideoPlayer';

export const Testimonials: React.FC = () => {
  const { testimonials } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);

  const categories = ['all', 'Wedding Video Highlights', 'Pre-Wedding Video Editing', 'Haldi & Sangeeth Ceremonies', 'Spot Editing Available', 'House Warming Ceremonies'];

  const filteredTestimonials = testimonials.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.serviceTitle.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Client Experiences & Feedback
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-100">
          What Our Clients Say
        </h1>
        <p className="text-xs sm:text-sm text-ivory-300 max-w-2xl mx-auto font-light">
          Real words and video testimonials from couples, families, and creators who trusted KBK Films for their post-production needs.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-gold text-black shadow-gold-sm'
                  : 'bg-surface-100 text-ivory-300 hover:bg-surface-50 border border-surface-50'
              }`}
            >
              {cat === 'all' ? 'All Reviews' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Testimonials Masonry / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((t) => {
            return (
              <div
                key={t.id}
                className="p-6 rounded-3xl glass-panel border border-gold/20 flex flex-col justify-between space-y-6 hover:border-gold/40 transition-all shadow-xl"
              >
                {/* If Customer Video Feedback Attached */}
                {t.videoUrl && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gold/20">
                    <CinematicVideoPlayer
                      url={t.videoUrl}
                      poster={t.thumbnailUrl || undefined}
                      title={`Client Review - ${t.clientName}`}
                      category="Video Review"
                      aspectRatio="16/9"
                      autoPlayOnScroll={true}
                      showControls={true}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 text-gold text-[9px] font-bold uppercase tracking-wider border border-gold/30 flex items-center gap-1 z-10 pointer-events-none">
                      <Film className="w-2.5 h-2.5" />
                      <span>Video Review</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 text-gold">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold" />
                    ))}
                    <span className="text-xs text-ivory-400 font-bold ml-1">
                      {t.rating}.0 / 5.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-ivory-200 italic leading-relaxed font-light">
                    "{t.reviewText}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-surface-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-ivory-100">
                      {t.clientName}
                    </h4>
                    <p className="text-[11px] text-ivory-400">
                      {t.serviceTitle} • {t.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-accent-emerald font-semibold bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
