import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, CheckCircle2, XCircle, Clock, Sparkles, HelpCircle, ArrowRight, ShieldAlert, Zap, MessageCircle, Phone } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { ServiceItem } from '../types';

export const Services: React.FC = () => {
  const { services, setPreSelectedServiceId, setIsPricingClarificationOpen, setClarificationServiceTitle, cms } = useStudio();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const navigate = useNavigate();

  const handleBook = (serviceId: string) => {
    setPreSelectedServiceId(serviceId);
    navigate('/book');
  };

  const handleClarify = (title: string) => {
    setClarificationServiceTitle(title);
    setIsPricingClarificationOpen(true);
  };

  const activeServices = services.filter((s) => s.isActive);
  const filteredServices = selectedFilter === 'all'
    ? activeServices
    : selectedFilter === 'wedding'
    ? activeServices.filter(s => s.slug.includes('wedding') || s.slug.includes('haldi'))
    : selectedFilter === 'ceremonies'
    ? activeServices.filter(s => s.slug.includes('maternity') || s.slug.includes('baby') || s.slug.includes('house'))
    : selectedFilter === 'fast'
    ? activeServices.filter(s => s.slug.includes('spot') || s.slug.includes('teasers'))
    : activeServices.filter(s => s.isUpcoming);

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Studio Catalogue & Transparent Pricing
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-100">
          Specialized Video Editing & Post-Production
        </h1>
        <p className="text-xs sm:text-sm text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
          From full wedding master reels and same-day spot edits to vertical teasers and upcoming AI neural enhancements.
        </p>

        {/* Pricing Scope Notice Banner */}
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-surface-100/80 border border-gold/30 text-left flex items-start gap-3.5 text-xs text-ivory-300">
          <ShieldAlert className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-gold block">Transparent Pricing Policy:</span>
            <p className="leading-relaxed">
              {cms?.priceDisclaimer ||
                'The displayed price covers only the selected editing or video-production service and the deliverables stated in your booking. Accommodation, food, travel, local transport, venue charges, permits, courier expenses, and any other on-location or third-party expenses are not included unless specifically confirmed in writing. These arrangements and costs must be managed by the client.'}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'all', label: 'All 10 Services' },
            { id: 'wedding', label: 'Weddings & Sangeeth' },
            { id: 'ceremonies', label: 'Ceremonies & Maternity' },
            { id: 'fast', label: 'Spot Editing & Fast Reels' },
            { id: 'ai', label: 'Studio Next-Gen AI Labs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedFilter === tab.id
                  ? 'bg-gold text-black shadow-gold-sm'
                  : 'bg-surface-100 text-ivory-300 hover:bg-surface-50 border border-surface-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Services List Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`p-6 sm:p-8 rounded-3xl glass-panel border flex flex-col justify-between space-y-6 transition-all ${
                service.featured
                  ? 'border-gold/40 shadow-gold-sm bg-surface-100/60'
                  : 'border-surface-50 bg-surface-200/50'
              }`}
            >
              <div className="space-y-4">
                {/* Top Badge & Turnaround */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-gold/15 text-gold border border-gold/30">
                      <Film className="w-5 h-5" />
                    </span>
                    {service.badge && (
                      <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 text-[11px] text-ivory-300 border border-surface-50">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>Est. Turnaround: {service.turnaroundDays} Days</span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory-100">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gold font-medium mt-1">
                    {service.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed font-light">
                  {service.detailedDescription || service.shortDescription}
                </p>

                {/* Pricing Block */}
                <div className="p-4 rounded-2xl bg-surface-100/80 border border-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-ivory-400 uppercase tracking-widest block font-medium">
                      Service Fee:
                    </span>
                    <div className="font-serif text-xl sm:text-2xl font-bold text-gold">
                      {service.priceLabel}
                    </div>
                  </div>

                  <button
                    onClick={() => handleClarify(service.title)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-200 hover:bg-surface-50 text-ivory-200 hover:text-gold border border-gold/20 text-xs font-semibold transition-all self-start sm:self-center"
                  >
                    <HelpCircle className="w-4 h-4 text-gold" />
                    <span>Need Clarification?</span>
                  </button>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Inclusions */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-accent-emerald uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> What Is Included:
                    </span>
                    <ul className="space-y-1.5 text-xs text-ivory-300">
                      {service.inclusions?.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shrink-0 mt-1.5"></span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exclusions */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-accent-crimson uppercase tracking-wider flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Excluded (Client Arranged):
                    </span>
                    <ul className="space-y-1.5 text-xs text-ivory-400">
                      {service.exclusions?.map((exc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-crimson shrink-0 mt-1.5"></span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-surface-50 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleBook(service.id)}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Book This Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/91${cms?.whatsappNumber || '9346227894'}?text=Hi%20Bharath%20Kumar,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(service.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-accent-emerald/15 hover:bg-accent-emerald/25 text-accent-emerald border border-accent-emerald/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  title="WhatsApp Direct Inquiry"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
