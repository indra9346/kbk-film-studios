import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PublicWork, Testimonial, ServiceItem, StudioCMSData } from '../types';

export const SUPABASE_DEFAULT_URL = 'https://hhqadycmsxsedlvdfcnn.supabase.co';

export const isValidUUID = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getSupabaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kbk_supabase_url');
    if (saved) return saved;
  }
  return (import.meta as any).env?.VITE_SUPABASE_URL || SUPABASE_DEFAULT_URL;
};

export const getSupabaseAnonKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kbk_supabase_anon_key');
    if (saved) return saved;
  }
  return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
};

export const setSupabaseCredentials = (url?: string, anonKey?: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('kbk_supabase_url', url);
    if (anonKey) localStorage.setItem('kbk_supabase_anon_key', anonKey);
    supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey() || 'anon-placeholder', {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } }
    });
  }
};

export const initSupabaseFromRemote = async (): Promise<boolean> => {
  try {
    if (!getSupabaseAnonKey()) {
      const res = await fetch('/api/public/supabase-config');
      if (res.ok) {
        const data = await res.json();
        if (data?.supabaseAnonKey && data.supabaseAnonKey.length > 20) {
          setSupabaseCredentials(data.supabaseUrl || SUPABASE_DEFAULT_URL, data.supabaseAnonKey);
          return true;
        }
      }
    }
  } catch (e) {
    console.warn('[SupabaseClient] Remote config load note:', e);
  }
  return isSupabaseConfigured();
};

// Auto-run on module load in browser
if (typeof window !== 'undefined') {
  initSupabaseFromRemote();
}

export let supabase: SupabaseClient = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey() || 'anon-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export const isSupabaseConfigured = () => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key !== 'anon-placeholder' && key.length > 20);
};

// ----------------------------------------------------
// TYPED MAPPERS: SUPABASE ROW <-> CLIENT DOMAIN
// ----------------------------------------------------

export const mapWorkFromRow = (r: any): PublicWork => ({
  id: String(r.id),
  title: r.title || 'Untitled Film',
  category: r.category || 'Wedding Highlights',
  eventLocation: r.event_location || r.eventLocation || 'Hindupur, AP',
  eventYear: r.event_year || r.eventYear || '2026',
  thumbnailUrl: r.thumbnail_url || r.thumbnailUrl || '',
  videoUrl: r.video_url || r.videoUrl || '',
  videoSourceType: r.video_source_type || r.videoSourceType || 'google_drive',
  externalDestUrl: r.external_dest_url || r.externalDestUrl || '',
  description: r.description || '',
  softwareUsed: Array.isArray(r.software_used) ? r.software_used : ['Premiere Pro', 'DaVinci Resolve'],
  isFeatured: r.is_featured ?? r.isFeatured ?? true,
  isPublished: r.is_published ?? r.isPublished ?? true,
  sortOrder: Number(r.sort_order ?? r.sortOrder ?? 0),
  createdAt: r.created_at || r.createdAt || new Date().toISOString(),
});

export const mapWorkToRow = (w: Partial<PublicWork>) => ({
  id: w.id && isValidUUID(w.id) ? w.id : generateUUID(),
  title: w.title || 'Untitled Film',
  category: w.category || 'Wedding Highlights',
  event_location: w.eventLocation || 'Hindupur, AP',
  event_year: w.eventYear || '2026',
  thumbnail_url: w.thumbnailUrl || '',
  video_url: w.videoUrl || '',
  video_source_type: w.videoSourceType || (w.videoUrl?.includes('drive.google.com') ? 'google_drive' : 'direct_mp4'),
  external_dest_url: w.externalDestUrl || '',
  description: w.description || '',
  software_used: w.softwareUsed || ['Premiere Pro', 'DaVinci Resolve'],
  is_featured: w.isFeatured !== false,
  is_published: w.isPublished !== false,
  sort_order: w.sortOrder || 0,
  created_at: w.createdAt || new Date().toISOString(),
});

export const mapTestimonialFromRow = (r: any): Testimonial => ({
  id: String(r.id),
  clientName: r.client_name || r.clientName || 'Happy Client',
  serviceTitle: r.service_title || r.serviceTitle || 'Wedding Video Highlights',
  eventDate: r.event_date || r.eventDate || '2026',
  location: r.location || 'Hindupur, AP',
  rating: Number(r.rating || 5),
  reviewText: r.review_text || r.reviewText || '',
  videoUrl: r.video_url || r.videoUrl || '',
  thumbnailUrl: r.thumbnail_url || r.thumbnailUrl || '',
  isVerified: r.is_verified ?? r.isVerified ?? true,
  isPublished: r.is_published ?? r.isPublished ?? true,
  bookingRef: r.booking_ref || r.bookingRef || '',
  createdAt: r.created_at || r.createdAt || new Date().toISOString(),
});

export const mapTestimonialToRow = (t: Partial<Testimonial>) => ({
  id: t.id && isValidUUID(t.id) ? t.id : generateUUID(),
  client_name: t.clientName || 'Happy Client',
  service_title: t.serviceTitle || 'Wedding Video Highlights',
  event_date: t.eventDate || '2026',
  location: t.location || 'Hindupur, AP',
  rating: t.rating || 5,
  review_text: t.reviewText || '',
  video_url: t.videoUrl || '',
  thumbnail_url: t.thumbnailUrl || '',
  is_verified: t.isVerified !== false,
  is_published: t.isPublished !== false,
  booking_ref: t.bookingRef || '',
  created_at: t.createdAt || new Date().toISOString(),
});

export const mapServiceFromRow = (r: any): ServiceItem => ({
  id: String(r.id),
  slug: r.slug,
  title: r.title,
  tagline: r.tagline || '',
  shortDescription: r.short_description || r.shortDescription || '',
  detailedDescription: r.detailed_description || r.detailedDescription || '',
  priceType: r.price_type || r.priceType || 'starting_from',
  basePrice: Number(r.base_price ?? r.basePrice ?? 14999),
  currency: r.currency || 'INR',
  priceLabel: r.price_label || r.priceLabel || `Starting from ₹${Number(r.base_price || 14999).toLocaleString('en-IN')}`,
  inclusions: Array.isArray(r.inclusions) ? r.inclusions : [],
  exclusions: Array.isArray(r.exclusions) ? r.exclusions : [],
  turnaroundDays: Number(r.turnaround_days ?? r.turnaroundDays ?? 5),
  featured: Boolean(r.featured),
  isUpcoming: Boolean(r.is_upcoming ?? r.isUpcoming),
  isActive: r.is_active ?? r.isActive ?? true,
  sortOrder: Number(r.sort_order ?? r.sortOrder ?? 0),
  badge: r.badge || undefined,
});

export const mapCmsFromRow = (r: any): StudioCMSData => ({
  studioName: r.studio_name || r.studioName || 'KBK Film Studios',
  tagline: r.tagline || 'Luxury Wedding Video Editing & Master Film Post-Production',
  founderName: r.founder_name || r.founderName || 'Kurudi Bharath Kumar',
  founderTitle: r.founder_title || r.founderTitle || 'Lead Filmmaker & Senior Colorist',
  phone: r.phone || '+91 9346227894',
  whatsappNumber: r.whatsapp_number || r.whatsappNumber || '9346227894',
  email: r.email || 'kbkfilms.official@gmail.com',
  location: r.location || 'Hindupur, Andhra Pradesh, India',
  instagramHandle: r.instagram_handle || r.instagramHandle || '@kbkfilms.official',
  instagramUrl: r.instagram_url || r.instagramUrl || 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=f5nglc3',
  youtubeHandle: r.youtube_handle || r.youtubeHandle || '@bharathkumarglp2003',
  youtubeUrl: r.youtube_url || r.youtubeUrl || 'https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX',
  facebookHandle: r.facebook_handle || r.facebookHandle || 'Kurudi Bharath Kumar',
  facebookUrl: r.facebook_url || r.facebookUrl || 'https://facebook.com/KurudiBharathKumar',
  happyClientsCount: Number(r.happy_clients_count ?? r.happyClientsCount ?? 800),
  filmsDeliveredCount: Number(r.films_delivered_count ?? r.filmsDeliveredCount ?? 1200),
  yearsExperience: Number(r.years_experience ?? r.yearsExperience ?? 6),
  satisfactionRate: Number(r.satisfaction_rate ?? r.satisfactionRate ?? 99.4),
  founderBio: r.founder_bio || r.founderBio || 'Lead Filmmaker & Post-Production Colorist specializing in high-contrast cinematic wedding storytelling.',
  educationDetails: {
    degree: r.degree || r.educationDetails?.degree || 'B.Com (Computer Applications)',
    college: r.college || r.educationDetails?.college || 'Sri Krishnadevaraya University (SKU)',
    coreHighlights: Array.isArray(r.core_highlights)
      ? r.core_highlights
      : Array.isArray(r.educationDetails?.coreHighlights)
      ? r.educationDetails.coreHighlights
      : ['Software & DB Logic', 'Multimedia & Audio-Visual Systems', 'Business Logistics & Film Distribution'],
    currentPursuit: r.current_pursuit || r.educationDetails?.currentPursuit || 'MBA (2nd Year, Master of Business Administration)',
  },
  editingSuites: Array.isArray(r.editing_suites) ? r.editing_suites : ['DaVinci Resolve Studio', 'Adobe Premiere Pro', 'After Effects', 'FilmConvert Nitrate', 'Dehancer Pro'],
  heroVideoUrl: r.hero_video_url || r.heroVideoUrl || '/assets/hero-reel.mp4',
  heroSettledPosterUrl: r.hero_settled_poster_url || r.heroSettledPosterUrl || '/assets/kbk-logo.jpg',
  priceDisclaimer: r.price_disclaimer || r.priceDisclaimer || 'All prices are base estimates for standard multi-cam ceremonies.',
  termsAndConditions: Array.isArray(r.terms_and_conditions) ? r.terms_and_conditions : ['25% advance required to lock calendar slot.', 'Up to 3 complimentary revision rounds included.'],
  contactClarificationMsg: r.contact_clarification_msg || r.contactClarificationMsg || 'Studio Owner Kurudi Bharath Kumar directly oversees color grading and storyline sequencing for every client.',
});
