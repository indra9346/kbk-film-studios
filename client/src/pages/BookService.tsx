import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Calendar, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, HelpCircle, FileText, Send, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudio } from '../context/StudioContext';
import { api } from '../api/client';
import { ServiceItem } from '../types';

export const BookService: React.FC = () => {
  const {
    services,
    preSelectedServiceId,
    setPreSelectedServiceId,
    setIsTermsModalOpen,
    setIsPricingClarificationOpen,
    setClarificationServiceTitle,
    cms
  } = useStudio();

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [footageDetails, setFootageDetails] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (services.length > 0) {
      if (preSelectedServiceId) {
        const found = services.find((s) => s.id === preSelectedServiceId);
        if (found) setSelectedService(found);
      } else if (!selectedService) {
        setSelectedService(services[0]);
      }
    }
  }, [services, preSelectedServiceId]);

  const handleServiceChange = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    if (s) setSelectedService(s);
  };

  const handleClarify = () => {
    if (selectedService) {
      setClarificationServiceTitle(selectedService.title);
      setIsPricingClarificationOpen(true);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        setErrorMessage('Please fill in your name, phone, and email');
        return;
      }
    }
    if (currentStep === 2) {
      if (!selectedService || !eventDate) {
        setErrorMessage('Please select a service and event date');
        return;
      }
    }
    setErrorMessage('');
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrorMessage('You must agree to the 10-clause Terms & Conditions to submit a booking.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await api.submitBooking({
        fullName,
        phone,
        email,
        city,
        serviceId: selectedService?.id,
        eventDate,
        preferredDeliveryDate,
        budgetRange: budgetRange || selectedService?.priceLabel,
        footageDetails,
        referenceLinks,
        customNotes,
        agreedTerms
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      setBookingSuccess(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Direct Studio Post-Production Booking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory-100">
            Book Your Video Editing Project
          </h1>
          <p className="text-xs sm:text-sm text-ivory-300 max-w-xl mx-auto font-light">
            Fill in your event details for instant price snapshot, customized quote, and milestone tracking.
          </p>
        </div>

        {/* Step Progress Indicators */}
        {!bookingSuccess && (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 p-2 bg-surface-200 rounded-2xl border border-surface-50">
            {[
              { num: 1, label: 'Client Info' },
              { num: 2, label: 'Service & Pricing' },
              { num: 3, label: 'Footage Details' },
              { num: 4, label: 'Review & Terms' },
            ].map((step) => (
              <div
                key={step.num}
                className={`py-2 px-3 rounded-xl text-center transition-all ${
                  currentStep === step.num
                    ? 'bg-gold text-black font-bold shadow-gold-sm'
                    : currentStep > step.num
                    ? 'bg-surface-100 text-gold font-semibold'
                    : 'text-ivory-400 font-medium'
                }`}
              >
                <div className="text-xs sm:text-sm">Step {step.num}</div>
                <div className="text-[10px] sm:text-xs hidden sm:block truncate">{step.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Success Confirmation View */}
        {bookingSuccess ? (
          <div className="p-8 sm:p-12 rounded-3xl glass-panel gold-border-glow text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gold uppercase tracking-widest">
                Booking Reference Assigned
              </span>
              <h2 className="font-serif text-3xl font-bold text-ivory-100">
                {bookingSuccess.bookingRef}
              </h2>
              <p className="text-xs sm:text-sm text-ivory-300 max-w-lg mx-auto">
                Thank you, <span className="text-white font-semibold">{fullName}</span>! Your project request for <span className="text-gold">{selectedService?.title}</span> has been registered into KBK Films.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-gold/15 border border-gold/45 text-xs text-gold text-center font-semibold space-y-1">
              <span className="block text-sm uppercase tracking-wide">⚠️ Save Reference Code!</span>
              <p className="font-light opacity-90 text-[11px]">
                Please copy or write down booking reference <span className="text-white font-mono font-bold bg-black/45 px-1.5 py-0.5 rounded">{bookingSuccess.bookingRef}</span>. You will need it and your contact details to log into your tracking dashboard. If you forget it, you can retrieve it using the "Forgot Booking Reference" option on the tracking portal.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-surface-100 border border-gold/20 text-left space-y-2 text-xs text-ivory-300">
              <div className="flex justify-between border-b border-surface-50 pb-2">
                <span>Client Name:</span>
                <span className="text-white font-semibold">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-surface-50 pb-2">
                <span>Contact Phone:</span>
                <span className="text-white font-semibold">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-surface-50 pb-2">
                <span>Price Snapshot:</span>
                <span className="text-gold font-bold">{selectedService?.priceLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Turnaround:</span>
                <span className="text-white font-semibold">{selectedService?.turnaroundDays} Days</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/track"
                className="px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Track Your Service Now</span>
              </Link>
              <Link
                to="/"
                className="px-6 py-3.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-200 border border-surface-50 text-xs font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-Step Form Container */
          <div className="p-6 sm:p-10 rounded-3xl glass-panel border border-gold/30 shadow-2xl">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-accent-crimson/15 text-accent-crimson border border-accent-crimson/30 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Client Personal & Contact Info */}
            {currentStep === 1 && (
              <form onSubmit={handleNext} className="space-y-6 animate-fadeIn">
                <div className="border-b border-gold/15 pb-4">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Step 1: Client Contact Information
                  </h3>
                  <p className="text-xs text-ivory-400">
                    Provide your primary phone number & email for passwordless OTP service tracking.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      Full Name / Couple Names <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Suresh & Meghana"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      WhatsApp / Phone Number <span className="text-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9440187654"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      Email Address <span className="text-gold">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. suresh.meghana@gmail.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      City & State
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hindupur, Andhra Pradesh"
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-2"
                  >
                    <span>Continue to Service Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Service Selection & Dynamic Price Snapshot */}
            {currentStep === 2 && (
              <form onSubmit={handleNext} className="space-y-6 animate-fadeIn">
                <div className="border-b border-gold/15 pb-4">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Step 2: Choose Service & Event Date
                  </h3>
                  <p className="text-xs text-ivory-400">
                    Select your editing package to view inclusions, exclusions, and cost.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      Select Editing Service <span className="text-gold">*</span>
                    </label>
                    <select
                      value={selectedService?.id}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold font-medium"
                    >
                      {services.filter(s => s.isActive).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.priceLabel})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Service Detail Snapshot Card */}
                  {selectedService && (
                    <div className="p-5 rounded-2xl bg-surface-100/90 border border-gold/30 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-50 pb-3">
                        <div>
                          <h4 className="font-serif text-base font-bold text-gold">
                            {selectedService.title}
                          </h4>
                          <p className="text-xs text-ivory-300 font-light">
                            {selectedService.shortDescription}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-ivory-400 uppercase tracking-wider block">Service Fee:</span>
                          <span className="font-serif text-lg font-bold text-gold">
                            {selectedService.priceLabel}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-accent-emerald font-semibold block">Included:</span>
                          <ul className="space-y-1 text-ivory-300">
                            {selectedService.inclusions?.map((inc, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-accent-emerald shrink-0 mt-0.5" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <span className="text-accent-crimson font-semibold block">Excluded:</span>
                          <ul className="space-y-1 text-ivory-400">
                            {selectedService.exclusions?.map((exc, idx) => (
                              <li key={idx}>• {exc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-surface-50 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleClarify}
                          className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Need price clarification for this service?</span>
                        </button>

                        <span className="text-[11px] text-ivory-400">
                          Est. Turnaround: {selectedService.turnaroundDays} Days
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Event Date <span className="text-gold">*</span>
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Preferred Delivery Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={preferredDeliveryDate}
                        onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-2"
                  >
                    <span>Next: Footage Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Raw Footage & Reference Creative Notes */}
            {currentStep === 3 && (
              <form onSubmit={handleNext} className="space-y-6 animate-fadeIn">
                <div className="border-b border-gold/15 pb-4">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Step 3: Footage Volume & Creative Style
                  </h3>
                  <p className="text-xs text-ivory-400">
                    Tell us about your camera files, audio tracks, and music preference.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      Camera Setup & Raw Footage Volume
                    </label>
                    <textarea
                      rows={3}
                      value={footageDetails}
                      onChange={(e) => setFootageDetails(e.target.value)}
                      placeholder="e.g. Sony A7IV + FX3 multi-camera (approx 250GB 4K S-Log3 files on hard drive or Google Drive)"
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold placeholder:text-ivory-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      Reference Video / Song Links
                    </label>
                    <input
                      type="url"
                      value={referenceLinks}
                      onChange={(e) => setReferenceLinks(e.target.value)}
                      placeholder="e.g. YouTube or Instagram reference reel link"
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold placeholder:text-ivory-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">
                      Custom Instructions or Key Moments
                    </label>
                    <textarea
                      rows={3}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Focus on emotional parents speech, traditional mantra sync, and fast-paced Instagram teaser."
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold placeholder:text-ivory-400"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-2"
                  >
                    <span>Next: Review & Terms</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Review, Scope Disclaimer & Mandatory Terms Agreement */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmitBooking} className="space-y-6 animate-fadeIn">
                <div className="border-b border-gold/15 pb-4">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Step 4: Review Order & Accept Terms
                  </h3>
                  <p className="text-xs text-ivory-400">
                    Review your booking snapshot and agree to the studio terms to finalize submission.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="p-5 rounded-2xl bg-surface-100/90 border border-gold/30 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-surface-50 pb-2">
                    <span className="text-ivory-400">Client:</span>
                    <span className="text-white font-bold">{fullName} ({phone})</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-50 pb-2">
                    <span className="text-ivory-400">Selected Service:</span>
                    <span className="text-gold font-bold">{selectedService?.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-50 pb-2">
                    <span className="text-ivory-400">Event Date:</span>
                    <span className="text-white font-semibold">{eventDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-50 pb-2">
                    <span className="text-ivory-400">Price Snapshot (Service Fee Only):</span>
                    <span className="font-serif text-base font-bold text-gold">{selectedService?.priceLabel}</span>
                  </div>
                </div>

                {/* Price Disclaimer Alert Box */}
                <div className="p-4 rounded-xl bg-surface-200 border border-gold/20 text-xs text-ivory-300 space-y-1 leading-relaxed">
                  <span className="font-semibold text-gold block">Pricing Scope Reminder:</span>
                  <p>
                    {cms?.priceDisclaimer ||
                      'The displayed price covers only the selected editing or video-production service and the deliverables stated in your booking. Accommodation, food, travel, local transport, venue charges, permits, courier expenses, and any other on-location or third-party expenses are not included unless specifically confirmed in writing. These arrangements and costs must be managed by the client.'}
                  </p>
                </div>

                {/* Mandatory Terms & Conditions Checkbox */}
                <div className="p-4 rounded-2xl bg-surface-100/60 border border-gold/30 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gold text-gold focus:ring-gold bg-surface-200"
                      required
                    />
                    <div className="text-xs text-ivory-200">
                      <span>I have reviewed and agree to the </span>
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="text-gold font-bold underline hover:text-gold-light"
                      >
                        KBK Films 10-Clause Terms & Conditions
                      </button>
                      <span> including excluded expenses, revision limits, and data isolation policies.</span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-300 text-xs font-semibold"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !agreedTerms}
                    className="px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Booking...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm & Submit Booking Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
