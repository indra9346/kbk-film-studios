import React, { useState, useEffect } from 'react';
import {
  Film,
  Users,
  Settings,
  DollarSign,
  Layers,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Calendar,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Search,
  MessageSquare,
  KeyRound,
  Lock,
  AlertCircle,
  Send,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudio } from '../context/StudioContext';
import { api } from '../api/client';
import {
  BookingRequest,
  ServiceProject,
  ServiceItem,
  PrivateDeliveryFile,
  PublicWork,
  Testimonial,
  Owner,
  AuditLog,
  ServiceProjectStage
} from '../types';

export const OwnerSpace: React.FC = () => {
  const {
    isOwnerAuthenticated,
    ownerData,
    requestOwnerOTP,
    verifyOwnerOTP,
    ownerLogout
  } = useAuth();

  const { refreshData } = useStudio();

  // Login Form States
  const [identifierInput, setIdentifierInput] = useState('9346227894');
  const [otpCodeInput, setOtpCodeInput] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [demoHint, setDemoHint] = useState('');

  // Active Tab in Owner Space
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'pricing' | 'lifecycle' | 'deliveries' | 'works' | 'testimonials' | 'cms' | 'owners' | 'audit'
  >('overview');

  // Loaded Dashboard Data States
  const [metrics, setMetrics] = useState<any | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [projects, setProjects] = useState<ServiceProject[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cmsData, setCmsData] = useState<any | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals / Action States
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<BookingRequest | null>(null);
  const [actionQuoteAmount, setActionQuoteAmount] = useState<number>(0);
  const [actionScheduleDate, setActionScheduleDate] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  // Price revision modal
  const [priceRevisionBooking, setPriceRevisionBooking] = useState<BookingRequest | null>(null);
  const [newPriceAmount, setNewPriceAmount] = useState<number>(0);
  const [priceRevisionReason, setPriceRevisionReason] = useState('');

  // Service Edit / Create Modal
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // Work Edit / Create Modal
  const [editingWork, setEditingWork] = useState<Partial<PublicWork> | null>(null);

  // Upload Delivery Modal
  const [deliveryProject, setDeliveryProject] = useState<ServiceProject | null>(null);
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryFileName, setDeliveryFileName] = useState('');
  const [deliveryCategory, setDeliveryCategory] = useState<any>('master_video');
  const [selectedDeliveryFile, setSelectedDeliveryFile] = useState<File | null>(null);
  const [isUploadingDeliveryFile, setIsUploadingDeliveryFile] = useState(false);

  // Co-Owner Invite Modal
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');

  const loadOwnerData = async () => {
    try {
      setDataLoading(true);
      const [m, b, p, s, w, t, o, a, c] = await Promise.all([
        api.getOwnerMetrics(),
        api.getOwnerBookings(),
        api.getOwnerProjects(),
        api.getServices(),
        api.getWorks(),
        api.getTestimonials(),
        api.getOwners(),
        api.getAuditLogs(),
        api.getCMS()
      ]);
      setMetrics(m);
      setBookings(b);
      setProjects(p);
      setServices(s);
      setWorks(w);
      setTestimonials(t);
      setOwnersList(o);
      setAuditLogs(a);
      setCmsData(c);
    } catch (err: any) {
      console.error('Failed to load owner data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnerAuthenticated) {
      loadOwnerData();
    }
  }, [isOwnerAuthenticated]);

  // Auth Handlers
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) return;

    try {
      setAuthLoading(true);
      setAuthError('');
      const res = await requestOwnerOTP(identifierInput.trim());
      setOtpSent(true);
      setDemoHint(res.demoHint || 'Code: 123456');
    } catch (err: any) {
      setAuthError(err.message || 'Access Denied: Unregistered owner');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) return;

    try {
      setAuthLoading(true);
      setAuthError('');
      await verifyOwnerOTP(identifierInput.trim(), otpCodeInput.trim());
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code');
    } finally {
      setAuthLoading(false);
    }
  };

  // Booking Actions (Accept / Reject)
  const handleAcceptBooking = async (booking: BookingRequest) => {
    try {
      await api.updateBookingStatus(booking.id, {
        status: 'accepted',
        quotedAmount: actionQuoteAmount || booking.quotedAmount,
        scheduledDate: actionScheduleDate || booking.preferredDeliveryDate,
        notes: actionNotes || 'Accepted by Kurudi Bharath Kumar. Ready for footage ingestion.'
      });
      setSelectedBookingForAction(null);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async (booking: BookingRequest) => {
    const reason = prompt('Enter reason for declining this request:', 'Studio slots fully booked for this date');
    if (!reason) return;
    try {
      await api.updateBookingStatus(booking.id, {
        status: 'rejected',
        rejectionReason: reason
      });
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking');
    }
  };

  // Price Revision Handler
  const handleRevisePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceRevisionBooking || !newPriceAmount) return;
    try {
      await api.reviseBookingPrice(priceRevisionBooking.id, newPriceAmount, priceRevisionReason);
      setPriceRevisionBooking(null);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update quote');
    }
  };

  // Lifecycle Stage Update
  const handleAdvanceStage = async (projectId: string, nextStage: ServiceProjectStage, label: string) => {
    try {
      await api.updateProjectStage(projectId, {
        stage: nextStage,
        stageLabel: label,
        message: `Advanced to ${label} by ${ownerData?.name || 'Studio'}`
      });
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'Failed to update lifecycle stage');
    }
  };

  // Deliveries Handler
  const handleUploadDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryProject || !deliveryTitle.trim()) return;

    try {
      setIsUploadingDeliveryFile(true);

      let sizeBytes = 4886163;
      let finalFileName = deliveryFileName.trim() || `${deliveryProject.bookingRef}_Master_4K.mp4`;

      if (selectedDeliveryFile) {
        // Upload the file first to the backend
        const uploadResult = await api.uploadProjectFile(deliveryProject.id, selectedDeliveryFile);
        if (uploadResult.success) {
          sizeBytes = uploadResult.fileSizeBytes;
          finalFileName = uploadResult.fileName;
        }
      }

      await api.uploadClientDelivery(deliveryProject.id, {
        title: deliveryTitle.trim(),
        fileName: finalFileName,
        fileCategory: deliveryCategory,
        fileSizeBytes: sizeBytes,
        expiryDays: 90,
        maxDownloads: 50
      });

      setDeliveryProject(null);
      setDeliveryTitle('');
      setDeliveryFileName('');
      setSelectedDeliveryFile(null);
      loadOwnerData();
      alert('Deliverable uploaded and secure tracking link generated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload delivery');
    } finally {
      setIsUploadingDeliveryFile(false);
    }
  };

  // Service Save
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title || !editingService.basePrice) return;
    try {
      await api.saveService(editingService);
      setEditingService(null);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    }
  };

  // Work Save
  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork || !editingWork.title) return;
    try {
      await api.saveWork(editingWork);
      setEditingWork(null);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save work');
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!confirm('Are you sure you want to delete this showcase film?')) return;
    try {
      await api.deleteWork(id);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete work');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.deleteTestimonial(id);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete testimonial');
    }
  };

  // CMS Save
  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateCMS(cmsData);
      alert('Studio profile, credentials, and live counters updated successfully!');
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update CMS');
    }
  };

  // Co-Owner Invite
  const handleInviteOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim() || !newOwnerPhone.trim() || !newOwnerEmail.trim()) return;
    try {
      await api.inviteOwner({
        name: newOwnerName.trim(),
        phone: newOwnerPhone.trim(),
        email: newOwnerEmail.trim(),
        role: 'co_owner'
      });
      setNewOwnerName('');
      setNewOwnerPhone('');
      setNewOwnerEmail('');
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'Failed to add owner');
    }
  };

  const handleRemoveOwner = async (id: string) => {
    if (!confirm('Remove co-owner access?')) return;
    try {
      await api.removeOwner(id);
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove owner');
    }
  };

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] uppercase font-bold tracking-wider">
                Authorized Studio Management
              </span>
              {ownerData && (
                <span className="text-xs text-accent-emerald font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {ownerData.name} ({ownerData.role.replace('_', ' ')})
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100 mt-1">
              Owner Space Dashboard
            </h1>
          </div>

          {isOwnerAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={loadOwnerData}
                className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-300 hover:text-gold border border-gold/20 transition-all"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={ownerLogout}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-accent-crimson/20 text-ivory-300 hover:text-accent-crimson border border-surface-50 text-xs font-semibold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. PASSWORDLESS OWNER LOGIN FORM */}
        {!isOwnerAuthenticated ? (
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl glass-panel gold-border-glow shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-ivory-100">
                Owner Access Verification
              </h2>
              <p className="text-xs text-ivory-400">
                Enter your authorized owner phone number or email to access the master studio console.
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
                    Owner Registered Phone / Email
                  </label>
                  <input
                    type="text"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    placeholder="9346227894"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-100 border border-surface-50 text-[11px] text-ivory-400 space-y-1">
                  <div>👑 <span className="text-gold font-semibold">Primary Owners:</span></div>
                  <div>• K S Indra Kumar (<span className="text-white font-mono">9346476951</span> / <span className="text-white font-mono">ik9893344@gmail.com</span>)</div>
                  <div>• Kurudi Bharath Kumar (<span className="text-white font-mono">9346227894</span> / <span className="text-white font-mono">kbkfilms.official@gmail.com</span>)</div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <span>Sending Code...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Owner Access Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
                <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Access Code Dispatched</span>
                  </div>
                  <p className="text-[11px] opacity-90">{demoHint}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ivory-300">
                    Enter 6-Digit Owner Code
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
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Enter Owner Space</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* 2. AUTHENTICATED OWNER MASTER CONSOLE */
          <div className="space-y-8 animate-fadeIn">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface-50">
              {[
                { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
                { id: 'bookings', label: `Bookings (${bookings.filter(b => b.status === 'pending').length} New)`, icon: FileText },
                { id: 'pricing', label: 'Service Pricing CMS', icon: DollarSign },
                { id: 'lifecycle', label: 'Active Lifecycle (9 Stages)', icon: Layers },
                { id: 'deliveries', label: 'Client Delivery Locker', icon: Upload },
                { id: 'works', label: 'Works Showcase', icon: Film },
                { id: 'testimonials', label: 'Testimonials', icon: Sparkles },
                { id: 'cms', label: 'Studio Profile & Bio', icon: Settings },
                { id: 'owners', label: 'Owner Team', icon: Users },
                { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wide transition-all ${
                      activeTab === tab.id
                        ? 'bg-gold text-black shadow-gold-sm'
                        : 'bg-surface-100 text-ivory-300 hover:bg-surface-50 border border-surface-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW & KPIS */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metric Counter Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl glass-panel border border-gold/30">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">New Requests</span>
                    <div className="font-serif text-3xl font-extrabold text-gold mt-1">
                      {bookings.filter(b => b.status === 'pending').length}
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">Awaiting studio quote</p>
                  </div>

                  <div className="p-5 rounded-2xl glass-panel border border-surface-50">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Active Projects</span>
                    <div className="font-serif text-3xl font-extrabold text-white mt-1">
                      {projects.filter(p => p.currentStage !== 'testimonial_received').length}
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">In editing / grading pipeline</p>
                  </div>

                  <div className="p-5 rounded-2xl glass-panel border border-surface-50">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Delivered Lockers</span>
                    <div className="font-serif text-3xl font-extrabold text-accent-emerald mt-1">
                      {projects.reduce((acc, p) => acc + (p.deliveries?.length || 0), 0)}
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">Master 4K packages active</p>
                  </div>

                  <div className="p-5 rounded-2xl glass-panel border border-gold/30">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Happy Clients</span>
                    <div className="font-serif text-3xl font-extrabold text-gold mt-1">
                      {cmsData?.happyClientsCount || 800}+
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">Public counter stat</p>
                  </div>
                </div>

                {/* Recent Bookings Quick Table */}
                <div className="p-6 rounded-3xl glass-panel border border-gold/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-ivory-100">
                      Recent Booking Requests
                    </h3>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs text-gold hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] uppercase tracking-wider text-ivory-400 border-b border-surface-50">
                        <tr>
                          <th className="pb-3">Ref ID</th>
                          <th className="pb-3">Client</th>
                          <th className="pb-3">Service</th>
                          <th className="pb-3">Event Date</th>
                          <th className="pb-3">Quote Snapshot</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-50 text-ivory-200">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-surface-100/50">
                            <td className="py-3 font-mono font-bold text-gold">{b.bookingRef}</td>
                            <td className="py-3 font-medium text-white">{b.clientName} ({b.clientPhone})</td>
                            <td className="py-3">{b.serviceTitle}</td>
                            <td className="py-3">{b.eventDate}</td>
                            <td className="py-3 font-bold text-gold">₹{(b.finalAmount || b.quotedAmount).toLocaleString('en-IN')}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                b.status === 'accepted' ? 'bg-accent-emerald/20 text-accent-emerald' : b.status === 'rejected' ? 'bg-accent-crimson/20 text-accent-crimson' : 'bg-gold/20 text-gold'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Client Booking Inquiries & Quotation Management
                  </h3>
                  <span className="text-xs text-ivory-400">
                    Total: {bookings.length} Bookings
                  </span>
                </div>

                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-6 rounded-2xl glass-panel border border-gold/20 space-y-4 hover:border-gold/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-50 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-gold">{booking.bookingRef}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              booking.status === 'accepted' ? 'bg-accent-emerald/20 text-accent-emerald' : booking.status === 'rejected' ? 'bg-accent-crimson/20 text-accent-crimson' : 'bg-gold/20 text-gold'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-white mt-1">
                            {booking.clientName} • <span className="text-ivory-300 font-normal">{booking.clientCity}</span>
                          </h4>
                          <p className="text-xs text-ivory-400">
                            Phone: <a href={`tel:${booking.clientPhone}`} className="text-gold underline">{booking.clientPhone}</a> • Email: {booking.clientEmail}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Service Quote:</span>
                          <span className="font-serif text-xl font-bold text-gold">
                            ₹{(booking.finalAmount || booking.quotedAmount).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => {
                              setPriceRevisionBooking(booking);
                              setNewPriceAmount(booking.finalAmount || booking.quotedAmount);
                            }}
                            className="text-[11px] text-gold/80 hover:text-gold underline block mt-0.5"
                          >
                            Revise Quote
                          </button>
                        </div>
                      </div>

                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ivory-300 bg-surface-100/50 p-4 rounded-xl">
                        <div>
                          <span className="font-semibold text-white block">Service:</span>
                          <span>{booking.serviceTitle}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-white block">Event Date:</span>
                          <span>{booking.eventDate}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-white block">Footage Details:</span>
                          <span>{booking.footageDetails || 'Not specified'}</span>
                        </div>
                      </div>

                      {booking.customNotes && (
                        <p className="text-xs text-ivory-300 italic">
                          Notes: "{booking.customNotes}"
                        </p>
                      )}

                      {/* Action Buttons */}
                      {booking.status === 'pending' && (
                        <div className="pt-2 flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setSelectedBookingForAction(booking);
                              setActionQuoteAmount(booking.quotedAmount);
                              setActionScheduleDate(booking.preferredDeliveryDate || '');
                            }}
                            className="px-5 py-2 rounded-xl bg-accent-emerald text-black font-bold text-xs uppercase tracking-wider hover:bg-accent-emerald/90 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept & Schedule</span>
                          </button>

                          <button
                            onClick={() => handleRejectBooking(booking)}
                            className="px-5 py-2 rounded-xl bg-accent-crimson/20 hover:bg-accent-crimson/30 text-accent-crimson border border-accent-crimson/40 font-semibold text-xs transition-all"
                          >
                            Decline Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MANAGE SERVICE PRICING CMS */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Service Catalogue & Base Pricing Management
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Edit service prices, inclusions, exclusions, and activate upcoming studio offerings.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingService({ title: '', basePrice: 14999, priceType: 'starting_from', inclusions: [], exclusions: [], turnaroundDays: 5, isActive: true })}
                    className="px-4 py-2 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Service</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-6 rounded-2xl glass-panel border border-gold/20 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-lg font-bold text-gold">
                            {service.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${service.isActive ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-surface-100 text-ivory-400'}`}>
                            {service.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>

                        <p className="text-xs text-ivory-300 line-clamp-2">
                          {service.shortDescription}
                        </p>

                        <div className="p-3 rounded-xl bg-surface-100 border border-surface-50 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-ivory-400 uppercase">Base Rate:</span>
                            <div className="font-serif text-base font-bold text-white">
                              {service.priceLabel}
                            </div>
                          </div>
                          <span className="text-[11px] text-ivory-400">
                            Turnaround: {service.turnaroundDays} Days
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
                        <button
                          onClick={() => setEditingService(service)}
                          className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Service Details & Price</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ACTIVE LIFECYCLE (9 STAGES) */}
            {activeTab === 'lifecycle' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Active Client Project Lifecycle Tracker (9 Stages)
                  </h3>
                  <span className="text-xs text-ivory-400">
                    {projects.length} Active Projects
                  </span>
                </div>

                <div className="space-y-6">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-6 rounded-3xl glass-panel border border-gold/30 space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-50 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-gold">{proj.bookingRef}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase">
                              Stage: {proj.currentStage.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className="font-serif text-xl font-bold text-white mt-1">
                            {proj.clientName} • {proj.serviceTitle}
                          </h4>
                          <p className="text-xs text-ivory-400">
                            Target Delivery: {proj.estimatedDeliveryDate} • Tracking Token: <span className="font-mono text-gold">{proj.trackingToken}</span>
                          </p>
                        </div>

                        {/* Quick Action to upload delivery */}
                        <button
                          onClick={() => {
                            setDeliveryProject(proj);
                            setDeliveryTitle(`${proj.clientName} 4K Master Video Highlight`);
                            setDeliveryFileName(`${proj.bookingRef}_Master_4K.mp4`);
                          }}
                          className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm flex items-center gap-1.5"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Deliver File to Locker</span>
                        </button>
                      </div>

                      {/* Advance Stage Controls */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-ivory-300">
                          Advance Project Stage:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {[
                            { key: 'accepted_scheduled', label: '2. Accepted & Scheduled' },
                            { key: 'raw_footage_received', label: '3. Raw Footage Ingested' },
                            { key: 'in_progress', label: '4. Rough Cut In Progress' },
                            { key: 'color_grading_audio', label: '5. Color Grading & Sound' },
                            { key: 'in_review', label: '6. In Client Review' },
                            { key: 'service_completed', label: '7. Master Exported' },
                            { key: 'files_delivered', label: '8. Delivered to Locker' },
                            { key: 'testimonial_received', label: '9. Completed & Archived' },
                          ].map((st) => (
                            <button
                              key={st.key}
                              onClick={() => handleAdvanceStage(proj.id, st.key as any, st.label)}
                              className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                                proj.currentStage === st.key
                                  ? 'bg-gold text-black border-gold shadow-gold-sm'
                                  : 'bg-surface-100 text-ivory-300 hover:bg-surface-50 border-surface-50'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: DELIVERIES LOCKER */}
            {activeTab === 'deliveries' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Secure Private Client Deliverables
                  </h3>
                  <span className="text-xs text-accent-emerald font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Strict Data Isolation Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.flatMap(p => p.deliveries || []).map((del) => (
                    <div
                      key={del.id}
                      className="p-6 rounded-2xl glass-panel border border-gold/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gold">{del.bookingRef}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-100 text-ivory-300 text-[10px] uppercase font-bold border border-gold/30">
                          {del.fileCategory}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-white">
                        {del.title}
                      </h4>
                      <p className="text-xs text-ivory-400 font-mono">
                        {del.fileName} • {del.fileSizeFormatted}
                      </p>
                      <div className="pt-2 border-t border-surface-50 flex items-center justify-between text-xs text-ivory-400">
                        <span>Downloads: {del.downloadCount} / {del.maxDownloads}</span>
                        <span>Token: {del.downloadToken.substring(0, 16)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: WORKS SHOWCASE CMS */}
            {activeTab === 'works' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Public Works Showcase Portfolio CMS
                  </h3>
                  <button
                    onClick={() => setEditingWork({ title: '', category: 'Wedding Highlights', eventLocation: 'Hindupur, AP', eventYear: '2026', videoUrl: '/assets/hero-reel.mp4', isFeatured: true, isPublished: true, softwareUsed: ['Premiere Pro', 'DaVinci Resolve'] })}
                    className="px-4 py-2 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Showcase Film</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {works.map((work) => (
                    <div
                      key={work.id}
                      className="p-5 rounded-2xl glass-panel border border-gold/20 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded bg-gold/15 text-gold text-[10px] font-bold uppercase">
                          {work.category}
                        </span>
                        <h4 className="font-serif text-base font-bold text-white">
                          {work.title}
                        </h4>
                        <p className="text-xs text-ivory-400 line-clamp-2">
                          {work.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
                        <button
                          onClick={() => setEditingWork(work)}
                          className="text-xs text-gold hover:underline font-semibold"
                        >
                          Edit Film
                        </button>
                        <button
                          onClick={() => handleDeleteWork(work.id)}
                          className="text-xs text-accent-crimson hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: TESTIMONIALS CMS */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Client Testimonials & Public Reviews
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((test) => (
                    <div
                      key={test.id}
                      className="p-6 rounded-2xl glass-panel border border-gold/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-base font-bold text-gold">
                          {test.clientName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${test.isPublished ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-surface-100 text-ivory-400'}`}>
                          {test.isPublished ? 'Published' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs text-ivory-300 italic">
                        "{test.reviewText}"
                      </p>
                      <div className="pt-2 border-t border-surface-50 flex items-center justify-between text-[11px] text-ivory-400">
                        <span>{test.serviceTitle} • {test.location}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={async () => {
                              try {
                                await api.saveTestimonial({ ...test, isPublished: !test.isPublished });
                                loadOwnerData();
                                refreshData();
                              } catch (err: any) {
                                alert(err.message || 'Failed to update testimonial status');
                              }
                            }}
                            className="text-gold hover:underline font-semibold text-[10px]"
                          >
                            {test.isPublished ? 'Hide' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(test.id)}
                            className="text-accent-crimson hover:underline text-[10px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: STUDIO PROFILE CMS (Bio, Education & Counters) */}
            {activeTab === 'cms' && cmsData && (
              <form onSubmit={handleSaveCMS} className="space-y-6 max-w-4xl">
                <div className="border-b border-gold/20 pb-4">
                  <h3 className="font-serif text-xl font-bold text-ivory-100">
                    Studio Information, Credentials & Live Metrics
                  </h3>
                  <p className="text-xs text-ivory-400">
                    Update Bharath Kumar's biography, SKU Degree & MBA education, phone numbers, and live counters.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Studio Name</label>
                    <input
                      type="text"
                      value={cmsData.studioName}
                      onChange={(e) => setCmsData({ ...cmsData, studioName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Founder Name</label>
                    <input
                      type="text"
                      value={cmsData.founderName}
                      onChange={(e) => setCmsData({ ...cmsData, founderName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={cmsData.phone}
                      onChange={(e) => setCmsData({ ...cmsData, phone: e.target.value, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Happy Clients Count</label>
                    <input
                      type="number"
                      value={cmsData.happyClientsCount}
                      onChange={(e) => setCmsData({ ...cmsData, happyClientsCount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ivory-300">Founder Biography</label>
                  <textarea
                    rows={4}
                    value={cmsData.founderBio}
                    onChange={(e) => setCmsData({ ...cmsData, founderBio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ivory-300">Price Disclaimer Note (Shown to Clients)</label>
                  <textarea
                    rows={3}
                    value={cmsData.priceDisclaimer}
                    onChange={(e) => setCmsData({ ...cmsData, priceDisclaimer: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all"
                >
                  Save Studio Profile Changes
                </button>
              </form>
            )}

            {/* TAB 9: OWNER TEAM */}
            {activeTab === 'owners' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Co-Owner & Editor Access Management
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Primary owner (Kurudi Bharath Kumar) can invite trusted editors by phone and email without passwords.
                    </p>
                  </div>
                </div>

                {/* Invite Form */}
                <form onSubmit={handleInviteOwner} className="p-6 rounded-2xl bg-surface-100/90 border border-gold/30 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Co-Owner Name</label>
                    <input
                      type="text"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="e.g. Lead Assistant Editor"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-200 border border-gold/20 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Phone Number</label>
                    <input
                      type="tel"
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value)}
                      placeholder="e.g. 9845012345"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-200 border border-gold/20 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Email Address</label>
                    <input
                      type="email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      placeholder="editor@kbkfilms.com"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-200 border border-gold/20 text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all"
                  >
                    Invite Co-Owner
                  </button>
                </form>

                {/* Owners List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ownersList.map((owner) => (
                    <div key={owner.id} className="p-5 rounded-2xl glass-panel border border-gold/20 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-bold text-white">{owner.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${owner.role === 'primary_owner' ? 'bg-gold text-black' : 'bg-surface-100 text-gold'}`}>
                            {owner.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-ivory-400 font-mono mt-1">
                          {owner.phone} • {owner.email}
                        </p>
                      </div>

                      {owner.role !== 'primary_owner' && (
                        <button
                          onClick={() => handleRemoveOwner(owner.id)}
                          className="p-2 text-accent-crimson hover:bg-accent-crimson/20 rounded-lg transition-all"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 10: AUDIT TRAIL */}
            {activeTab === 'audit' && (
              <div className="p-6 rounded-3xl glass-panel border border-gold/20 space-y-4">
                <h3 className="font-serif text-xl font-bold text-ivory-100">
                  Security & Action Audit Logs
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-surface-100 border border-surface-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gold">{log.action}</span>
                        <p className="text-ivory-300 font-light">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-ivory-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accept & Schedule Modal */}
      {selectedBookingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="font-serif text-xl font-bold text-ivory-100">
              Accept & Schedule Project: {selectedBookingForAction.bookingRef}
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ivory-300">Final Quoted Amount (₹)</label>
                <input
                  type="number"
                  value={actionQuoteAmount}
                  onChange={(e) => setActionQuoteAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm font-bold text-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ivory-300">Scheduled Target Delivery Date</label>
                <input
                  type="date"
                  value={actionScheduleDate}
                  onChange={(e) => setActionScheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ivory-300">Studio Acceptance Note for Client</label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Booking accepted. Please ship raw footage SSD or upload drive links."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBookingForAction(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-100 text-ivory-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcceptBooking(selectedBookingForAction)}
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revise Price Modal */}
      {priceRevisionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleRevisePrice} className="relative w-full max-w-md bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <h3 className="font-serif text-lg font-bold text-ivory-100">
              Revise Quotation for {priceRevisionBooking.bookingRef}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ivory-300">New Price Amount (₹)</label>
              <input
                type="number"
                value={newPriceAmount}
                onChange={(e) => setNewPriceAmount(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/40 text-gold font-bold text-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ivory-300">Reason for Price Revision</label>
              <input
                type="text"
                value={priceRevisionReason}
                onChange={(e) => setPriceRevisionReason(e.target.value)}
                placeholder="e.g. Additional 200GB multicam footage / drone edits"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPriceRevisionBooking(null)}
                className="px-4 py-2 rounded-xl bg-surface-100 text-ivory-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gold text-black font-bold text-xs uppercase"
              >
                Save Revision
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Deliverable Modal */}
      {deliveryProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleUploadDelivery} className="relative w-full max-w-lg bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <h3 className="font-serif text-xl font-bold text-ivory-100">
              Upload Private Deliverable to {deliveryProject.clientName}'s Locker
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5 border-2 border-dashed border-gold/25 hover:border-gold/50 rounded-2xl p-5 text-center bg-surface-100 hover:bg-surface-50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setSelectedDeliveryFile(file);
                      setDeliveryFileName(file.name);
                      // Pre-populate title with prettified filename
                      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                      setDeliveryTitle(baseName.replace(/[_-]/g, ' '));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-8 h-8 text-gold/80 mx-auto mb-2" />
                <span className="text-xs font-bold text-ivory-100 block">
                  {selectedDeliveryFile ? selectedDeliveryFile.name : "Select Edited Video or Deliverable from PC"}
                </span>
                <span className="text-[10px] text-ivory-400 block mt-1">
                  Drag & drop or browse any file type and length. Real streaming will be linked.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ivory-300">Deliverable Title</label>
                <input
                  type="text"
                  value={deliveryTitle}
                  onChange={(e) => setDeliveryTitle(e.target.value)}
                  placeholder="e.g. Varun & Sneha Master Highlight Film"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ivory-300">File Name</label>
                <input
                  type="text"
                  value={deliveryFileName}
                  onChange={(e) => setDeliveryFileName(e.target.value)}
                  placeholder="e.g. KBK_Wedding_Master_4K.mp4"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ivory-300">Deliverable Category</label>
                <select
                  value={deliveryCategory}
                  onChange={(e) => setDeliveryCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-xs sm:text-sm font-medium"
                >
                  <option value="master_video">Full Master Video Highlight</option>
                  <option value="teaser_reel">Vertical 9:16 Teaser Reel</option>
                  <option value="color_stills">Color Graded 4K Stills</option>
                  <option value="raw_archive">Archive Zip</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isUploadingDeliveryFile}
                onClick={() => {
                  setDeliveryProject(null);
                  setSelectedDeliveryFile(null);
                }}
                className="px-4 py-2 rounded-xl bg-surface-100 text-ivory-300 text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploadingDeliveryFile}
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-sm disabled:opacity-60"
              >
                {isUploadingDeliveryFile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading Video...</span>
                  </>
                ) : (
                  <span>Attach & Notify Client</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Service Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveService} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <h3 className="font-serif text-xl font-bold text-ivory-100">
              {editingService.id ? 'Edit Service & Pricing' : 'Create New Service'}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Service Title</label>
                <input
                  type="text"
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ivory-300">Base Price (₹)</label>
                  <input
                    type="number"
                    value={editingService.basePrice || 0}
                    onChange={(e) => setEditingService({ ...editingService, basePrice: Number(e.target.value) })}
                    required
                    className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-gold font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ivory-300">Price Type</label>
                  <select
                    value={editingService.priceType || 'starting_from'}
                    onChange={(e) => setEditingService({ ...editingService, priceType: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                  >
                    <option value="starting_from">Starting From (Recommended)</option>
                    <option value="fixed_price">Fixed Price</option>
                    <option value="custom_quote">Custom Quote</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Short Description</label>
                <textarea
                  rows={2}
                  value={editingService.shortDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Turnaround Days</label>
                <input
                  type="number"
                  value={editingService.turnaroundDays || 5}
                  onChange={(e) => setEditingService({ ...editingService, turnaroundDays: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl bg-surface-100 text-ivory-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Work Edit Modal */}
      {editingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveWork} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <h3 className="font-serif text-xl font-bold text-ivory-100">
              {editingWork.id ? 'Edit Showcase Film' : 'Add New Showcase Film'}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Film Title</label>
                <input
                  type="text"
                  value={editingWork.title || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Category</label>
                <input
                  type="text"
                  value={editingWork.category || 'Wedding Highlights'}
                  onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Video Source URL (MP4)</label>
                <input
                  type="text"
                  value={editingWork.videoUrl || '/assets/hero-reel.mp4'}
                  onChange={(e) => setEditingWork({ ...editingWork, videoUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">External Full YouTube Destination URL</label>
                <input
                  type="url"
                  value={editingWork.externalDestUrl || 'https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX'}
                  onChange={(e) => setEditingWork({ ...editingWork, externalDestUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Description & Grading Breakdown</label>
                <textarea
                  rows={3}
                  value={editingWork.description || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="px-4 py-2 rounded-xl bg-surface-100 text-ivory-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider"
              >
                Save Showcase Work
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
