import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Owner, PublicWork, StudioCMSData, Testimonial } from './types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export const isSupabaseEnabled = () => !!supabase;

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return fallback;
};

const parsePermissions = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const mapSupabaseOwners = (rows: any[] = []): Owner[] =>
  rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    permissions: parsePermissions(row.permissions),
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

export const mapSupabaseWorks = (rows: any[] = []): PublicWork[] =>
  rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    eventLocation: row.event_location ?? row.eventLocation ?? 'Hindupur, AP',
    eventYear: row.event_year ?? row.eventYear ?? '2026',
    thumbnailUrl: row.thumbnail_url ?? row.thumbnailUrl ?? '/assets/kbk-logo.jpg',
    videoUrl: row.video_url ?? row.videoUrl ?? '/assets/hero-reel.mp4',
    videoSourceType: row.video_source_type ?? row.videoSourceType ?? 'direct_mp4',
    externalDestUrl: row.external_dest_url ?? row.externalDestUrl ?? '',
    description: row.description ?? '',
    softwareUsed: Array.isArray(row.software_used) ? row.software_used : (Array.isArray(row.softwareUsed) ? row.softwareUsed : ['Premiere Pro', 'DaVinci Resolve']),
    isFeatured: toBoolean(row.is_featured ?? row.isFeatured, false),
    isPublished: toBoolean(row.is_published ?? row.isPublished, true),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

export const mapSupabaseTestimonials = (rows: any[] = []): Testimonial[] =>
  rows.map((row) => ({
    id: row.id,
    clientName: row.client_name ?? row.clientName,
    serviceTitle: row.service_title ?? row.serviceTitle ?? 'Wedding Video Highlights',
    eventDate: row.event_date ?? row.eventDate ?? '2026',
    location: row.location ?? 'Hindupur, AP',
    rating: Number(row.rating ?? 5),
    reviewText: row.review_text ?? row.reviewText ?? '',
    videoUrl: row.video_url ?? row.videoUrl ?? '',
    thumbnailUrl: row.thumbnail_url ?? row.thumbnailUrl ?? '/assets/kbk-logo.jpg',
    isVerified: toBoolean(row.is_verified ?? row.isVerified, true),
    isPublished: toBoolean(row.is_published ?? row.isPublished, true),
    bookingRef: row.booking_ref ?? row.bookingRef,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

export const mapSupabaseCms = (row: any): StudioCMSData | null => {
  if (!row) return null;
  return {
    studioName: row.studio_name ?? row.studioName ?? 'KBK Film Studios',
    tagline: row.tagline ?? 'Luxury Wedding Video Editing & Master Film Post-Production',
    founderName: row.founder_name ?? row.founderName ?? 'Kurudi Bharath Kumar',
    founderTitle: row.founder_title ?? row.founderTitle ?? 'Lead Filmmaker & Senior Colorist',
    phone: row.phone ?? '+91 9346227894',
    whatsappNumber: row.whatsapp_number ?? row.whatsappNumber ?? '9346227894',
    email: row.email ?? 'kbkfilms.official@gmail.com',
    location: row.location ?? 'Hindupur, Andhra Pradesh, India',
    instagramHandle: row.instagram_handle ?? row.instagramHandle ?? '@kbkfilms.official',
    instagramUrl: row.instagram_url ?? row.instagramUrl ?? '',
    youtubeHandle: row.youtube_handle ?? row.youtubeHandle ?? '@bharathkumarglp2003',
    youtubeUrl: row.youtube_url ?? row.youtubeUrl ?? '',
    facebookHandle: row.facebook_handle ?? row.facebookHandle ?? 'Kurudi Bharath Kumar',
    facebookUrl: row.facebook_url ?? row.facebookUrl ?? '',
    happyClientsCount: Number(row.happy_clients_count ?? row.happyClientsCount ?? 800),
    filmsDeliveredCount: Number(row.films_delivered_count ?? row.filmsDeliveredCount ?? 1200),
    yearsExperience: Number(row.years_experience ?? row.yearsExperience ?? 6),
    satisfactionRate: Number(row.satisfaction_rate ?? row.satisfactionRate ?? 99.4),
    founderBio: row.founder_bio ?? row.founderBio ?? '',
    educationDetails: {
      degree: row.degree ?? row.education_degree ?? 'B.Com (Computer Applications)',
      college: row.college ?? row.education_college ?? 'Sri Krishnadevaraya University (SKU)',
      coreHighlights: Array.isArray(row.core_highlights) ? row.core_highlights : (Array.isArray(row.coreHighlights) ? row.coreHighlights : []),
      currentPursuit: row.current_pursuit ?? row.currentPursuit ?? 'MBA (2nd Year, Master of Business Administration)',
    },
    editingSuites: Array.isArray(row.editing_suites) ? row.editing_suites : (Array.isArray(row.editingSuites) ? row.editingSuites : []),
    heroVideoUrl: row.hero_video_url ?? row.heroVideoUrl ?? '/assets/hero-reel.mp4',
    heroSettledPosterUrl: row.hero_settled_poster_url ?? row.heroSettledPosterUrl ?? '/assets/kbk-logo.jpg',
    priceDisclaimer: row.price_disclaimer ?? row.priceDisclaimer ?? '',
    termsAndConditions: Array.isArray(row.terms_and_conditions) ? row.terms_and_conditions : (Array.isArray(row.termsAndConditions) ? row.termsAndConditions : []),
    contactClarificationMsg: row.contact_clarification_msg ?? row.contactClarificationMsg ?? '',
  };
};

export async function hydrateSupabaseData() {
  if (!supabase) return null;

  const [ownersRes, worksRes, testimonialsRes, cmsRes] = await Promise.all([
    supabase.from('owners').select('*').order('created_at', { ascending: false }),
    supabase.from('public_works').select('*').eq('is_published', true).order('sort_order', { ascending: true }),
    supabase.from('testimonials').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    supabase.from('studio_cms').select('*').limit(1).maybeSingle(),
  ]);

  return {
    owners: mapSupabaseOwners(ownersRes.data ?? []),
    works: mapSupabaseWorks(worksRes.data ?? []),
    testimonials: mapSupabaseTestimonials(testimonialsRes.data ?? []),
    studioCMS: cmsRes.data ? mapSupabaseCms(cmsRes.data) : null,
  };
}

export async function persistSupabaseData(data: {
  owners?: Owner[];
  works?: PublicWork[];
  testimonials?: Testimonial[];
  studioCMS?: StudioCMSData;
}) {
  if (!supabase) return;

  if (data.owners) {
    const ownersRows = data.owners.map((owner) => ({
      id: owner.id,
      name: owner.name,
      phone: owner.phone,
      email: owner.email,
      role: owner.role,
      permissions: owner.permissions,
      is_active: owner.isActive,
      created_at: owner.createdAt,
    }));
    await supabase.from('owners').upsert(ownersRows, { onConflict: 'id' });
  }

  if (data.works) {
    const worksRows = data.works.map((work) => ({
      id: work.id,
      title: work.title,
      category: work.category,
      event_location: work.eventLocation,
      event_year: work.eventYear,
      thumbnail_url: work.thumbnailUrl,
      video_url: work.videoUrl,
      video_source_type: work.videoSourceType,
      external_dest_url: work.externalDestUrl ?? '',
      description: work.description,
      software_used: work.softwareUsed,
      is_featured: work.isFeatured,
      is_published: work.isPublished,
      sort_order: work.sortOrder,
      created_at: work.createdAt,
    }));
    await supabase.from('public_works').upsert(worksRows, { onConflict: 'id' });
  }

  if (data.testimonials) {
    const testimonialRows = data.testimonials.map((item) => ({
      id: item.id,
      client_name: item.clientName,
      service_title: item.serviceTitle,
      event_date: item.eventDate,
      location: item.location,
      rating: item.rating,
      review_text: item.reviewText,
      video_url: item.videoUrl ?? '',
      thumbnail_url: item.thumbnailUrl ?? '/assets/kbk-logo.jpg',
      is_verified: item.isVerified,
      is_published: item.isPublished,
      booking_ref: item.bookingRef ?? null,
      created_at: item.createdAt,
    }));
    await supabase.from('testimonials').upsert(testimonialRows, { onConflict: 'id' });
  }

  if (data.studioCMS) {
    const cmsRow = {
      studio_name: data.studioCMS.studioName,
      tagline: data.studioCMS.tagline,
      founder_name: data.studioCMS.founderName,
      founder_title: data.studioCMS.founderTitle,
      phone: data.studioCMS.phone,
      whatsapp_number: data.studioCMS.whatsappNumber,
      email: data.studioCMS.email,
      location: data.studioCMS.location,
      instagram_handle: data.studioCMS.instagramHandle,
      instagram_url: data.studioCMS.instagramUrl,
      youtube_handle: data.studioCMS.youtubeHandle,
      youtube_url: data.studioCMS.youtubeUrl,
      facebook_handle: data.studioCMS.facebookHandle,
      facebook_url: data.studioCMS.facebookUrl,
      happy_clients_count: data.studioCMS.happyClientsCount,
      films_delivered_count: data.studioCMS.filmsDeliveredCount,
      years_experience: data.studioCMS.yearsExperience,
      satisfaction_rate: data.studioCMS.satisfactionRate,
      founder_bio: data.studioCMS.founderBio,
      degree: data.studioCMS.educationDetails.degree,
      college: data.studioCMS.educationDetails.college,
      core_highlights: data.studioCMS.educationDetails.coreHighlights,
      current_pursuit: data.studioCMS.educationDetails.currentPursuit,
      editing_suites: data.studioCMS.editingSuites,
      hero_video_url: data.studioCMS.heroVideoUrl,
      hero_settled_poster_url: data.studioCMS.heroSettledPosterUrl,
      price_disclaimer: data.studioCMS.priceDisclaimer,
      terms_and_conditions: data.studioCMS.termsAndConditions,
      contact_clarification_msg: data.studioCMS.contactClarificationMsg,
    };
    await supabase.from('studio_cms').upsert(cmsRow, { onConflict: 'id' });
  }
}
