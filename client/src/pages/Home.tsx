import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Sparkles, ShieldCheck, ArrowRight, Star, Clock, CheckCircle2, Play, Zap, Palette, Layers, HelpCircle } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { CinematicHeroVideo } from '../components/hero/CinematicHeroVideo';
import { VideoCard } from '../components/video/VideoCard';
import { VideoModal } from '../components/video/VideoModal';
import { YoutubeChannelShowcase } from '../components/video/YoutubeChannelShowcase';
import { PublicWork } from '../types';

export const Home: React.FC = () => {
  const { services, works, testimonials, cms, setPreSelectedServiceId, setIsPricingClarificationOpen, setClarificationServiceTitle } = useStudio();
  const [selectedWorkModal, setSelectedWorkModal] = useState<PublicWork | null>(null);
  const navigate = useNavigate();

  const featuredServices = services.filter((s) => s.featured || s.isActive).slice(0, 6);
  const featuredWorks = works.filter((w) => w.isFeatured || w.isPublished).slice(0, 4);
  const featuredTestimonials = testimonials.slice(0, 3);

  const handleBookService = (serviceId: string) => {
    setPreSelectedServiceId(serviceId);
    navigate('/book');
  };

  const handleClarify = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClarificationServiceTitle(title);
    setIsPricingClarificationOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-ivory-100 space-y-24 pb-20">
      {/* 1. Cinematic Hero Section with Video Banner Flow */}
      <CinematicHeroVideo />

      {/* 2. Specialized Services Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Post-Production Offerings
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
              Specialized Video Editing Services
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 max-w-xl font-light">
              Each package is treated with dedicated cinematic color grading, multi-camera audio restoration, and tailored rhythmic editing.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gold hover:text-gold-light group"
          >
            <span>View All 10 Services & Pricing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-6 border border-gold/20 relative group"
            >
              {service.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] uppercase font-bold tracking-wider">
                  {service.badge}
                </div>
              )}

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Film className="w-5 h-5" />
                </div>

                <h3 className="font-serif text-lg font-bold text-ivory-100 group-hover:text-gold transition-colors">
                  {service.title}
                </h3>

                <p className="text-xs text-ivory-300 leading-relaxed font-light">
                  {service.shortDescription}
                </p>

                {/* Price Pill & Clarification button */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-ivory-400 uppercase tracking-wider block">
                      Estimated Cost:
                    </span>
                    <span className="font-serif text-base font-bold text-gold">
                      {service.priceLabel}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleClarify(service.title, e)}
                    className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 border border-gold/20 text-ivory-300 hover:text-gold text-xs flex items-center gap-1"
                    title="Need price clarification?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Clarify</span>
                  </button>
                </div>

                {/* Inclusions checklist preview */}
                <div className="space-y-1.5 pt-2 border-t border-surface-50">
                  {service.inclusions?.slice(0, 2).map((inc, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-ivory-300">
                      <CheckCircle2 className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleBookService(service.id)}
                className="w-full py-2.5 rounded-xl bg-surface-100 group-hover:bg-gold group-hover:text-black text-ivory-200 border border-gold/30 group-hover:border-gold text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Book This Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Selected Cinematic Works Showcase (Single-Active Playback) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
              <Film className="w-3.5 h-3.5" /> Portfolio Reel
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
              Selected Works & Master Highlight Cuts
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 max-w-xl font-light">
              All cinematic highlight films play in real-time 4K muted autoplay loop. Tap any film for full cinema view or tap the speaker icon to unmute.
            </p>
          </div>

          <Link
            to="/works"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gold hover:text-gold-light group"
          >
            <span>Explore All Portfolio Works</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Video Cards Grid */}
        {featuredWorks.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel text-center space-y-3 border border-gold/15">
            <Film className="w-10 h-10 mx-auto text-gold opacity-60" />
            <h3 className="font-serif text-lg font-bold text-ivory-100">Showcase Works Updating</h3>
            <p className="text-xs text-ivory-300 max-w-md mx-auto">
              New client films and cinematic highlight cuts are being published. Check back shortly or explore our specialized services below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredWorks.map((work) => (
              <VideoCard
                key={work.id}
                work={work}
                onSelect={(w) => setSelectedWorkModal(w)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Official YouTube Channel & Live Activity Streams */}
      <YoutubeChannelShowcase />

      {/* 5. Why Choose KBK Films (Competitive Edge) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel gold-border-glow space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              The KBK Advantage
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
              Why Clients & Filmmakers Trust Kurudi Bharath Kumar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-surface-100/70 border border-gold/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-ivory-100">
                Hollywood Color Science
              </h3>
              <p className="text-xs text-ivory-300 leading-relaxed font-light">
                Tailored LUTs and DaVinci Resolve color grading optimized for rich Indian wedding silks, warm skin tones, and golden lighting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100/70 border border-gold/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-ivory-100">
                Spot Editing at Venue
              </h3>
              <p className="text-xs text-ivory-300 leading-relaxed font-light">
                Mobile editing suite brought directly to your venue for same-day reception LED screen projections and live viral teasers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100/70 border border-gold/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-ivory-100">
                Strict Data Isolation
              </h3>
              <p className="text-xs text-ivory-300 leading-relaxed font-light">
                No public shared folders. Every client receives an isolated private delivery locker with encrypted streaming and 4K master downloads.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100/70 border border-gold/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-ivory-100">
                Reliable Turnaround
              </h3>
              <p className="text-xs text-ivory-300 leading-relaxed font-light">
                Strict timeline adherence with milestone tracking from raw footage ingestion to final master export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Client Testimonials Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
              <Star className="w-3.5 h-3.5 fill-gold" /> Verified Client Praise
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
              What Clients Say About KBK Films
            </h2>
          </div>

          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gold hover:text-gold-light group"
          >
            <span>View All Client Reviews</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTestimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl glass-panel border border-gold/20 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-ivory-200 italic leading-relaxed font-light">
                  "{t.reviewText}"
                </p>
              </div>

              <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-ivory-100">{t.clientName}</h4>
                  <p className="text-[11px] text-ivory-400">{t.serviceTitle} • {t.location}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-accent-emerald/15 text-accent-emerald text-[10px] font-semibold border border-accent-emerald/30">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. High-Converting Booking Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center space-y-6 bg-gradient-to-br from-surface-100 via-surface-200 to-black border border-gold/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 blur-[100px] pointer-events-none"></div>

          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Ready to Bring Your Footage to Life?
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-100 max-w-3xl mx-auto leading-tight">
            Reserve Your Post-Production Slot with KBK Films
          </h2>

          <p className="text-xs sm:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            Submit your event details and raw footage volume for a fast quotation, milestone tracking, and private master delivery.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/book"
              className="px-8 py-4 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-sm tracking-wide shadow-gold-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Booking Request
            </Link>
            <a
              href={`https://wa.me/91${cms?.whatsappNumber || '9346227894'}?text=Hi%20Bharath%20Kumar,%20I%20want%20to%20inquire%20about%20video%20editing%20for%20my%20event.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl bg-accent-emerald/15 hover:bg-accent-emerald/25 border border-accent-emerald/40 text-accent-emerald font-semibold text-sm transition-all"
            >
              WhatsApp Us: +91 {cms?.phone || '9346227894'}
            </a>
          </div>
        </div>
      </section>

      {/* Video Modal Popup */}
      <VideoModal
        work={selectedWorkModal}
        onClose={() => setSelectedWorkModal(null)}
      />
    </div>
  );
};
