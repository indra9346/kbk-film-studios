export type ServicePriceType = 'starting_from' | 'fixed_price' | 'custom_quote';

export type ServiceProjectStage =
  | 'booking_requested'
  | 'accepted_scheduled'
  | 'raw_footage_received'
  | 'in_progress'
  | 'color_grading_audio'
  | 'in_review'
  | 'service_completed'
  | 'files_delivered'
  | 'testimonial_received';

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'primary_owner' | 'co_owner' | 'editor';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  detailedDescription: string;
  priceType: ServicePriceType;
  basePrice: number;
  currency: string;
  priceLabel: string;
  inclusions: string[];
  exclusions: string[];
  turnaroundDays: number;
  featured: boolean;
  isUpcoming: boolean;
  isActive: boolean;
  sortOrder: number;
  sampleVideoUrl?: string;
  badge?: string;
}

export interface PriceSnapshot {
  serviceId: string;
  serviceTitle: string;
  priceType: ServicePriceType;
  basePrice: number;
  currency: string;
  priceLabel: string;
  inclusions: string[];
  exclusions: string[];
  turnaroundDays: number;
  snapshotDate: string;
}

export interface BookingPriceHistory {
  id: string;
  bookingId: string;
  previousPrice: number;
  newPrice: number;
  currency: string;
  reason: string;
  updatedBy: string;
  timestamp: string;
}

export interface BookingRequest {
  id: string;
  bookingRef: string; // e.g. KBK-2026-8941
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientCity: string;
  serviceId: string;
  serviceTitle: string;
  eventDate: string;
  preferredDeliveryDate: string;
  budgetRange: string;
  footageDetails: string;
  referenceLinks: string;
  customNotes: string;
  agreedTerms: boolean;
  priceSnapshot: PriceSnapshot;
  quotedAmount: number;
  finalAmount?: number;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  stage: ServiceProjectStage;
  stageLabel: string;
  message: string;
  updatedBy: string;
  timestamp: string;
}

export interface PrivateDeliveryFile {
  id: string;
  projectId: string;
  bookingRef: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  fileCategory: 'master_video' | 'teaser_reel' | 'color_stills' | 'raw_archive' | 'document';
  storagePath: string; // relative to private storage folder
  downloadToken: string;
  expiryDate: string;
  downloadCount: number;
  maxDownloads: number;
  isStreamable: boolean;
  streamUrl?: string;
  createdAt: string;
}

export interface ServiceProject {
  id: string;
  bookingId: string;
  bookingRef: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceTitle: string;
  trackingToken: string;
  currentStage: ServiceProjectStage;
  stageProgressPercent: number;
  startDate: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  statusHistory: StatusHistoryEntry[];
  internalNotes: string;
  clientMessages: Array<{
    id: string;
    sender: 'owner' | 'client';
    senderName: string;
    text: string;
    timestamp: string;
  }>;
  deliveries: PrivateDeliveryFile[];
  testimonialId?: string;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientVideoDelivery {
  id: string;
  bookingRef: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  title: string;
  description?: string;
  videoUrl: string;
  videoSourceType?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  mimeType?: string;
  fileCategory?: string;
  downloadToken?: string;
  storagePath?: string;
  streamUrl?: string;
  expiryDate?: string;
  downloadCount?: number;
  maxDownloads?: number;
  isStreamable?: boolean;
  isActive?: boolean;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicWork {
  id: string;
  title: string;
  category: string;
  eventLocation: string;
  eventYear: string;
  thumbnailUrl: string;
  videoUrl: string;
  videoSourceType: 'direct_mp4' | 'youtube' | 'drive' | 'vimeo' | 'google_drive';
  externalDestUrl?: string;
  description: string;
  softwareUsed: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  serviceTitle: string;
  eventDate: string;
  location: string;
  rating: number;
  reviewText: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isVerified: boolean;
  isPublished: boolean;
  bookingRef?: string;
  createdAt: string;
}

export interface StudioCMSData {
  studioName: string;
  tagline: string;
  founderName: string;
  founderTitle: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  location: string;
  instagramHandle: string;
  instagramUrl: string;
  youtubeHandle: string;
  youtubeUrl: string;
  facebookHandle: string;
  facebookUrl: string;
  happyClientsCount: number;
  filmsDeliveredCount: number;
  yearsExperience: number;
  satisfactionRate: number;
  founderBio: string;
  educationDetails: {
    degree: string;
    college: string;
    coreHighlights: string[];
    currentPursuit: string;
  };
  editingSuites: string[];
  heroVideoUrl: string;
  heroSettledPosterUrl: string;
  priceDisclaimer: string;
  termsAndConditions: string[];
  contactClarificationMsg: string;
}

export interface AuditLog {
  id: string;
  actorRole: 'primary_owner' | 'co_owner' | 'editor' | 'client' | 'system';
  actorName: string;
  actorIdentifier: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export interface OTPVerification {
  id: string;
  identifier: string; // phone or email
  otpCode: string;
  purpose: 'owner_login' | 'client_tracking' | 'forgot_reference';
  bookingRef?: string;
  expiresAt: number;
  verified: boolean;
  createdAt: string;
}
