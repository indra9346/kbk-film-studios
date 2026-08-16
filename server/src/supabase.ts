import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Owner, PublicWork, StudioCMSData, Testimonial, BookingRequest, ServiceProject, Client } from './types.js';

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

// Map Supabase client rows to Client objects
export const mapSupabaseClients = (rows: any[] = []): Client[] =>
  rows.map((row) => ({
    id: row.id,
    fullName: row.full_name ?? row.fullName ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    city: row.city ?? 'Not specified',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

// Map Supabase booking_requests rows
export const mapSupabaseBookings = (rows: any[] = []): BookingRequest[] =>
  rows.map((row) => ({
    id: row.id,
    bookingRef: row.booking_ref ?? row.bookingRef ?? '',
    clientId: row.client_id ?? row.clientId ?? '',
    clientName: row.client_name ?? row.clientName ?? '',
    clientPhone: row.client_phone ?? row.clientPhone ?? '',
    clientEmail: row.client_email ?? row.clientEmail ?? '',
    clientCity: row.client_city ?? row.clientCity ?? '',
    serviceId: row.service_id ?? row.serviceId ?? '',
    serviceTitle: row.service_title ?? row.serviceTitle ?? '',
    eventDate: row.event_date ?? row.eventDate ?? '',
    preferredDeliveryDate: row.preferred_delivery_date ?? row.preferredDeliveryDate ?? '',
    budgetRange: row.budget_range ?? row.budgetRange ?? '',
    footageDetails: row.footage_details ?? row.footageDetails ?? '',
    referenceLinks: row.reference_links ?? row.referenceLinks ?? '',
    customNotes: row.custom_notes ?? row.customNotes ?? '',
    agreedTerms: toBoolean(row.agreed_terms ?? row.agreedTerms, true),
    priceSnapshot: (typeof row.price_snapshot === 'object' && row.price_snapshot !== null)
      ? row.price_snapshot
      : (row.priceSnapshot ?? {}),
    quotedAmount: Number(row.quoted_amount ?? row.quotedAmount ?? 0),
    finalAmount: row.final_amount != null ? Number(row.final_amount) : (row.finalAmount != null ? Number(row.finalAmount) : undefined),
    status: row.status ?? 'pending',
    rejectionReason: row.rejection_reason ?? row.rejectionReason,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

// Map Supabase service_projects rows
export const mapSupabaseProjects = (rows: any[] = []): ServiceProject[] =>
  rows.map((row) => ({
    id: row.id,
    bookingId: row.booking_id ?? row.bookingId ?? '',
    bookingRef: row.booking_ref ?? row.bookingRef ?? '',
    clientId: row.client_id ?? row.clientId ?? '',
    clientName: row.client_name ?? row.clientName ?? '',
    clientPhone: row.client_phone ?? row.clientPhone ?? '',
    clientEmail: row.client_email ?? row.clientEmail ?? '',
    serviceId: row.service_id ?? row.serviceId ?? '',
    serviceTitle: row.service_title ?? row.serviceTitle ?? '',
    trackingToken: row.tracking_token ?? row.trackingToken ?? '',
    currentStage: row.current_stage ?? row.currentStage ?? 'booking_requested',
    stageProgressPercent: Number(row.stage_progress_percent ?? row.stageProgressPercent ?? 0),
    startDate: row.start_date ?? row.startDate ?? '',
    estimatedDeliveryDate: row.estimated_delivery_date ?? row.estimatedDeliveryDate ?? '',
    actualDeliveryDate: row.actual_delivery_date ?? row.actualDeliveryDate,
    statusHistory: Array.isArray(row.status_history) ? row.status_history : (Array.isArray(row.statusHistory) ? row.statusHistory : []),
    internalNotes: row.internal_notes ?? row.internalNotes ?? '',
    clientMessages: Array.isArray(row.client_messages) ? row.client_messages : (Array.isArray(row.clientMessages) ? row.clientMessages : []),
    deliveries: Array.isArray(row.deliveries) ? row.deliveries : [],
    testimonialId: row.testimonial_id ?? row.testimonialId,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
  }));

// Map client_video_deliveries rows
export interface ClientVideoDelivery {
  id: string;
  bookingRef: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  title: string;
  description: string;
  videoUrl: string;
  videoSourceType: string;
  thumbnailUrl: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  fileCategory: string;
  downloadToken: string;
  expiryDate?: string;
  downloadCount: number;
  maxDownloads: number;
  isStreamable: boolean;
  isActive: boolean;
  ownerNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const mapSupabaseClientVideoDeliveries = (rows: any[] = []): ClientVideoDelivery[] =>
  rows.map((row) => ({
    id: row.id,
    bookingRef: row.booking_ref ?? row.bookingRef ?? '',
    clientId: row.client_id ?? row.clientId ?? '',
    clientName: row.client_name ?? row.clientName ?? '',
    projectId: row.project_id ?? row.projectId,
    title: row.title ?? '',
    description: row.description ?? '',
    videoUrl: row.video_url ?? row.videoUrl ?? '',
    videoSourceType: row.video_source_type ?? row.videoSourceType ?? 'google_drive',
    thumbnailUrl: row.thumbnail_url ?? row.thumbnailUrl ?? '/assets/kbk-logo.jpg',
    fileName: row.file_name ?? row.fileName ?? '',
    fileSizeBytes: Number(row.file_size_bytes ?? row.fileSizeBytes ?? 0),
    fileSizeFormatted: row.file_size_formatted ?? row.fileSizeFormatted ?? '',
    mimeType: row.mime_type ?? row.mimeType ?? 'video/mp4',
    fileCategory: row.file_category ?? row.fileCategory ?? 'master_video',
    downloadToken: row.download_token ?? row.downloadToken ?? '',
    expiryDate: row.expiry_date ?? row.expiryDate,
    downloadCount: Number(row.download_count ?? row.downloadCount ?? 0),
    maxDownloads: Number(row.max_downloads ?? row.maxDownloads ?? 50),
    isStreamable: toBoolean(row.is_streamable ?? row.isStreamable, true),
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    ownerNotes: row.owner_notes ?? row.ownerNotes ?? '',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
  }));

export async function hydrateSupabaseData() {
  if (!supabase) return null;

  const [ownersRes, worksRes, testimonialsRes, cmsRes, clientVideoDeliveriesRes] = await Promise.all([
    supabase.from('owners').select('*').order('created_at', { ascending: false }),
    supabase.from('public_works').select('*').eq('is_published', true).order('sort_order', { ascending: true }),
    supabase.from('testimonials').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    supabase.from('studio_cms').select('*').limit(1).maybeSingle(),
    supabase.from('client_video_deliveries').select('*').eq('is_active', true).order('created_at', { ascending: false }),
  ]);

  return {
    owners: mapSupabaseOwners(ownersRes.data ?? []),
    works: mapSupabaseWorks(worksRes.data ?? []),
    testimonials: mapSupabaseTestimonials(testimonialsRes.data ?? []),
    studioCMS: cmsRes.data ? mapSupabaseCms(cmsRes.data) : null,
    clientVideoDeliveries: mapSupabaseClientVideoDeliveries(clientVideoDeliveriesRes.data ?? []),
  };
}

// Fetch client video deliveries (owner endpoint - all)
export async function fetchClientVideoDeliveries(): Promise<ClientVideoDelivery[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('client_video_deliveries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Supabase] fetchClientVideoDeliveries error:', error);
    return [];
  }
  return mapSupabaseClientVideoDeliveries(data ?? []);
}

// Fetch client video deliveries for a specific booking ref
export async function fetchClientVideoDeliveriesByBookingRef(bookingRef: string): Promise<ClientVideoDelivery[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('client_video_deliveries')
    .select('*')
    .eq('booking_ref', bookingRef)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Supabase] fetchClientVideoDeliveriesByBookingRef error:', error);
    return [];
  }
  return mapSupabaseClientVideoDeliveries(data ?? []);
}

// Upsert a client video delivery
export async function upsertClientVideoDelivery(delivery: ClientVideoDelivery): Promise<ClientVideoDelivery | null> {
  if (!supabase) return null;
  const row = {
    id: delivery.id,
    booking_ref: delivery.bookingRef,
    client_id: delivery.clientId,
    client_name: delivery.clientName,
    project_id: delivery.projectId ?? null,
    title: delivery.title,
    description: delivery.description,
    video_url: delivery.videoUrl,
    video_source_type: delivery.videoSourceType,
    thumbnail_url: delivery.thumbnailUrl,
    file_name: delivery.fileName,
    file_size_bytes: delivery.fileSizeBytes,
    file_size_formatted: delivery.fileSizeFormatted,
    mime_type: delivery.mimeType,
    file_category: delivery.fileCategory,
    download_token: delivery.downloadToken,
    expiry_date: delivery.expiryDate ?? null,
    download_count: delivery.downloadCount,
    max_downloads: delivery.maxDownloads,
    is_streamable: delivery.isStreamable,
    is_active: delivery.isActive,
    owner_notes: delivery.ownerNotes,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('client_video_deliveries')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('[Supabase] upsertClientVideoDelivery error:', error);
    return null;
  }
  return mapSupabaseClientVideoDeliveries([data])[0] ?? null;
}

// Delete a client video delivery
export async function deleteClientVideoDelivery(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('client_video_deliveries')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('[Supabase] deleteClientVideoDelivery error:', error);
    return false;
  }
  return true;
}

export async function persistSupabaseData(data: {
  owners?: Owner[];
  works?: PublicWork[];
  testimonials?: Testimonial[];
  studioCMS?: StudioCMSData;
  bookingRequests?: BookingRequest[];
  serviceProjects?: ServiceProject[];
  clients?: Client[];
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

  if (data.bookingRequests) {
    const bookingRows = data.bookingRequests.map((b) => ({
      id: b.id,
      booking_ref: b.bookingRef,
      client_id: b.clientId,
      client_name: b.clientName,
      client_phone: b.clientPhone,
      client_email: b.clientEmail,
      client_city: b.clientCity,
      service_id: b.serviceId,
      service_title: b.serviceTitle,
      event_date: b.eventDate,
      preferred_delivery_date: b.preferredDeliveryDate,
      budget_range: b.budgetRange,
      footage_details: b.footageDetails,
      reference_links: b.referenceLinks,
      custom_notes: b.customNotes,
      agreed_terms: b.agreedTerms,
      price_snapshot: b.priceSnapshot,
      quoted_amount: b.quotedAmount,
      final_amount: b.finalAmount ?? null,
      status: b.status,
      rejection_reason: b.rejectionReason ?? null,
      created_at: b.createdAt,
    }));
    await supabase.from('booking_requests').upsert(bookingRows, { onConflict: 'id' });
  }

  if (data.serviceProjects) {
    const projectRows = data.serviceProjects.map((p) => ({
      id: p.id,
      booking_id: p.bookingId,
      booking_ref: p.bookingRef,
      client_id: p.clientId,
      client_name: p.clientName,
      client_phone: p.clientPhone,
      client_email: p.clientEmail,
      service_id: p.serviceId,
      service_title: p.serviceTitle,
      tracking_token: p.trackingToken,
      current_stage: p.currentStage,
      stage_progress_percent: p.stageProgressPercent,
      start_date: p.startDate,
      estimated_delivery_date: p.estimatedDeliveryDate,
      actual_delivery_date: p.actualDeliveryDate ?? null,
      status_history: p.statusHistory,
      internal_notes: p.internalNotes,
      client_messages: p.clientMessages,
      deliveries: p.deliveries,
      testimonial_id: p.testimonialId ?? null,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));
    await supabase.from('service_projects').upsert(projectRows, { onConflict: 'id' });
  }

  if (data.clients) {
    const clientRows = data.clients.map((c) => ({
      id: c.id,
      full_name: c.fullName,
      phone: c.phone,
      email: c.email,
      city: c.city,
      created_at: c.createdAt,
    }));
    await supabase.from('clients').upsert(clientRows, { onConflict: 'id' });
  }
}
