import React from 'react';
import { X, MessageCircle, Phone, Mail, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const PricingClarificationModal: React.FC = () => {
  const {
    isPricingClarificationOpen,
    setIsPricingClarificationOpen,
    clarificationServiceTitle,
    cms
  } = useStudio();

  if (!isPricingClarificationOpen) return null;

  const phone = cms?.phone || '9346227894';
  const email = cms?.email || 'kbkfilms.official@gmail.com';
  const service = clarificationServiceTitle || 'Custom Video Editing';

  const whatsappMessage = encodeURIComponent(
    `Hi Bharath Kumar, I am reviewing the pricing for "${service}" on KBK Film Studios and would like some quick clarification/custom quote for my event raw footage.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setIsPricingClarificationOpen(false)}
          className="absolute top-4 right-4 p-2 text-ivory-400 hover:text-white rounded-full bg-surface-100 hover:bg-surface-50 border border-gold/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gold/15 text-gold border border-gold/30 shrink-0">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-ivory-100">
              Pricing Clarification & Custom Quotes
            </h3>
            <p className="text-xs text-gold mt-1 font-medium">
              Service: <span className="text-white">{service}</span>
            </p>
          </div>
        </div>

        {/* Studio Pricing Policy Notice */}
        <div className="p-4 rounded-xl bg-surface-100 border border-gold/20 text-xs text-ivory-300 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 text-gold font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Important Pricing Scope Notice:</span>
          </div>
          <p>
            {cms?.priceDisclaimer ||
              'The displayed price covers only the selected editing or video-production service and the deliverables stated in your booking. Accommodation, food, travel, local transport, venue charges, permits, courier expenses, and any other on-location or third-party expenses are not included unless specifically confirmed in writing. These arrangements and costs must be managed by the client.'}
          </p>
        </div>

        {/* Instant Action Channels */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ivory-400">
            Connect directly with Kurudi Bharath Kumar:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/91${phone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-accent-emerald/15 hover:bg-accent-emerald/25 border border-accent-emerald/40 text-accent-emerald transition-all text-center group"
            >
              <MessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">WhatsApp</span>
              <span className="text-[10px] opacity-80">Instant Chat</span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${phone}`}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold transition-all text-center group"
            >
              <Phone className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Call Us</span>
              <span className="text-[10px] opacity-80">+91 {phone}</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}?subject=Pricing%20Clarification%20-%20${encodeURIComponent(service)}`}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/40 text-accent-cyan transition-all text-center group"
            >
              <Mail className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Email Us</span>
              <span className="text-[10px] opacity-80">Official Mail</span>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setIsPricingClarificationOpen(false)}
            className="text-xs text-ivory-400 hover:text-white underline transition-colors"
          >
            I understand, back to booking form
          </button>
        </div>
      </div>
    </div>
  );
};
