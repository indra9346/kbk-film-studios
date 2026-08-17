import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  Play,
  Star,
  Zap,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Camera,
  FolderUp,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudio } from '../context/StudioContext';
import { api } from '../api/client';
import { generateUUID } from '../api/supabaseClient';
import { getVideoType, getCleanVideoUrl, extractDriveFileId, isImageMedia } from '../components/video/VideoCard';
import { VideoModal } from '../components/video/VideoModal';
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
  const [identifierInput, setIdentifierInput] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [demoHint, setDemoHint] = useState('');

  // Active Tab in Owner Space
  const [activeTab, setActiveTab] = useState<
    'overview' | 'automation' | 'bookings' | 'pricing' | 'lifecycle' | 'deliveries' | 'works' | 'testimonials' | 'cms' | 'owners' | 'audit' | 'client_videos'
  >('overview');

  const [bookingSubFilter, setBookingSubFilter] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [lifecycleSubFilter, setLifecycleSubFilter] = useState<'active' | 'completed'>('active');

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

  // Automation & Workflows State
  const [workflowsData, setWorkflowsData] = useState<{ executions: any[]; stats: any; overdueProjects: any[] } | null>(null);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);
  const [workflowNotice, setWorkflowNotice] = useState<string | null>(null);

  // Client Video Deliveries
  const [clientVideos, setClientVideos] = useState<any[]>([]);
  const [editingClientVideo, setEditingClientVideo] = useState<any | null>(null);
  const [deletingClientVideoId, setDeletingClientVideoId] = useState<string | null>(null);

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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [deletingWorkId, setDeletingWorkId] = useState<string | null>(null);
  const [previewModalWork, setPreviewModalWork] = useState<PublicWork | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const workVideoInputRef = useRef<HTMLInputElement | null>(null);
  const workPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const workCoverInputRef = useRef<HTMLInputElement | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Ingestor States
  const [quickIngestUrl, setQuickIngestUrl] = useState('');
  const [quickIngestTitle, setQuickIngestTitle] = useState('');
  const [quickIngestCategory, setQuickIngestCategory] = useState('Wedding Highlights');
  const [isPublishingQuickWork, setIsPublishingQuickWork] = useState(false);

  // Active playing states for showcase preview cards
  const [playingCardIds, setPlayingCardIds] = useState<Record<string, boolean>>({});
  const [mutedCardIds, setMutedCardIds] = useState<Record<string, boolean>>({});

  // Testimonial Edit / Create Modal
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
  const testimonialVideoInputRef = useRef<HTMLInputElement | null>(null);

  // Deletion Confirmation States
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Upload Delivery Modal
  const [deliveryProject, setDeliveryProject] = useState<ServiceProject | null>(null);
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryFileName, setDeliveryFileName] = useState('');
  const [deliveryCategory, setDeliveryCategory] = useState<any>('master_video');
  const [selectedDeliveryFile, setSelectedDeliveryFile] = useState<File | null>(null);
  const [deliveryVideoUrl, setDeliveryVideoUrl] = useState('');
  const [isUploadingDeliveryFile, setIsUploadingDeliveryFile] = useState(false);

  // Co-Owner Invite Modal
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');

  const loadWorkflows = async () => {
    try {
      const data = await api.getWorkflows();
      setWorkflowsData(data);
    } catch (err: any) {
      console.warn('Failed to load workflows:', err);
    }
  };

  const handleRunOverdueCheck = async () => {
    try {
      setWorkflowActionLoading(true);
      const res = await api.checkOverdueWorkflows();
      setWorkflowNotice(`Overdue scan complete! Flagged ${res.count || 0} projects.`);
      await Promise.all([loadOwnerData(), loadWorkflows()]);
    } catch (err: any) {
      setWorkflowNotice(`Overdue scan error: ${err.message}`);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  const handleTestN8n = async () => {
    try {
      setWorkflowActionLoading(true);
      const res = await api.testN8nWebhook();
      setWorkflowNotice(`n8n webhook test dispatched! Response: ${res.message || 'OK'}`);
      await loadWorkflows();
    } catch (err: any) {
      setWorkflowNotice(`n8n test error: ${err.message}`);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

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
      // Synthesize active projects for accepted bookings if not yet in database
      const combinedProjects = [...p];
      b.filter((bk: any) => bk.status === 'accepted').forEach((bk: any) => {
        if (!combinedProjects.some((pr: any) => pr.bookingRef === bk.bookingRef)) {
          combinedProjects.push({
            id: `proj-${bk.bookingRef}`,
            bookingId: bk.id,
            bookingRef: bk.bookingRef,
            clientId: bk.clientId || 'client-1',
            clientName: bk.clientName,
            clientPhone: bk.clientPhone,
            clientEmail: bk.clientEmail || '',
            serviceId: bk.serviceId || 'srv-1',
            serviceTitle: bk.serviceTitle || 'Specialized Video Editing',
            trackingToken: `TK-${bk.bookingRef.replace('KBK-', '')}`,
            currentStage: 'raw_footage_received' as const,
            stageProgressPercent: 30,
            startDate: new Date().toISOString().split('T')[0],
            estimatedDeliveryDate: bk.preferredDeliveryDate || bk.eventDate || new Date().toISOString().split('T')[0],
            statusHistory: [
              {
                id: `sh-1-${bk.bookingRef}`,
                stage: 'booking_requested' as const,
                stageLabel: 'Booking Requested',
                message: 'Booking accepted by Kurudi Bharath Kumar.',
                updatedBy: 'Kurudi Bharath Kumar',
                timestamp: bk.createdAt
              },
              {
                id: `sh-2-${bk.bookingRef}`,
                stage: 'raw_footage_received' as const,
                stageLabel: 'Raw Footage Ingested',
                message: 'Footage ingested in 4K editing bay.',
                updatedBy: 'Lead Filmmaker',
                timestamp: new Date().toISOString()
              }
            ],
            internalNotes: 'Active project in studio pipeline.',
            clientMessages: [],
            deliveries: [],
            createdAt: bk.createdAt,
            updatedAt: new Date().toISOString()
          });
        }
      });
      setProjects(combinedProjects);
      setServices(s);
      setWorks(w);
      setTestimonials(t);
      setOwnersList(o);
      setAuditLogs(a);
      setCmsData(c);
      loadWorkflows();
      try {
        const cvd = await api.getClientVideoDeliveries();
        setClientVideos(cvd || []);
      } catch (e) {
        console.warn('Client video deliveries not yet available:', e);
      }
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
      setDemoHint(res.demoHint || '');
    } catch (err: any) {
      setAuthError(err.message || 'Access denied. Please verify your credentials.');
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

  const handleDeleteBooking = async (id: string) => {
    try {
      setBookings((prev) => prev.filter((b) => b.id !== id && b.bookingRef !== id));
      setProjects((prev) => prev.filter((p) => p.bookingId !== id && p.bookingRef !== id));
      setDeletingBookingId(null);
      await api.deleteBooking(id);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      console.error('Delete booking error:', err);
      alert(err.message || 'Failed to delete booking');
      loadOwnerData();
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id && p.bookingRef !== id));
      setDeletingProjectId(null);
      await api.deleteProject(id);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      console.error('Delete project error:', err);
      alert(err.message || 'Failed to delete project');
      loadOwnerData();
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

  // Lifecycle Stage Update with Instant UI Feedback
  const handleAdvanceStage = async (projectId: string, nextStage: ServiceProjectStage, label: string) => {
    try {
      // Optimistic update so UI immediately updates the button and badge
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId || p.bookingRef === projectId
            ? { ...p, currentStage: nextStage }
            : p
        )
      );

      await api.updateProjectStage(projectId, {
        stage: nextStage,
        stageLabel: label,
        message: `Advanced to ${label} by ${ownerData?.name || 'Kurudi Bharath Kumar'}`
      });
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'Failed to update lifecycle stage');
      loadOwnerData();
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
        videoUrl: deliveryVideoUrl.trim() || 'https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view',
        expiryDays: 90,
        maxDownloads: 50
      });

      setDeliveryProject(null);
      setDeliveryTitle('');
      setDeliveryFileName('');
      setDeliveryVideoUrl('');
      setSelectedDeliveryFile(null);
      loadOwnerData();
      alert('Deliverable uploaded and client tracking locker updated successfully!');
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
      const finalCategory = (isCustomCategory && customCategoryName.trim())
        ? customCategoryName.trim()
        : editingWork.category || 'Wedding Highlights';

      const payload = {
        ...editingWork,
        category: finalCategory,
      };

      await api.saveWork(payload);
      setEditingWork(null);
      setIsCustomCategory(false);
      setCustomCategoryName('');
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save work');
    }
  };

  const handleDeleteWork = async (id: string) => {
    try {
      // Optimistic update for instant UI feedback
      setWorks((prev) => prev.filter((w) => w.id !== id));
      setDeletingWorkId(null);
      await api.deleteWork(id);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      console.error('Delete work error:', err);
      alert(err.message || 'Failed to delete work');
      loadOwnerData();
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial || !editingTestimonial.clientName || !editingTestimonial.reviewText) return;
    try {
      const payload = {
        ...editingTestimonial,
        serviceTitle: editingTestimonial.serviceTitle || 'Wedding Video Highlights',
        location: editingTestimonial.location || 'Hindupur, AP',
        eventDate: editingTestimonial.eventDate || '2026',
        rating: Number(editingTestimonial.rating) || 5,
        isPublished: editingTestimonial.isPublished !== false,
        isVerified: true
      };
      await api.saveTestimonial(payload);
      setEditingTestimonial(null);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save testimonial');
    }
  };

  const handleLocalMediaSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'work_media' | 'work_cover' | 'testimonial' | 'quick_ingest'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const res = await api.uploadMedia(file);
      if (!res.success || !res.url) {
        alert('Could not upload media file.');
        return;
      }

      if (type === 'work_media') {
        setEditingWork((prev) => {
          const autoTitle = prev?.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          return {
            ...prev,
            videoUrl: res.url,
            thumbnailUrl: res.isImage ? (prev?.thumbnailUrl || res.url) : (prev?.thumbnailUrl || '/assets/kbk-logo.jpg'),
            title: autoTitle
          };
        });
      } else if (type === 'work_cover') {
        setEditingWork((prev) => ({
          ...prev,
          thumbnailUrl: res.url
        }));
      } else if (type === 'testimonial') {
        setEditingTestimonial((prev) => ({
          ...prev,
          videoUrl: res.url
        }));
      } else if (type === 'quick_ingest') {
        setQuickIngestUrl(res.url);
        if (!quickIngestTitle) {
          setQuickIngestTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      }
    } catch (err: any) {
      alert(`Media upload error: ${err.message}`);
    } finally {
      setIsUploadingMedia(false);
      event.target.value = '';
    }
  };

  const handlePublishQuickWork = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = quickIngestUrl.trim();
    const title = quickIngestTitle.trim() || 'Client Showcase Work';
    if (!url) {
      alert('Please enter a video/photo URL or browse a local file from your machine!');
      return;
    }

    try {
      setIsPublishingQuickWork(true);
      const isImg = isImageMedia(url);
      const payload: PublicWork = {
        id: generateUUID(),
        title,
        category: quickIngestCategory || (isImg ? 'Wedding Photo Gallery' : 'Wedding Highlights'),
        eventLocation: 'Hindupur, AP',
        eventYear: '2026',
        thumbnailUrl: isImg ? url : '/assets/kbk-logo.jpg',
        videoUrl: url,
        videoSourceType: isImg ? ('image' as any) : (url.includes('drive.google.com') ? 'google_drive' : url.includes('youtube') ? 'youtube' : 'direct_mp4'),
        description: isImg
          ? 'Master high-resolution color corrected and toned luxury stills collection.'
          : 'Master color graded and cinematic pace edited luxury wedding film.',
        softwareUsed: isImg ? ['Adobe Lightroom', 'Photoshop'] : ['Premiere Pro', 'DaVinci Resolve Studio'],
        isFeatured: true,
        isPublished: true,
        sortOrder: works.length + 1,
        createdAt: new Date().toISOString()
      };

      await api.saveWork(payload);
      setQuickIngestUrl('');
      setQuickIngestTitle('');
      await loadOwnerData();
      await refreshData();
      alert(`🎉 Successfully published "${title}" directly to Supabase & Portfolio! Broadcasted to all devices live.`);
    } catch (err: any) {
      alert(`Error publishing work: ${err.message}`);
    } finally {
      setIsPublishingQuickWork(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      setDeletingTestimonialId(null);
      await api.deleteTestimonial(id);
      loadOwnerData();
      refreshData();
    } catch (err: any) {
      console.error('Delete testimonial error:', err);
      alert(err.message || 'Failed to delete testimonial');
      loadOwnerData();
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
                  {ownerData.name} ({ownerData.role === 'primary_owner' ? 'DEVELOPER' : 'STUDIO OWNER'})
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
                    placeholder="Enter registered phone or email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-100 border border-surface-50 text-[11px] text-ivory-400">
                  <p>Enter the phone number or email registered with KBK Film Studios to receive your one-time access code.</p>
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
                { id: 'automation', label: 'Automation & n8n', icon: Zap },
                { id: 'bookings', label: `Bookings (${bookings.filter(b => b.status === 'pending').length} New)`, icon: FileText },
                { id: 'pricing', label: 'Service Pricing CMS', icon: DollarSign },
                { id: 'lifecycle', label: `Active Lifecycle (${projects.filter(p => p.currentStage !== 'testimonial_received').length})`, icon: Layers },
                { id: 'client_videos', label: `Client Deliveries Locker (${clientVideos.length})`, icon: Upload },
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
                          <th className="pb-3 text-right">Action</th>
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
                            <td className="py-3 text-right">
                              {deletingBookingId === b.id ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <span className="text-[10px] text-accent-crimson font-bold animate-pulse">Delete?</span>
                                  <button
                                    onClick={() => handleDeleteBooking(b.id)}
                                    className="px-2 py-0.5 rounded bg-accent-crimson hover:bg-accent-crimson/80 text-white text-[10px] font-bold shadow-sm"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setDeletingBookingId(null)}
                                    className="px-1.5 py-0.5 rounded bg-surface-100 text-ivory-400 text-[10px]"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingBookingId(b.id)}
                                  className="p-1 rounded text-accent-crimson/70 hover:text-accent-crimson hover:bg-accent-crimson/15 transition-all inline-flex items-center gap-1 text-[11px]"
                                  title="Delete Booking Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AUTOMATION & n8n WORKFLOW ENGINE */}
            {activeTab === 'automation' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-ivory-100 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-gold" />
                        Automation Engine & n8n Workflow Hub
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-accent-emerald/15 text-accent-emerald text-[10px] font-bold border border-accent-emerald/30">
                        Live Engine Active
                      </span>
                    </div>
                    <p className="text-xs text-ivory-400 mt-1">
                      Event-driven state machine connecting Supabase Realtime, Project Lifecycle, Delivery Lockers, Testimonials, and n8n Cloud webhooks.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleRunOverdueCheck}
                      disabled={workflowActionLoading}
                      className="px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-gold hover:text-black border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Scan Overdue</span>
                    </button>

                    <button
                      onClick={handleTestN8n}
                      disabled={workflowActionLoading}
                      className="px-3.5 py-2 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Test n8n Webhook</span>
                    </button>

                    <button
                      onClick={() => { loadWorkflows(); loadOwnerData(); }}
                      className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 border border-surface-50 text-ivory-300 transition-colors"
                      title="Refresh Workflow Data"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {workflowNotice && (
                  <div className="p-3.5 rounded-xl bg-surface-100 border border-gold/30 flex items-center justify-between text-xs text-gold">
                    <span>{workflowNotice}</span>
                    <button onClick={() => setWorkflowNotice(null)} className="text-ivory-400 hover:text-white text-xs ml-4">
                      ✕
                    </button>
                  </div>
                )}

                {/* Workflow Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl glass-panel border border-gold/30">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Total Executions</span>
                    <div className="font-serif text-3xl font-extrabold text-gold mt-1">
                      {workflowsData?.stats?.total || 0}
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">Logged pipeline actions</p>
                  </div>

                  <div className="p-5 rounded-2xl glass-panel border border-surface-50">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Success Rate</span>
                    <div className="font-serif text-3xl font-extrabold text-accent-emerald mt-1">
                      {workflowsData?.stats?.total ? `${Math.round(((workflowsData.stats.completed || 0) / workflowsData.stats.total) * 100)}%` : '100%'}
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">{workflowsData?.stats?.completed || 0} completed successfully</p>
                  </div>

                  <div className="p-5 rounded-2xl glass-panel border border-surface-50">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">Overdue Alerts</span>
                    <div className="font-serif text-3xl font-extrabold text-accent-crimson mt-1">
                      {workflowsData?.stats?.overdueCount || projects.filter(p => p.isOverdue).length}
                    </div>
                    <p className="text-[10px] text-ivory-400 mt-1">Projects past delivery target</p>
                  </div>

                  <div className="p-5 rounded-2xl glass-panel border border-surface-50">
                    <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">n8n Cloud Webhook</span>
                    <div className="font-serif text-base font-bold text-ivory-100 mt-2 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse"></span>
                      <span>Connected</span>
                    </div>
                    <a
                      href="https://app.n8n.cloud/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-gold hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      <span>Open n8n Dashboard</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 5 Core Automated Workflows Blueprint */}
                <div className="space-y-3">
                  <h4 className="font-serif text-base font-bold text-ivory-100">
                    Active Automation Pipelines
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        title: '1. Booking → Project Ingestion',
                        desc: 'Creates client record, generates immutable price snapshot, spawns tracking lifecycle project, and fires webhook to n8n.',
                        trigger: 'Client Form Submission',
                        status: 'Active'
                      },
                      {
                        title: '2. Project Lifecycle State Machine',
                        desc: 'Validates strict 9-stage progression (Booking → Scheduling → Raw Footage → In Progress → Grading → Review → Completed → Delivered → Testimonial).',
                        trigger: 'Owner Stage Updates',
                        status: 'Active'
                      },
                      {
                        title: '3. Video Delivery Locker Sync',
                        desc: 'Attaches 4K master deliverables, generates secure client streaming token, advances project to Delivered stage, and creates testimonial draft.',
                        trigger: 'Upload Delivery File',
                        status: 'Active'
                      },
                      {
                        title: '4. Testimonial Moderation Pipeline',
                        desc: 'Collects client feedback, stages as pending moderation for owner review, and publishes verified reviews to Home & Testimonials pages.',
                        trigger: 'Client Feedback Form',
                        status: 'Active'
                      },
                      {
                        title: '5. Overdue Deadline Guard',
                        desc: 'Calculates project elapsed time vs estimated turnaround days, flags overdue projects, and dispatches automated reminder alerts.',
                        trigger: 'Daily Cron / Manual Trigger',
                        status: 'Active'
                      },
                      {
                        title: '6. Supabase Realtime Live Sync',
                        desc: 'Multi-device cross-tab synchronization broadcasting instant database changes to all client & owner sessions in real-time.',
                        trigger: 'Database Mutation',
                        status: 'Active'
                      }
                    ].map((wf, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-surface-100/70 border border-gold/20 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-serif text-sm font-bold text-ivory-100">{wf.title}</h5>
                            <span className="px-2 py-0.5 rounded bg-accent-emerald/15 text-accent-emerald text-[9px] font-bold border border-accent-emerald/30">
                              {wf.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-ivory-300 leading-relaxed font-light">{wf.desc}</p>
                        </div>
                        <div className="pt-2 border-t border-surface-50 flex items-center justify-between text-[10px] text-ivory-400">
                          <span>Trigger:</span>
                          <span className="text-gold font-medium">{wf.trigger}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overdue Projects Flagged Section (if any) */}
                {projects.filter(p => p.isOverdue).length > 0 && (
                  <div className="p-5 rounded-2xl bg-accent-crimson/10 border border-accent-crimson/30 space-y-3">
                    <div className="flex items-center gap-2 text-accent-crimson font-bold text-sm">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Overdue Projects Requiring Attention ({projects.filter(p => p.isOverdue).length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {projects.filter(p => p.isOverdue).map((p) => (
                        <div key={p.id} className="p-3 rounded-xl bg-surface-200 border border-accent-crimson/20 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-white block">{p.bookingRef} - {p.clientName}</span>
                            <span className="text-[11px] text-ivory-400">{p.serviceTitle} • Target: {p.estimatedDeliveryDate || 'N/A'}</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('lifecycle')}
                            className="px-2.5 py-1 rounded bg-accent-crimson/20 hover:bg-accent-crimson text-white text-xs font-semibold"
                          >
                            Update Stage
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Automation Execution History Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-ivory-100">
                      Live Execution History
                    </h4>
                    <span className="text-xs text-ivory-400">
                      Total {workflowsData?.executions?.length || 0} Events
                    </span>
                  </div>

                  {(!workflowsData?.executions || workflowsData.executions.length === 0) ? (
                    <div className="p-8 rounded-2xl glass-panel text-center text-ivory-400 text-xs">
                      No automation events logged yet. Triggering a booking, stage update, or test ping will log real-time executions here.
                    </div>
                  ) : (
                    <div className="rounded-2xl glass-panel border border-surface-50 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-100/90 text-[11px] uppercase tracking-wider text-ivory-400 border-b border-surface-50">
                            <tr>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Workflow Name</th>
                              <th className="py-3 px-4">Trigger Event</th>
                              <th className="py-3 px-4">Related ID</th>
                              <th className="py-3 px-4">Action Taken</th>
                              <th className="py-3 px-4">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-50">
                            {workflowsData.executions.slice(0, 20).map((ex) => (
                              <tr key={ex.id} className="hover:bg-surface-100/50 transition-colors">
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    ex.status === 'completed'
                                      ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                                      : ex.status === 'failed'
                                      ? 'bg-accent-crimson/15 text-accent-crimson border border-accent-crimson/30'
                                      : 'bg-gold/15 text-gold border border-gold/30'
                                  }`}>
                                    {ex.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-semibold text-ivory-100">{ex.workflowName}</td>
                                <td className="py-3 px-4 text-gold font-mono text-[11px]">{ex.triggerEvent}</td>
                                <td className="py-3 px-4 font-mono text-ivory-300">{ex.relatedEntityId || '—'}</td>
                                <td className="py-3 px-4 text-ivory-300 max-w-xs truncate">{ex.actionTaken}</td>
                                <td className="py-3 px-4 text-ivory-400 whitespace-nowrap">
                                  {new Date(ex.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Client Booking Inquiries & Quotation Management
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Sync client requests, accept projects, and log declination reasons.
                    </p>
                  </div>
                  <span className="text-xs text-ivory-400">
                    Total: {bookings.length} Bookings
                  </span>
                </div>

                {/* Sub-Filters */}
                <div className="flex items-center gap-2 p-1 bg-surface-200/50 rounded-xl border border-surface-50 max-w-md">
                  {[
                    { id: 'pending', label: `Pending (${bookings.filter(b => b.status === 'pending').length})` },
                    { id: 'accepted', label: `Accepted (${bookings.filter(b => b.status === 'accepted').length})` },
                    { id: 'rejected', label: `Rejected (${bookings.filter(b => b.status === 'rejected').length})` },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setBookingSubFilter(sub.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                        bookingSubFilter === sub.id
                          ? 'bg-gold text-black shadow-gold-sm'
                          : 'text-ivory-400 hover:text-white'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {(() => {
                    const filtered = bookings.filter(b => b.status === bookingSubFilter);
                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center rounded-3xl glass-panel border border-gold/15 space-y-2">
                          <p className="text-sm text-ivory-400 italic">No {bookingSubFilter} bookings found.</p>
                        </div>
                      );
                    }
                    return filtered.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-6 rounded-2xl glass-panel border border-gold/20 space-y-4 hover:border-gold/40 transition-all animate-fadeIn"
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
                            {booking.status !== 'rejected' && (
                              <button
                                onClick={() => {
                                  setPriceRevisionBooking(booking);
                                  setNewPriceAmount(booking.finalAmount || booking.quotedAmount);
                                }}
                                className="text-[11px] text-gold/80 hover:text-gold underline block mt-0.5"
                              >
                                Revise Quote
                              </button>
                            )}
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

                        {booking.status === 'rejected' && booking.rejectionReason && (
                          <div className="p-3 rounded-xl bg-accent-crimson/10 border border-accent-crimson/30 text-xs">
                            <span className="text-[10px] text-ivory-400 font-bold block mb-1">DECLINATION REASON:</span>
                            <p className="text-accent-crimson font-mono">{booking.rejectionReason}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-surface-50">
                          <div className="flex flex-wrap gap-2.5">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedBookingForAction(booking);
                                    setActionQuoteAmount(booking.quotedAmount);
                                    setActionScheduleDate(booking.preferredDeliveryDate || '');
                                  }}
                                  className="px-5 py-2 rounded-xl bg-accent-emerald text-black font-bold text-xs uppercase tracking-wider hover:bg-accent-emerald/90 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Accept & Schedule</span>
                                </button>

                                <button
                                  onClick={() => handleRejectBooking(booking)}
                                  className="px-4 py-2 rounded-xl bg-accent-crimson/20 hover:bg-accent-crimson/30 text-accent-crimson border border-accent-crimson/40 font-semibold text-xs transition-all"
                                >
                                  Decline Request
                                </button>
                              </>
                            )}
                          </div>

                          {/* Delete Booking Button */}
                          <div>
                            {deletingBookingId === booking.id ? (
                              <div className="flex items-center gap-2 p-1 bg-accent-crimson/10 border border-accent-crimson/30 rounded-xl">
                                <span className="text-[11px] text-accent-crimson font-bold pl-2">Delete permanently?</span>
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="px-3 py-1 rounded-lg bg-accent-crimson hover:bg-accent-crimson/80 text-white text-xs font-bold shadow-sm"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  onClick={() => setDeletingBookingId(null)}
                                  className="px-2 py-1 rounded-lg bg-surface-100 text-ivory-400 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingBookingId(booking.id)}
                                className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-accent-crimson/20 text-ivory-400 hover:text-accent-crimson border border-surface-50 hover:border-accent-crimson/40 text-xs font-medium transition-all flex items-center gap-1.5"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-accent-crimson/80" />
                                <span>Delete Record</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Client Project Lifecycle Tracker (9 Stages)
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Advance project stages, upload deliverables, and track progress.
                    </p>
                  </div>
                  <span className="text-xs text-ivory-400">
                    {projects.filter(p => p.currentStage !== 'testimonial_received').length} Active Projects
                  </span>
                </div>

                {/* Sub-Filters */}
                <div className="flex items-center gap-2 p-1 bg-surface-200/50 rounded-xl border border-surface-50 max-w-sm">
                  {[
                    { id: 'active', label: `Active Pipeline (${projects.filter(p => p.currentStage !== 'testimonial_received').length})` },
                    { id: 'completed', label: `Completed & Archived (${projects.filter(p => p.currentStage === 'testimonial_received').length})` },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setLifecycleSubFilter(sub.id as any)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                        lifecycleSubFilter === sub.id
                          ? 'bg-gold text-black shadow-gold-sm'
                          : 'text-ivory-400 hover:text-white'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {(() => {
                    const filtered = projects.filter((p) => {
                      const isCompleted = p.currentStage === 'testimonial_received';
                      return lifecycleSubFilter === 'completed' ? isCompleted : !isCompleted;
                    });
                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center rounded-3xl glass-panel border border-gold/15 space-y-2">
                          <p className="text-sm text-ivory-400 italic">No {lifecycleSubFilter === 'completed' ? 'completed & archived' : 'active pipeline'} projects found.</p>
                        </div>
                      );
                    }
                    return filtered.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-6 rounded-3xl glass-panel border border-gold/30 space-y-6 animate-fadeIn"
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

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Quick Action to upload delivery */}
                            {proj.currentStage !== 'testimonial_received' && (
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
                            )}

                            {/* Delete Project Action */}
                            {deletingProjectId === proj.id ? (
                              <div className="flex items-center gap-1.5 p-1 bg-accent-crimson/10 border border-accent-crimson/30 rounded-xl">
                                <span className="text-[10px] text-accent-crimson font-bold pl-2">Delete project?</span>
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="px-2.5 py-1 rounded-lg bg-accent-crimson hover:bg-accent-crimson/80 text-white text-xs font-bold shadow-sm"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingProjectId(null)}
                                  className="px-2 py-1 rounded-lg bg-surface-100 text-ivory-400 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingProjectId(proj.id)}
                                className="p-2 rounded-xl bg-surface-100 hover:bg-accent-crimson/20 text-ivory-400 hover:text-accent-crimson border border-surface-50 hover:border-accent-crimson/40 transition-all text-xs"
                                title="Delete Lifecycle Project"
                              >
                                <Trash2 className="w-4 h-4 text-accent-crimson/80" />
                              </button>
                            )}
                          </div>
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
                    ));
                  })()}
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

            {/* TAB 5.5: CLIENT VIDEO DELIVERIES */}
            {activeTab === 'client_videos' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Client Video Deliveries — Private Locker
                    </h3>
                    <p className="text-xs text-ivory-400 mt-1">
                      Deliver edited videos privately to clients via Google Drive, YouTube, or direct URL. Each client gets an isolated access token.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingClientVideo({
                      bookingRef: '',
                      clientName: '',
                      title: '',
                      description: '',
                      videoUrl: '',
                      fileCategory: 'master_video',
                      expiryDays: 90,
                      maxDownloads: 50,
                      ownerNotes: '',
                    })}
                    className="px-4 py-2.5 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-sm hover:bg-gold-light transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Client Video</span>
                  </button>
                </div>

                {/* Test indicator for Amulya Haldi video */}
                {clientVideos.some(v => v.bookingRef === 'KBK-2026-AMULYA') && (
                  <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Test Video Active:</strong> Amulya Haldi ceremony video (Google Drive) is loaded and ready for client delivery testing.
                    </span>
                  </div>
                )}

                {clientVideos.length === 0 ? (
                  <div className="p-12 rounded-3xl glass-panel border border-gold/15 text-center space-y-3">
                    <Play className="w-10 h-10 mx-auto text-gold opacity-50" />
                    <h4 className="font-serif text-lg font-bold text-ivory-100">No Client Video Deliveries Yet</h4>
                    <p className="text-xs text-ivory-400">Add a client's edited video to start delivering via private secure links.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {clientVideos.map((cvd) => {
                      const isGoogleDrive = cvd.videoUrl?.includes('drive.google.com') || cvd.videoSourceType === 'google_drive';
                      const isYoutube = cvd.videoUrl?.includes('youtube.com') || cvd.videoUrl?.includes('youtu.be');
                      const driveFileId = isGoogleDrive
                        ? (cvd.videoUrl?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || cvd.videoUrl?.match(/[?&]id=([a-zA-Z0-9_-]+)/))?.[1]
                        : null;
                      const ytId = isYoutube
                        ? cvd.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?#]+)/)?.[1]
                        : null;

                      return (
                        <div
                          key={cvd.id}
                          className="p-5 rounded-2xl glass-panel border border-gold/20 space-y-4 hover:border-gold/40 transition-all"
                        >
                          {/* Video Preview */}
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gold/20">
                            {ytId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=0&mute=1&controls=1`}
                                title={cvd.title}
                                className="w-full h-full border-0"
                                allow="encrypted-media"
                              />
                            ) : driveFileId ? (
                              <iframe
                                src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                                title={cvd.title}
                                className="w-full h-full border-0"
                                allow="autoplay"
                              />
                            ) : (
                              <video
                                src={cvd.videoUrl}
                                controls
                                muted
                                className="w-full h-full object-cover"
                                poster={cvd.thumbnailUrl || '/assets/kbk-logo.jpg'}
                              />
                            )}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-gold text-[9px] font-bold uppercase tracking-wider border border-gold/30 z-10">
                              {cvd.fileCategory?.replace(/_/g, ' ')}
                            </div>
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[9px] font-mono border border-emerald-500/30 z-10">
                              {isGoogleDrive ? '📁 Drive' : isYoutube ? '▶ YT' : '🎬 Direct'}
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div className="space-y-2">
                            <h4 className="font-serif text-base font-bold text-white line-clamp-1">{cvd.title}</h4>
                            <p className="text-xs text-ivory-400 line-clamp-2">{cvd.description}</p>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-ivory-400">
                              <div>
                                <span className="text-ivory-300 font-semibold block">Booking Ref:</span>
                                <span className="font-mono text-gold">{cvd.bookingRef}</span>
                              </div>
                              <div>
                                <span className="text-ivory-300 font-semibold block">Client:</span>
                                <span>{cvd.clientName}</span>
                              </div>
                              <div>
                                <span className="text-ivory-300 font-semibold block">Downloads:</span>
                                <span>{cvd.downloadCount} / {cvd.maxDownloads}</span>
                              </div>
                              <div>
                                <span className="text-ivory-300 font-semibold block">Expires:</span>
                                <span>{cvd.expiryDate ? new Date(cvd.expiryDate).toLocaleDateString('en-IN') : 'Never'}</span>
                              </div>
                            </div>

                            {/* Access Token */}
                            <div className="p-2.5 rounded-lg bg-surface-100 border border-surface-50 text-[10px] font-mono text-ivory-400 break-all">
                              <span className="text-gold font-bold block mb-0.5">Access Token:</span>
                              {cvd.downloadToken}
                            </div>

                            {/* Stream URL */}
                            <div className="p-2 rounded-lg bg-surface-100/60 border border-surface-50 text-[10px] text-ivory-400 break-all">
                              <span className="text-accent-emerald font-bold block mb-0.5">Client Stream URL:</span>
                              /api/client/stream-delivery/{cvd.downloadToken}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
                            <button
                              onClick={() => setEditingClientVideo(cvd)}
                              className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Delivery
                            </button>

                            {deletingClientVideoId === cvd.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-accent-crimson font-bold animate-pulse">Delete?</span>
                                <button
                                  onClick={async () => {
                                    await api.deleteClientVideoDelivery(cvd.id);
                                    setClientVideos(prev => prev.filter(v => v.id !== cvd.id));
                                    setDeletingClientVideoId(null);
                                  }}
                                  className="px-2 py-0.5 rounded bg-accent-crimson hover:bg-accent-crimson/80 text-white text-[10px] font-bold"
                                >Yes</button>
                                <button
                                  onClick={() => setDeletingClientVideoId(null)}
                                  className="px-1.5 py-0.5 rounded bg-surface-100 text-ivory-400 text-[10px]"
                                >No</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingClientVideoId(cvd.id)}
                                className="flex items-center gap-1 text-xs text-accent-crimson/70 hover:text-accent-crimson transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add/Edit Client Video Modal */}
                {editingClientVideo && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-surface-200 border border-gold/30 rounded-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-lg font-bold text-gold">
                          {editingClientVideo.id ? 'Edit Client Video Delivery' : 'Add New Client Video Delivery'}
                        </h3>
                        <button onClick={() => setEditingClientVideo(null)} className="text-ivory-400 hover:text-white text-sm font-bold">✕</button>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Booking Ref */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Booking Reference *</label>
                          <input
                            type="text"
                            value={editingClientVideo.bookingRef || ''}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, bookingRef: e.target.value }))}
                            placeholder="e.g. KBK-2026-8941"
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                          />
                        </div>

                        {/* Client Name */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Client Name *</label>
                          <input
                            type="text"
                            value={editingClientVideo.clientName || ''}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, clientName: e.target.value }))}
                            placeholder="e.g. Venkatesh & Divya"
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                          />
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Delivery Title *</label>
                          <input
                            type="text"
                            value={editingClientVideo.title || ''}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Amulya Haldi Ceremony — 4K Master"
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                          />
                        </div>

                        {/* Video URL */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Video URL * (Google Drive / YouTube / Direct MP4)</label>
                          <input
                            type="url"
                            value={editingClientVideo.videoUrl || ''}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, videoUrl: e.target.value }))}
                            placeholder="https://drive.google.com/file/d/... or YouTube URL"
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm font-mono"
                          />
                          <p className="text-[10px] text-ivory-400">Paste the Google Drive share link, YouTube URL, or direct .mp4 URL</p>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Description</label>
                          <textarea
                            rows={2}
                            value={editingClientVideo.description || ''}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this edited video..."
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm resize-none"
                          />
                        </div>

                        {/* File Category */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Video Category</label>
                          <select
                            value={editingClientVideo.fileCategory || 'master_video'}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, fileCategory: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                          >
                            <option value="master_video">Master Video (Full Edit)</option>
                            <option value="teaser_reel">Teaser Reel (60s/90s)</option>
                            <option value="raw_archive">Raw Archive</option>
                            <option value="color_stills">Color Stills</option>
                            <option value="document">Document / Invoice</option>
                          </select>
                        </div>

                        {/* Expiry Days */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-semibold text-ivory-300">Expiry (Days)</label>
                            <input
                              type="number"
                              min={1}
                              max={365}
                              value={editingClientVideo.expiryDays || 90}
                              onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, expiryDays: Number(e.target.value) }))}
                              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-ivory-300">Max Downloads</label>
                            <input
                              type="number"
                              min={1}
                              max={500}
                              value={editingClientVideo.maxDownloads || 50}
                              onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, maxDownloads: Number(e.target.value) }))}
                              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                            />
                          </div>
                        </div>

                        {/* Owner Notes */}
                        <div className="space-y-1">
                          <label className="font-semibold text-ivory-300">Owner Notes (Internal)</label>
                          <input
                            type="text"
                            value={editingClientVideo.ownerNotes || ''}
                            onChange={e => setEditingClientVideo((prev: any) => ({ ...prev, ownerNotes: e.target.value }))}
                            placeholder="Internal notes for this delivery..."
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 focus:outline-none focus:border-gold text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={async () => {
                            if (!editingClientVideo.bookingRef || !editingClientVideo.title || !editingClientVideo.videoUrl) {
                              alert('Please fill in Booking Ref, Title, and Video URL');
                              return;
                            }
                            try {
                              if (editingClientVideo.id) {
                                // Update
                                await api.updateClientVideoDelivery(editingClientVideo.id, editingClientVideo);
                                setClientVideos(prev => prev.map(v => v.id === editingClientVideo.id ? { ...v, ...editingClientVideo } : v));
                              } else {
                                // Create new
                                const result = await api.addClientVideoDelivery(editingClientVideo);
                                if (result?.delivery) {
                                  setClientVideos(prev => [result.delivery, ...prev]);
                                }
                              }
                              setEditingClientVideo(null);
                            } catch (err: any) {
                              alert(err.message || 'Failed to save delivery');
                            }
                          }}
                          className="flex-1 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all"
                        >
                          {editingClientVideo.id ? 'Update Delivery' : 'Add Video Delivery'}
                        </button>
                        <button
                          onClick={() => setEditingClientVideo(null)}
                          className="px-5 py-3 rounded-xl bg-surface-100 text-ivory-300 text-xs font-semibold border border-surface-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: WORKS SHOWCASE CMS */}
            {activeTab === 'works' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Public Works Showcase Portfolio CMS
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Managed in Supabase table <code className="text-gold font-mono">public.public_works</code> • Broadcasts to all devices live.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          for (const w of works) {
                            await api.saveWork(w);
                          }
                          await loadOwnerData();
                          await refreshData();
                          alert('✅ All showcase films successfully synced and stored in Supabase public_works table!');
                        } catch (err: any) {
                          alert(`Sync status: ${err.message}`);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-gold/20 text-gold border border-gold/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync to Supabase</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingWork({
                          title: '',
                          category: 'Wedding Highlights',
                          eventLocation: 'Hindupur, AP',
                          eventYear: '2026',
                          videoUrl: '',
                          isFeatured: true,
                          isPublished: true,
                          softwareUsed: ['Premiere Pro', 'DaVinci Resolve']
                        });
                        setIsCustomCategory(false);
                        setCustomCategoryName('');
                      }}
                      className="px-4 py-2 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-sm hover:bg-gold-light transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Showcase Film</span>
                    </button>
                  </div>
                </div>

                {/* Automated 1-Click Link & Local File Ingestor (n8n + Supabase + Local Machine) */}
                <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-gold/40 bg-surface-100/90 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gold animate-pulse" />
                      <h4 className="font-serif font-bold text-sm text-ivory-100 uppercase tracking-wider">
                        Automated Instant Media Ingestor (Videos, Photos & Local Files)
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-gold/90 bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20 flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3 text-gold" /> Auto-Synced to Supabase
                    </span>
                  </div>

                  <p className="text-xs text-ivory-300">
                    Paste any public video / photo link (Google Drive, YouTube, direct MP4/JPG) or <span className="text-gold font-semibold">browse accurately from your local machine</span> to publish directly to portfolio.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 flex gap-2">
                      <input
                        type="text"
                        value={quickIngestUrl}
                        onChange={(e) => setQuickIngestUrl(e.target.value)}
                        placeholder="Paste Video / Picture URL (Drive, YouTube, direct link...)"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-surface-200 border border-gold/30 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold placeholder:text-ivory-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => quickFileInputRef.current?.click()}
                        disabled={isUploadingMedia}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-200 hover:bg-gold/20 text-gold border border-gold/40 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                        title="Browse video or photo from local machine"
                      >
                        <FolderUp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Browse File</span>
                      </button>
                      <input
                        ref={quickFileInputRef}
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        onChange={(e) => handleLocalMediaSelect(e, 'quick_ingest')}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={quickIngestTitle}
                        onChange={(e) => setQuickIngestTitle(e.target.value)}
                        placeholder="Film / Photo Title (e.g. HALDI HIGHLIGHTS)"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-200 border border-gold/30 text-ivory-100 text-xs sm:text-sm focus:outline-none focus:border-gold placeholder:text-ivory-400/50"
                      />
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                      <select
                        value={quickIngestCategory}
                        onChange={(e) => setQuickIngestCategory(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-surface-200 border border-gold/30 text-ivory-100 text-xs focus:outline-none focus:border-gold"
                      >
                        <option value="Wedding Highlights">Wedding Highlights</option>
                        <option value="Pre-Wedding Video Editing">Pre-Wedding Video</option>
                        <option value="Wedding Photo Gallery">Wedding Photo Gallery</option>
                        <option value="Haldi & Sangeeth Ceremonies">Haldi & Sangeeth</option>
                        <option value="Maternity Shoot Videos">Maternity Shoot</option>
                        <option value="House Warming Ceremonies">House Warming</option>
                        <option value="Spot Editing Available">Spot Editing</option>
                        <option value="Cinematic Teasers/Reels (9:16)">Teaser / Reels (9:16)</option>
                        <option value="YouTube Videos & Commercials">Commercials</option>
                      </select>

                      <button
                        type="button"
                        onClick={handlePublishQuickWork}
                        disabled={isPublishingQuickWork || isUploadingMedia || !quickIngestUrl.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold-sm transition-all shrink-0"
                      >
                        {isPublishingQuickWork ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 fill-black" />
                        )}
                        <span>{isPublishingQuickWork ? 'Publishing...' : 'Publish Live'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Visual Preview Chip in Ingestor (See Pics / Video Immediately) */}
                  {quickIngestUrl.trim() && (
                    <div className="p-3 rounded-xl bg-surface-200/90 border border-gold/30 flex items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-16 h-12 rounded-lg bg-black overflow-hidden border border-gold/30 shrink-0 flex items-center justify-center">
                          {isImageMedia(quickIngestUrl) ? (
                            <img
                              src={quickIngestUrl}
                              alt="Quick preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-300 flex items-center justify-center text-gold">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-ivory-100 truncate">
                            {quickIngestTitle || 'Untitled Showcase Work'}
                          </p>
                          <p className="text-[10px] text-ivory-400 truncate flex items-center gap-1 font-mono">
                            {isImageMedia(quickIngestUrl) ? (
                              <span className="text-emerald-400 font-bold">● High-Res Photo Still</span>
                            ) : (
                              <span className="text-gold font-bold">● Streamable Video</span>
                            )}
                            • {quickIngestCategory}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickIngestUrl('');
                          setQuickIngestTitle('');
                        }}
                        className="text-xs text-ivory-400 hover:text-accent-crimson px-2 py-1 rounded transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Showcase Works Grid with Simple Controls & Fullscreen Cinema */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {works.map((work) => {
                    const isPic = isImageMedia(work.videoUrl) || (!work.videoUrl && Boolean(work.thumbnailUrl));
                    const isCardPlaying = playingCardIds[work.id] ?? true;
                    const isCardMuted = mutedCardIds[work.id] ?? true;

                    return (
                      <div
                        key={work.id}
                        className="p-5 rounded-2xl glass-panel border border-gold/20 flex flex-col justify-between space-y-4 hover:border-gold/50 transition-all overflow-hidden group shadow-lg"
                      >
                        {/* Media Preview Container with Simple Controls */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gold/20 group/media">
                          {isPic ? (
                            <img
                              src={work.videoUrl || work.thumbnailUrl || '/assets/kbk-logo.jpg'}
                              alt={work.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/kbk-logo.jpg';
                              }}
                            />
                          ) : (() => {
                            const media = getVideoType(work.videoUrl);
                            const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(work.videoUrl);
                            if (media.type === 'youtube' && media.id) {
                              return (
                                <iframe
                                  src={`https://www.youtube.com/embed/${media.id}?autoplay=${isCardPlaying ? 1 : 0}&mute=${isCardMuted ? 1 : 0}&loop=1&playlist=${media.id}&controls=0`}
                                  title={work.title}
                                  className="w-full h-full object-cover border-0 pointer-events-none scale-105"
                                  allow="autoplay; encrypted-media"
                                  frameBorder="0"
                                />
                              );
                            }
                            if (driveId || media.type === 'google-drive' || work.videoUrl?.includes('drive.google.com') || work.videoSourceType === 'google_drive') {
                              const validId = driveId || extractDriveFileId(work.videoUrl);
                              return (
                                <iframe
                                  src={`https://drive.google.com/file/d/${validId}/preview`}
                                  title={work.title}
                                  className="w-full h-full object-cover border-0 pointer-events-none scale-105"
                                  allow="autoplay; encrypted-media"
                                />
                              );
                            }
                            return (
                              <video
                                id={`owner-video-${work.id}`}
                                src={getCleanVideoUrl(work.videoUrl)}
                                poster={work.thumbnailUrl || undefined}
                                autoPlay
                                muted={isCardMuted}
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            );
                          })()}

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-gold text-[9px] font-bold uppercase tracking-wider border border-gold/30 z-10">
                            {work.category}
                          </div>
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 text-[9px] font-mono border border-emerald-500/30 z-10 flex items-center gap-1">
                            {isPic ? <ImageIcon className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                            <span>{isPic ? 'Photo Still' : 'Live Preview'}</span>
                          </div>

                          {/* Bottom Simple Controls Overlay */}
                          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between z-20">
                            <div className="flex items-center gap-1">
                              {!isPic && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const vid = document.getElementById(`owner-video-${work.id}`) as HTMLVideoElement;
                                      const next = !isCardPlaying;
                                      setPlayingCardIds(prev => ({ ...prev, [work.id]: next }));
                                      if (vid) {
                                        if (next) vid.play();
                                        else vid.pause();
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 backdrop-blur-md transition-colors"
                                    title={isCardPlaying ? 'Pause video' : 'Play video'}
                                  >
                                    {isCardPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const vid = document.getElementById(`owner-video-${work.id}`) as HTMLVideoElement;
                                      const next = !isCardMuted;
                                      setMutedCardIds(prev => ({ ...prev, [work.id]: next }));
                                      if (vid) vid.muted = next;
                                    }}
                                    className="p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 backdrop-blur-md transition-colors"
                                    title={isCardMuted ? 'Unmute audio' : 'Mute audio'}
                                  >
                                    {isCardMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                  </button>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setPreviewModalWork(work)}
                              className="p-1.5 rounded-lg bg-gold/90 hover:bg-gold text-black shadow-gold font-bold transition-transform hover:scale-110 flex items-center gap-1 text-[10px]"
                              title={isPic ? 'View Full Image' : 'Cinema Player View'}
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Cinema View</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-serif text-base font-bold text-white">
                            {work.title}
                          </h4>
                          <p className="text-xs text-ivory-400 line-clamp-2">
                            {work.description || 'Master edited wedding showcase.'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setEditingWork(work);
                              const isPreset = [
                                'Wedding Highlights',
                                'Pre-Wedding Video Editing',
                                'Wedding Photo Gallery',
                                'Haldi & Sangeeth Ceremonies',
                                'Maternity Shoot Videos',
                                'House Warming Ceremonies',
                                'Spot Editing Available',
                                'AI-Assisted Video Creation & 3D Animation',
                                'Cinematic Teasers/Reels (9:16)',
                                'YouTube Videos & Commercials'
                              ].includes(work.category);
                              setIsCustomCategory(!isPreset);
                              setCustomCategoryName(!isPreset ? work.category : '');
                            }}
                            className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Work</span>
                          </button>

                          {deletingWorkId === work.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-accent-crimson font-bold animate-pulse">Confirm?</span>
                              <button
                                onClick={() => handleDeleteWork(work.id)}
                                className="px-2.5 py-1 rounded bg-accent-crimson hover:bg-accent-crimson/80 text-white text-[11px] font-bold shadow-sm transition-all"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeletingWorkId(null)}
                                className="px-2 py-1 rounded bg-surface-100 text-ivory-300 text-[11px] hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingWorkId(work.id)}
                              className="text-xs text-accent-crimson hover:bg-accent-crimson/15 px-2 py-1 rounded transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 7: TESTIMONIALS CMS */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ivory-100">
                      Client Testimonials & Customer Video Feedback
                    </h3>
                    <p className="text-xs text-ivory-400">
                      Add, edit, and curate client reviews, wedding testimonials, and video feedback recordings.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingTestimonial({
                      clientName: '',
                      serviceTitle: 'Wedding Video Highlights',
                      location: 'Hindupur, AP',
                      eventDate: '2026',
                      rating: 5,
                      reviewText: '',
                      videoUrl: '',
                      isPublished: true,
                      isVerified: true
                    })}
                    className="px-4 py-2.5 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-sm hover:bg-gold-light transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Client Testimonial</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((test) => (
                    <div
                      key={test.id}
                      className="p-5 rounded-2xl glass-panel border border-gold/20 flex flex-col justify-between space-y-4 hover:border-gold/40 transition-all overflow-hidden"
                    >
                      {/* If Video Attached -> Live Video Preview */}
                      {test.videoUrl ? (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gold/20">
                          {(() => {
                            const media = getVideoType(test.videoUrl);
                            if (media.type === 'youtube' && media.id) {
                              return (
                                <iframe
                                  src={`https://www.youtube.com/embed/${media.id}?autoplay=1&mute=1&loop=1&playlist=${media.id}&controls=0`}
                                  title={test.clientName}
                                  className="w-full h-full object-cover border-0 pointer-events-none scale-105"
                                  allow="autoplay; encrypted-media"
                                  frameBorder="0"
                                />
                              );
                            }
                            if (media.type === 'google-drive' && media.id) {
                              return (
                                <iframe
                                  src={`https://drive.google.com/file/d/${media.id}/preview`}
                                  title={test.clientName}
                                  className="w-full h-full object-cover border-0"
                                  allow="autoplay"
                                />
                              );
                            }
                            return (
                              <video
                                src={getCleanVideoUrl(test.videoUrl)}
                                poster={test.thumbnailUrl || '/assets/kbk-logo.jpg'}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            );
                          })()}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-gold text-[9px] font-bold uppercase tracking-wider border border-gold/30 z-10 flex items-center gap-1">
                            <Film className="w-2.5 h-2.5" />
                            <span>Video Feedback</span>
                          </div>
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[9px] font-mono border border-emerald-500/30 z-10">
                            Live Preview
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-surface-100/50 border border-surface-50 text-[11px] text-ivory-400 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gold shrink-0" />
                          <span>Written Review Quote (No video attached)</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-serif text-base font-bold text-white">
                              {test.clientName}
                            </h4>
                            <p className="text-[11px] text-ivory-400 font-medium">
                              {test.serviceTitle} • {test.location}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${test.isPublished ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-surface-100 text-ivory-400'}`}>
                            {test.isPublished ? 'Published' : 'Hidden'}
                          </span>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 text-gold">
                          {[...Array(test.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                          ))}
                          <span className="text-[11px] text-ivory-400 font-bold ml-1">
                            {test.rating || 5}.0
                          </span>
                        </div>

                        <p className="text-xs text-ivory-300 italic line-clamp-3 leading-relaxed">
                          "{test.reviewText}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
                        <button
                          onClick={() => setEditingTestimonial(test)}
                          className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Review</span>
                        </button>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={async () => {
                              try {
                                await api.saveTestimonial({ ...test, isPublished: !test.isPublished });
                                loadOwnerData();
                                refreshData();
                              } catch (err: any) {
                                alert(err.message || 'Failed to update status');
                              }
                            }}
                            className="text-[11px] text-ivory-400 hover:text-white font-medium"
                          >
                            {test.isPublished ? 'Hide' : 'Publish'}
                          </button>

                          {deletingTestimonialId === test.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-accent-crimson font-bold animate-pulse">Confirm?</span>
                              <button
                                onClick={() => handleDeleteTestimonial(test.id)}
                                className="px-2.5 py-1 rounded bg-accent-crimson hover:bg-accent-crimson/80 text-white text-[11px] font-bold shadow-sm transition-all"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeletingTestimonialId(null)}
                                className="px-2 py-1 rounded bg-surface-100 text-ivory-400 hover:text-white text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingTestimonialId(test.id)}
                              className="text-xs text-accent-crimson hover:bg-accent-crimson/15 px-2 py-1 rounded transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
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

                  {/* YouTube Channel Handle & URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300 flex items-center gap-1.5">
                      <span className="text-red-400">YouTube Channel Handle</span>
                    </label>
                    <input
                      type="text"
                      value={cmsData.youtubeHandle || ''}
                      onChange={(e) => setCmsData({ ...cmsData, youtubeHandle: e.target.value })}
                      placeholder="@bharathkumarglp2003"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300 flex items-center gap-1.5">
                      <span className="text-red-400">YouTube Destination URL</span>
                    </label>
                    <input
                      type="url"
                      value={cmsData.youtubeUrl || ''}
                      onChange={(e) => setCmsData({ ...cmsData, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/@bharathkumarglp2003"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  {/* Instagram & Facebook */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Instagram Handle</label>
                    <input
                      type="text"
                      value={cmsData.instagramHandle || ''}
                      onChange={(e) => setCmsData({ ...cmsData, instagramHandle: e.target.value })}
                      placeholder="@kurudi_bharathkumar_official"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ivory-300">Instagram URL</label>
                    <input
                      type="url"
                      value={cmsData.instagramUrl || ''}
                      onChange={(e) => setCmsData({ ...cmsData, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm font-mono"
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
                      Authorize and manage studio co-owners and editing assistants.
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
                  {ownersList.map((owner) => {
                    const isDeveloper = owner.role === 'primary_owner';
                    const isStudioOwner = owner.role === 'co_owner';
                    const isStudioHead = isDeveloper || isStudioOwner;
                    return (
                      <div key={owner.id} className="p-5 rounded-2xl glass-panel border border-gold/20 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-bold text-white">{owner.name}</h4>
                            {isDeveloper ? (
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-gold text-black">
                                DEVELOPER
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-surface-100 text-gold border border-gold/30">
                                STUDIO OWNER
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ivory-400 font-mono mt-1">
                            {owner.phone} • {owner.email}
                          </p>
                        </div>

                        {!isStudioHead && (
                          <button
                            onClick={() => handleRemoveOwner(owner.id)}
                            className="p-2 text-accent-crimson hover:bg-accent-crimson/20 rounded-lg transition-all"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
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
                <label className="text-xs font-semibold text-ivory-300 flex items-center justify-between">
                  <span>Google Drive / Stream Video Link</span>
                  <span className="text-[10px] text-gold font-normal">Auto-links to client player</span>
                </label>
                <input
                  type="text"
                  value={deliveryVideoUrl}
                  onChange={(e) => setDeliveryVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view"
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

      {/* Work Edit / Create Modal */}
      {editingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveWork} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gold/20 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-ivory-100 flex items-center gap-2">
                  {isImageMedia(editingWork.videoUrl) ? (
                    <ImageIcon className="w-5 h-5 text-gold" />
                  ) : (
                    <Film className="w-5 h-5 text-gold" />
                  )}
                  {editingWork.id ? 'Edit Showcase Work' : 'Add New Showcase Work (Videos & Photos)'}
                </h3>
                <p className="text-[11px] text-ivory-400">
                  Broadcasts automatically to public portfolio in 4K resolution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="p-1.5 rounded-lg bg-surface-100 hover:bg-gold hover:text-black text-ivory-300 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Film / Photo Title *</label>
                <input
                  type="text"
                  value={editingWork.title || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                  placeholder="e.g. Grand Traditional Muhurtham Film or Haldi Candid Portraits"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 placeholder:text-ivory-400/50 focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-ivory-300">Category / Service Section</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isCustomCategory;
                      setIsCustomCategory(nextState);
                      if (nextState) {
                        setCustomCategoryName(editingWork.category || '');
                      }
                    }}
                    className="text-[11px] text-gold hover:underline font-semibold"
                  >
                    {isCustomCategory ? '← Choose from Preset List' : '+ Enter Custom Category / Title'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => {
                        setCustomCategoryName(e.target.value);
                        setEditingWork({ ...editingWork, category: e.target.value });
                      }}
                      placeholder="e.g. YouTube Videos, Corporate Commercials, Wedding Photo Gallery..."
                      required
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold text-gold font-bold text-xs sm:text-sm placeholder:text-ivory-400/50"
                    />
                    <p className="text-[10px] text-ivory-400">
                      Type any custom category name. It will automatically create a dedicated section & filter tab in Explore Works.
                    </p>
                  </div>
                ) : (
                  <select
                    value={editingWork.category || 'Wedding Highlights'}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                        setCustomCategoryName('');
                      } else {
                        setEditingWork({ ...editingWork, category: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 font-medium"
                  >
                    <option value="Wedding Highlights">Wedding Highlights</option>
                    <option value="Pre-Wedding Video Editing">Pre-Wedding Video Editing</option>
                    <option value="Wedding Photo Gallery">Wedding Photo Gallery (Pictures / Stills)</option>
                    <option value="Haldi & Sangeeth Ceremonies">Haldi & Sangeeth Ceremonies</option>
                    <option value="Maternity Shoot Videos">Maternity Shoot Videos</option>
                    <option value="House Warming Ceremonies">House Warming Ceremonies</option>
                    <option value="Spot Editing Available">Spot Editing Available</option>
                    <option value="AI-Assisted Video Creation & 3D Animation">AI-Assisted Video Creation & 3D Animation</option>
                    <option value="Cinematic Teasers/Reels (9:16)">Cinematic Teasers/Reels (9:16)</option>
                    <option value="YouTube Videos & Commercials">YouTube Videos & Commercials</option>
                    <option value="__custom__">+ Enter Custom Category / Title...</option>
                  </select>
                )}
              </div>

              {/* Media Stream URL & Local Machine Browsing */}
              <div className="space-y-2 p-3.5 rounded-xl bg-surface-100/70 border border-gold/30">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-ivory-200 flex items-center gap-1.5">
                    {isImageMedia(editingWork.videoUrl) ? (
                      <ImageIcon className="w-3.5 h-3.5 text-gold" />
                    ) : (
                      <Film className="w-3.5 h-3.5 text-gold" />
                    )}
                    <span>Media URL (Video Link or Picture / Photo)</span>
                  </label>
                  <span className="text-[10px] text-gold font-normal">
                    {isUploadingMedia ? 'Uploading...' : 'Local machine & cloud supported'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editingWork.videoUrl || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, videoUrl: e.target.value })}
                    placeholder="Paste Video URL, Image URL, or browse local machine..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-200 border border-gold/20 text-ivory-100 font-mono text-xs placeholder:text-ivory-400/50 focus:border-gold"
                  />
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => workVideoInputRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="px-3 py-2.5 rounded-xl bg-surface-200 hover:bg-gold/20 border border-gold/40 text-gold text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Browse video file from local machine (.mp4, .mov, .webm)"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Browse Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => workPhotoInputRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="px-3 py-2.5 rounded-xl bg-surface-200 hover:bg-gold/20 border border-gold/40 text-gold text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Browse picture/photo from local machine (.jpg, .png, .webp)"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Browse Pic</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Inputs for Video and Photo */}
                <input
                  ref={workVideoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleLocalMediaSelect(e, 'work_media')}
                />
                <input
                  ref={workPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLocalMediaSelect(e, 'work_media')}
                />

                {/* LIVE VISUAL PREVIEW BOX ("see pics at place of adding video urls") */}
                {editingWork.videoUrl && (
                  <div className="mt-3 p-3 rounded-xl bg-black/90 border border-gold/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gold flex items-center gap-1">
                        {isImageMedia(editingWork.videoUrl) ? (
                          <>
                            <ImageIcon className="w-3.5 h-3.5" />
                            Live Picture / Photo Preview:
                          </>
                        ) : (
                          <>
                            <Film className="w-3.5 h-3.5" />
                            Live Video Stream Preview:
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingWork({ ...editingWork, videoUrl: '' })}
                        className="text-ivory-400 hover:text-accent-crimson transition-colors"
                      >
                        Remove Media
                      </button>
                    </div>

                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/10">
                      {isImageMedia(editingWork.videoUrl) ? (
                        <img
                          src={editingWork.videoUrl}
                          alt="Live picture preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/kbk-logo.jpg';
                          }}
                        />
                      ) : (() => {
                        const media = getVideoType(editingWork.videoUrl || '');
                        const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(editingWork.videoUrl || '');
                        if (media.type === 'youtube' && media.id) {
                          return (
                            <iframe
                              src={`https://www.youtube.com/embed/${media.id}?autoplay=0&controls=1`}
                              title="Preview"
                              className="w-full h-full object-cover border-0"
                            />
                          );
                        }
                        if (driveId || media.type === 'google-drive' || editingWork.videoUrl?.includes('drive.google.com')) {
                          return (
                            <iframe
                              src={`https://drive.google.com/file/d/${driveId || extractDriveFileId(editingWork.videoUrl || '')}/preview`}
                              title="Preview"
                              className="w-full h-full object-cover border-0"
                            />
                          );
                        }
                        return (
                          <video
                            src={getCleanVideoUrl(editingWork.videoUrl || '')}
                            controls
                            className="w-full h-full object-contain"
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Picture / Thumbnail Field */}
              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300 flex items-center justify-between">
                  <span>Cover Picture / Poster Thumbnail</span>
                  <span className="text-[10px] text-ivory-400 font-normal">Optional custom cover</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingWork.thumbnailUrl || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, thumbnailUrl: e.target.value })}
                    placeholder="Cover Image URL (e.g. /assets/kbk-logo.jpg or web image)"
                    className="flex-1 px-4 py-2 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => workCoverInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="px-3 py-2 rounded-xl bg-surface-100 border border-gold/30 text-gold text-[11px] font-semibold hover:bg-gold/10 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Browse Pic</span>
                  </button>
                  <input
                    ref={workCoverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLocalMediaSelect(e, 'work_cover')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Description & Grading Breakdown</label>
                <textarea
                  rows={3}
                  value={editingWork.description || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                  placeholder="Details on color grading LUTs, sound restoration, visual pacing, and equipment..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-surface-50">
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="px-4 py-2 rounded-xl bg-surface-100 text-ivory-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploadingMedia}
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all flex items-center gap-1.5"
              >
                {isUploadingMedia ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Showcase Work</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonial Edit / Create Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveTestimonial} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gold/20 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-ivory-100">
                  {editingTestimonial.id ? 'Edit Client Testimonial' : 'Add New Client Testimonial & Video'}
                </h3>
                <p className="text-[11px] text-ivory-400">
                  Add client written reviews and attach video feedback recordings.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] uppercase font-bold">
                Customer Feedback CMS
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ivory-300">Client / Couple Name *</label>
                  <input
                    type="text"
                    value={editingTestimonial.clientName || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                    placeholder="e.g. Vikram & Sandhya"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 placeholder:text-ivory-400/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ivory-300">Location</label>
                  <input
                    type="text"
                    value={editingTestimonial.location || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })}
                    placeholder="e.g. Bangalore, Karnataka"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 placeholder:text-ivory-400/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ivory-300">Service / Event Category</label>
                  <select
                    value={editingTestimonial.serviceTitle || 'Wedding Video Highlights'}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, serviceTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 font-medium"
                  >
                    <option value="Wedding Video Highlights">Wedding Video Highlights</option>
                    <option value="Pre-Wedding Video Editing">Pre-Wedding Video Editing</option>
                    <option value="Haldi & Sangeeth Ceremonies">Haldi & Sangeeth Ceremonies</option>
                    <option value="Maternity Shoot Videos">Maternity Shoot Videos</option>
                    <option value="House Warming Ceremonies">House Warming Ceremonies</option>
                    <option value="Spot Editing Available">Spot Editing Available</option>
                    <option value="Cinematic Teasers/Reels (9:16)">Cinematic Teasers/Reels (9:16)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ivory-300">Star Rating</label>
                  <select
                    value={editingTestimonial.rating || 5}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-gold font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0 / 5.0 - Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0 / 5.0 - Great)</option>
                    <option value={3}>⭐⭐⭐ (3.0 / 5.0 - Good)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300 flex items-center justify-between">
                  <span>Customer Video Feedback Stream URL (Optional)</span>
                  <span className="text-[10px] text-gold font-normal">Google Drive / YouTube / MP4</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingTestimonial.videoUrl || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, videoUrl: e.target.value })}
                    placeholder="e.g. https://drive.google.com/file/d/14Oc3e5cNWXMOGIxPXk4V-OlN620eBqWs/view?usp=drive_link"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 font-mono placeholder:text-ivory-400/50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => testimonialVideoInputRef.current?.click()}
                    className="px-3 py-2.5 rounded-xl bg-surface-100 border border-gold/30 text-gold text-[11px] font-semibold hover:bg-gold/10 transition-colors"
                  >
                    Browse Video
                  </button>
                </div>

                <input
                  ref={testimonialVideoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleLocalMediaSelect(e, 'testimonial')}
                />

                <p className="text-[11px] text-ivory-400 font-light">
                  Paste any Google Drive share link, YouTube link, or direct MP4 link of the customer's recorded video review. You can also browse a local video file here.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ivory-300">Written Client Review / Quote *</label>
                <textarea
                  rows={4}
                  value={editingTestimonial.reviewText || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, reviewText: e.target.value })}
                  placeholder="e.g. The cinematic film delivered by KBK Films exceeded all our expectations..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-100/70 border border-surface-50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ivory-200">Publish to Live Website</div>
                  <div className="text-[10px] text-ivory-400">Make visible on the public Testimonials & Homepage review sections</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingTestimonial.isPublished !== false}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-4 py-2 rounded-xl bg-surface-100 text-ivory-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all"
              >
                Save Client Testimonial
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full Cinema / Photo Modal Viewer for Showcase Items */}
      {previewModalWork && (
        <VideoModal
          work={previewModalWork}
          onClose={() => setPreviewModalWork(null)}
        />
      )}
    </div>
  );
};
