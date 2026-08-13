import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle2, ArrowRight, MessageSquare, Send, Film, Clock, LogOut, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ServiceTimeline } from '../components/tracking/ServiceTimeline';
import { PrivateMediaLocker } from '../components/tracking/PrivateMediaLocker';
import { TestimonialModal } from '../components/tracking/TestimonialModal';
import { BookingRequest, ServiceProject, PrivateDeliveryFile } from '../types';

export const TrackService: React.FC = () => {
  const {
    isClientAuthenticated,
    clientTrackingRef,
    clientName,
    requestClientOTP,
    verifyClientOTP,
    clientLogout
  } = useAuth();

  // Login Form States
  const [bookingRefInput, setBookingRefInput] = useState('KBK-2026-8941');
  const [identifierInput, setIdentifierInput] = useState('9440187654');
  const [otpCodeInput, setOtpCodeInput] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [demoHint, setDemoHint] = useState('');

  // Client Data States
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [project, setProject] = useState<ServiceProject | null>(null);
  const [deliveries, setDeliveries] = useState<PrivateDeliveryFile[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // Message Sending
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Testimonial Modal
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Forgot Reference Search States
  const [showForgotReference, setShowForgotReference] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('123456');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotDemoHint, setForgotDemoHint] = useState('');
  const [recoveredBookings, setRecoveredBookings] = useState<Array<{ bookingRef: string; serviceTitle: string; clientName: string; createdAt: string; status: string }>>([]);

  const handleRequestForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered Phone or Email');
      return;
    }
    try {
      setForgotOtpLoading(true);
      setForgotError('');
      const res = await api.requestForgotReferenceOTP(forgotIdentifier.trim());
      setForgotOtpSent(true);
      setForgotDemoHint(res.demoHint || 'Enter code: 123456');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to request verification code');
    } finally {
      setForgotOtpLoading(false);
    }
  };

  const handleVerifyForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setForgotError('Please enter the verification code');
      return;
    }
    try {
      setForgotOtpLoading(true);
      setForgotError('');
      const res = await api.verifyForgotReferenceOTP(forgotIdentifier.trim(), forgotOtp.trim());
      setRecoveredBookings(res.bookings);
      if (res.bookings.length === 0) {
        setForgotError('No bookings found for this contact details.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Invalid or expired code');
    } finally {
      setForgotOtpLoading(false);
    }
  };

  const fetchClientData = async () => {
    try {
      setDataLoading(true);
      setDataError('');
      const data = await api.getClientProject();
      setBooking(data.booking);
      setProject(data.project);
      setDeliveries(data.deliveries || []);
    } catch (err: any) {
      setDataError(err.message || 'Failed to sync service progress');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isClientAuthenticated) {
      fetchClientData();
    }
  }, [isClientAuthenticated]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRefInput.trim() || !identifierInput.trim()) {
      setAuthError('Please enter both Booking Reference and registered Phone/Email');
      return;
    }

    try {
      setOtpLoading(true);
      setAuthError('');
      const res = await requestClientOTP(bookingRefInput.trim(), identifierInput.trim());
      setOtpSent(true);
      setDemoHint(res.demoHint || 'Enter code: 123456');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) {
      setAuthError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setOtpLoading(true);
      setAuthError('');
      await verifyClientOTP(bookingRefInput.trim(), identifierInput.trim(), otpCodeInput.trim());
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired OTP code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !booking?.bookingRef) return;

    try {
      setIsSendingMessage(true);
      await api.sendClientMessage(booking.bookingRef, newMessageText.trim());
      setNewMessageText('');
      fetchClientData();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Client Service Tracking & Delivery Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
              Track My Service
            </h1>
            <p className="text-xs sm:text-sm text-ivory-300 font-light">
              Isolated progress tracking, live milestone updates, private stream previews, and direct 4K master downloads.
            </p>
          </div>

          {isClientAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={fetchClientData}
                disabled={dataLoading}
                className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-300 hover:text-gold border border-gold/20 transition-all disabled:opacity-50"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-gold' : ''}`} />
              </button>
              <button
                onClick={clientLogout}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-accent-crimson/20 text-ivory-300 hover:text-accent-crimson border border-surface-50 text-xs font-semibold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. PASSWORDLESS LOGIN / OTP FORM (If not logged in) */}
        {!isClientAuthenticated ? (
          <div className="max-w-md mx-auto space-y-6">
            {showForgotReference ? (
              /* Forgot Reference recovery flow */
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold/30 shadow-2xl space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-ivory-100">
                    Recover Booking References
                  </h2>
                  <p className="text-xs text-ivory-400">
                    Enter your registered contact number or email to receive a code and search active studio bookings.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3.5 rounded-xl bg-accent-crimson/15 text-accent-crimson border border-accent-crimson/30 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {recoveredBookings.length > 0 ? (
                  /* Recovered bookings list */
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald">
                      ✨ Matched bookings recovered successfully!
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {recoveredBookings.map((b) => (
                        <div key={b.bookingRef} className="p-3 rounded-xl bg-surface-100 border border-surface-55 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-xs font-bold text-gold">{b.bookingRef}</span>
                              <h4 className="text-xs font-bold text-white mt-0.5">{b.serviceTitle}</h4>
                              <p className="text-[10px] text-ivory-400">Client: {b.clientName} • Status: {b.status}</p>
                            </div>
                            <button
                              onClick={() => {
                                setBookingRefInput(b.bookingRef);
                                setIdentifierInput(forgotIdentifier);
                                setShowForgotReference(false);
                                setForgotOtpSent(false);
                                setRecoveredBookings([]);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-light text-black font-bold text-[10px] uppercase tracking-wider"
                            >
                              Track
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !forgotOtpSent ? (
                  <form onSubmit={handleRequestForgotOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Registered Phone / Email
                      </label>
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. 9346476951 or email"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotOtpLoading}
                      className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {forgotOtpLoading ? (
                        <span>Searching...</span>
                      ) : (
                        <span>Search References</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyForgotOTP} className="space-y-4">
                    <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>OTP Sent Successfully!</span>
                      </div>
                      <p className="text-[11px] opacity-90">{forgotDemoHint}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Enter 6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/40 text-gold text-center text-lg font-mono tracking-widest focus:outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotOtpLoading}
                      className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {forgotOtpLoading ? (
                        <span>Verifying...</span>
                      ) : (
                        <span>Verify & Show References</span>
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotReference(false);
                      setForgotOtpSent(false);
                      setRecoveredBookings([]);
                    }}
                    className="text-xs text-gold hover:underline"
                  >
                    Back to tracking verification
                  </button>
                </div>
              </div>
            ) : (
              /* Standard login card */
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold/20 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-ivory-100">
                    Passwordless Service Verification
                  </h2>
                  <p className="text-xs text-ivory-400">
                    Enter your Booking Reference and registered contact number to receive your secure 1-time access OTP.
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-accent-crimson/15 text-accent-crimson border border-accent-crimson/30 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {!otpSent ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Booking Reference Code
                      </label>
                      <input
                        type="text"
                        value={bookingRefInput}
                        onChange={(e) => setBookingRefInput(e.target.value.toUpperCase())}
                        placeholder="e.g. KBK-2026-8941"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-gold uppercase"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Registered Phone / Email
                      </label>
                      <input
                        type="text"
                        value={identifierInput}
                        onChange={(e) => setIdentifierInput(e.target.value)}
                        placeholder="e.g. 9440187654 or email"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {otpLoading ? (
                        <span>Sending Code...</span>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Send Verification Code (OTP)</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>OTP Sent Successfully!</span>
                      </div>
                      <p className="text-[11px] opacity-90">{demoHint}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ivory-300">
                        Enter 6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCodeInput}
                        onChange={(e) => setOtpCodeInput(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/40 text-gold text-center text-lg font-mono tracking-widest focus:outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {otpLoading ? (
                        <span>Verifying Code...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify & Enter Private Portal</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-full text-center text-xs text-ivory-400 hover:text-white underline pt-1"
                    >
                      Change Reference or Phone Number
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotReference(true);
                      setForgotIdentifier(identifierInput);
                    }}
                    className="text-xs text-gold hover:underline font-semibold"
                  >
                    Forgot Booking Reference Code?
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2. AUTHENTICATED CLIENT DASHBOARD */
          <div className="space-y-10 animate-fadeIn">
            {dataError && (
              <div className="p-4 rounded-2xl bg-accent-crimson/15 text-accent-crimson border border-accent-crimson/30 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dataError}</span>
              </div>
            )}

            {/* Overview Summary Card */}
            {booking && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel gold-border-glow grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    booking.status === 'rejected'
                      ? 'bg-accent-crimson/15 text-accent-crimson border-accent-crimson/30'
                      : booking.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-gold/15 text-gold border-gold/30'
                  }`}>
                    <Film className="w-3.5 h-3.5" />
                    <span>{booking.serviceTitle}</span>
                    <span className="text-[10px] opacity-75">• {booking.status.toUpperCase()}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory-100">
                    {booking.clientName}
                  </h2>
                  <p className="text-xs text-ivory-300 font-mono">
                    Ref ID: <span className="text-gold font-bold">{booking.bookingRef}</span> • Event: {booking.eventDate}
                  </p>
                </div>

                <div className="space-y-1 border-l-0 md:border-l border-surface-50 md:pl-6">
                  <span className="text-[11px] uppercase tracking-wider text-ivory-400">
                    Quoted Service Fee:
                  </span>
                  <div className="font-serif text-xl font-bold text-gold">
                    ₹{(booking.finalAmount || booking.quotedAmount).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-ivory-400">
                    Snapshot locked at booking
                  </p>
                </div>

                <div className="space-y-1 border-l-0 md:border-l border-surface-50 md:pl-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-ivory-400">
                      Estimated Delivery:
                    </span>
                    <div className={`font-serif text-lg font-bold ${booking.status === 'rejected' ? 'text-accent-crimson' : 'text-white'}`}>
                      {booking.status === 'rejected' ? 'Declined' : (project?.estimatedDeliveryDate || booking.preferredDeliveryDate || 'In Schedule')}
                    </div>
                  </div>

                  {project?.currentStage === 'files_delivered' && (
                    <button
                      onClick={() => setIsTestimonialModalOpen(true)}
                      className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold text-black text-xs font-bold hover:bg-gold-light transition-all shadow-gold-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span>Submit Review</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* If Booking is Rejected */}
            {booking && booking.status === 'rejected' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-accent-crimson/10 border border-accent-crimson/35 shadow-2xl space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent-crimson/20 text-accent-crimson border border-accent-crimson/40">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                      Booking Request Declined
                    </h3>
                    <p className="text-xs text-ivory-400">
                      This service request has been rejected by Kurudi Bharath Kumar.
                    </p>
                  </div>
                </div>
                {booking.rejectionReason && (
                  <div className="p-4 rounded-xl bg-surface-200 border border-surface-55">
                    <span className="text-[10px] text-ivory-400 font-semibold block mb-1">DECLINATION REASON:</span>
                    <p className="text-xs font-mono text-accent-crimson leading-relaxed">{booking.rejectionReason}</p>
                  </div>
                )}
                <p className="text-xs text-ivory-300">
                  If you have any questions or would like to discuss adjustments to your project footage or timeline, please contact the studio directly via WhatsApp.
                </p>
              </div>
            )}

            {/* If Booking is Pending */}
            {booking && booking.status === 'pending' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/35 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                      Booking Pending Review
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Our studio is currently verifying your event request and editing requirements.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-ivory-300">
                  Once Kurudi Bharath Kumar approves this booking, your visual timeline tracker and private delivery locker will immediately unlock on this portal.
                </p>
              </div>
            )}

            {/* 3. Interactive 9-Stage Visual Lifecycle Progress (Only if Accepted) */}
            {booking && booking.status === 'accepted' && project && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold/30 shadow-xl space-y-6">
                <ServiceTimeline
                  currentStage={project.currentStage}
                  progressPercent={project.stageProgressPercent}
                  statusHistory={project.statusHistory}
                />
              </div>
            )}

            {/* 4. Private Media Deliverables Locker (Only if Accepted) */}
            {booking && booking.status === 'accepted' && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold/30 shadow-xl space-y-6">
                <PrivateMediaLocker
                  deliveries={deliveries}
                  clientName={booking.clientName}
                  bookingRef={booking.bookingRef}
                />
              </div>
            )}

            {/* 5. Direct Studio Messages (Only if Accepted) */}
            {booking && booking.status === 'accepted' && project && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold/20 shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-surface-50 pb-4">
                  <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ivory-100">
                      Direct Studio Communication
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Chat directly with Kurudi Bharath Kumar regarding creative revisions or notes.
                    </p>
                  </div>
                </div>

                {/* Message Feed */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {project.clientMessages?.length === 0 ? (
                    <p className="text-xs text-ivory-400 italic text-center py-4">No messages yet.</p>
                  ) : (
                    project.clientMessages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl max-w-lg space-y-1 ${
                          msg.sender === 'client'
                            ? 'ml-auto bg-gold/15 border border-gold/30 text-right'
                            : 'mr-auto bg-surface-100 border border-surface-50 text-left'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-gold">
                          {msg.senderName} {msg.sender === 'client' ? '(You)' : '• Studio Lead'}
                        </div>
                        <p className="text-xs text-ivory-100 leading-relaxed font-light">
                          {msg.text}
                        </p>
                        <span className="text-[10px] text-ivory-400 block pt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSendMessage} className="flex gap-3 pt-2">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type a revision note or question for Bharath Kumar..."
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !newMessageText.trim()}
                    className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Testimonial Submission Modal */}
      {booking && (
        <TestimonialModal
          bookingRef={booking.bookingRef}
          clientName={booking.clientName}
          isOpen={isTestimonialModalOpen}
          onClose={() => setIsTestimonialModalOpen(false)}
          onSubmitted={fetchClientData}
        />
      )}
    </div>
  );
};
