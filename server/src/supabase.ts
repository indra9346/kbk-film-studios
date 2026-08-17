import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Owner,
  PublicWork,
  Testimonial,
  StudioCMSData,
  BookingRequest,
  ServiceProject,
  Client,
  ServiceItem,
} from './types.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hhqadycmsxsedlvdfcnn.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

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

const parseJson = (value: unknown, fallback: any = []): any => {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const mapSupabaseOwners = (rows: any[] = []): Owner[] =>
  rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    permissions: parseJson(row.permissions, []),
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

export const mapSupabaseServices = (rows: any[] = []): ServiceItem[] =>
  rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? '',
    shortDescription: row.short_description ?? row.shortDescription ?? '',
    detailedDescription: row.detailed_description ?? row.detailedDescription ?? '',
    priceType: row.price_type ?? row.priceType ?? 'starting_from',
    basePrice: Number(row.base_price ?? row.basePrice ?? 0),
    currency: row.currency ?? 'INR',
    priceLabel: row.price_label ?? row.priceLabel ?? `₹${row.base_price}`,
    inclusions: parseJson(row.inclusions, []),
    exclusions: parseJson(row.exclusions, []),
    turnaroundDays: Number(row.turnaround_days ?? row.turnaroundDays ?? 5),
    featured: toBoolean(row.featured, false),
    isUpcoming: toBoolean(row.is_upcoming ?? row.isUpcoming, false),
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    badge: row.badge ?? undefined,
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
    softwareUsed: parseJson(row.software_used ?? row.softwareUsed, ['Premiere Pro', 'DaVinci Resolve']),
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
      coreHighlights: parseJson(row.core_highlights ?? row.coreHighlights, []),
      currentPursuit: row.current_pursuit ?? row.currentPursuit ?? 'MBA (2nd Year, Master of Business Administration)',
    },
    editingSuites: parseJson(row.editing_suites ?? row.editingSuites, []),
    heroVideoUrl: row.hero_video_url ?? row.heroVideoUrl ?? '/assets/hero-reel.mp4',
    heroSettledPosterUrl: row.hero_settled_poster_url ?? row.heroSettledPosterUrl ?? '/assets/kbk-logo.jpg',
    priceDisclaimer: row.price_disclaimer ?? row.priceDisclaimer ?? '',
    termsAndConditions: parseJson(row.terms_and_conditions ?? row.termsAndConditions, []),
    contactClarificationMsg: row.contact_clarification_msg ?? row.contactClarificationMsg ?? '',
  };
};

export const mapSupabaseClients = (rows: any[] = []): Client[] =>
  rows.map((row) => ({
    id: row.id,
    fullName: row.full_name ?? row.fullName ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    city: row.city ?? 'Hindupur, AP',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

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
    priceSnapshot: parseJson(row.price_snapshot ?? row.priceSnapshot, {}),
    quotedAmount: Number(row.quoted_amount ?? row.quotedAmount ?? 0),
    finalAmount: row.final_amount != null ? Number(row.final_amount) : (row.finalAmount != null ? Number(row.finalAmount) : undefined),
    status: row.status ?? 'pending',
    rejectionReason: row.rejection_reason ?? row.rejectionReason,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));

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
    statusHistory: parseJson(row.status_history ?? row.statusHistory, []),
    internalNotes: row.internal_notes ?? row.internalNotes ?? '',
    clientMessages: parseJson(row.client_messages ?? row.clientMessages, []),
    deliveries: parseJson(row.deliveries, []),
    testimonialId: row.testimonial_id ?? row.testimonialId,
    isOverdue: toBoolean(row.is_overdue ?? row.isOverdue, false),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
  }));

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
  storagePath?: string;
  streamUrl?: string;
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
    videoSourceType: row.video_source_type ?? row.videoSourceType ?? 'direct_mp4',
    thumbnailUrl: row.thumbnail_url ?? row.thumbnailUrl ?? '/assets/kbk-logo.jpg',
    fileName: row.file_name ?? row.fileName ?? '',
    fileSizeBytes: Number(row.file_size_bytes ?? row.fileSizeBytes ?? 0),
    fileSizeFormatted: row.file_size_formatted ?? row.fileSizeFormatted ?? '0 MB',
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

// Hydrate full data snapshot from Supabase PostgreSQL tables
export async function hydrateSupabaseData() {
  if (!supabase) return null;

  try {
    const [ownersRes, servicesRes, worksRes, testimonialsRes, cmsRes, bookingsRes, projectsRes, deliveriesRes, clientsRes] = await Promise.all([
      supabase.from('owners').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('sort_order', { ascending: true }),
      supabase.from('public_works').select('*').order('sort_order', { ascending: true }),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('studio_cms').select('*').limit(1).maybeSingle(),
      supabase.from('booking_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('service_projects').select('*').order('created_at', { ascending: false }),
      supabase.from('client_video_deliveries').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
    ]);

    return {
      owners: mapSupabaseOwners(ownersRes.data ?? []),
      services: mapSupabaseServices(servicesRes.data ?? []),
      works: mapSupabaseWorks(worksRes.data ?? []),
      testimonials: mapSupabaseTestimonials(testimonialsRes.data ?? []),
      studioCMS: cmsRes.data ? mapSupabaseCms(cmsRes.data) : null,
      bookingRequests: mapSupabaseBookings(bookingsRes.data ?? []),
      serviceProjects: mapSupabaseProjects(projectsRes.data ?? []),
      clientVideoDeliveries: mapSupabaseClientVideoDeliveries(deliveriesRes.data ?? []),
      clients: mapSupabaseClients(clientsRes.data ?? []),
    };
  } catch (err) {
    console.error('[Supabase] Hydration warning:', err);
    return null;
  }
}

export const isValidUUID = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

// Atomic Supabase Write Operations
export async function upsertWorkSupabase(work: PublicWork): Promise<void> {
  if (!supabase) return;
  const validId = work.id && isValidUUID(work.id) ? work.id : crypto.randomUUID();
  await supabase.from('public_works').upsert({
    id: validId,
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
  }, { onConflict: 'id' });
}

export async function deleteWorkSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('public_works').delete().eq('id', id);
}

export async function upsertServiceSupabase(service: ServiceItem): Promise<void> {
  if (!supabase) return;
  await supabase.from('services').upsert({
    id: service.id,
    slug: service.slug,
    title: service.title,
    tagline: service.tagline,
    short_description: service.shortDescription,
    detailed_description: service.detailedDescription,
    price_type: service.priceType,
    base_price: service.basePrice,
    currency: service.currency,
    price_label: service.priceLabel,
    inclusions: service.inclusions,
    exclusions: service.exclusions,
    turnaround_days: service.turnaroundDays,
    featured: service.featured,
    is_upcoming: service.isUpcoming,
    is_active: service.isActive,
    sort_order: service.sortOrder,
    badge: service.badge ?? null,
  }, { onConflict: 'id' });
}

export async function deleteServiceSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('services').delete().eq('id', id);
}

export async function upsertTestimonialSupabase(item: Testimonial): Promise<void> {
  if (!supabase) return;
  const validId = item.id && isValidUUID(item.id) ? item.id : crypto.randomUUID();
  await supabase.from('testimonials').upsert({
    id: validId,
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
  }, { onConflict: 'id' });
}

export async function deleteTestimonialSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('testimonials').delete().eq('id', id);
}

export async function upsertBookingSupabase(b: BookingRequest): Promise<void> {
  if (!supabase) return;
  await supabase.from('booking_requests').upsert({
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
  }, { onConflict: 'id' });
}

export async function deleteBookingSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('booking_requests').delete().or(`id.eq.${id},booking_ref.eq.${id}`);
}

export async function upsertProjectSupabase(p: ServiceProject): Promise<void> {
  if (!supabase) return;
  await supabase.from('service_projects').upsert({
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
    is_overdue: p.isOverdue ?? false,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }, { onConflict: 'id' });
}

export async function deleteProjectSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('service_projects').delete().or(`id.eq.${id},booking_ref.eq.${id}`);
}

export async function updateCmsSupabase(cms: StudioCMSData): Promise<void> {
  if (!supabase) return;
  const row = {
    studio_name: cms.studioName,
    tagline: cms.tagline,
    founder_name: cms.founderName,
    founder_title: cms.founderTitle,
    phone: cms.phone,
    whatsapp_number: cms.whatsappNumber,
    email: cms.email,
    location: cms.location,
    instagram_handle: cms.instagramHandle,
    instagram_url: cms.instagramUrl,
    youtube_handle: cms.youtubeHandle,
    youtube_url: cms.youtubeUrl,
    facebook_handle: cms.facebookHandle,
    facebook_url: cms.facebookUrl,
    happy_clients_count: cms.happyClientsCount,
    films_delivered_count: cms.filmsDeliveredCount,
    years_experience: cms.yearsExperience,
    satisfaction_rate: cms.satisfactionRate,
    founder_bio: cms.founderBio,
    degree: cms.educationDetails?.degree,
    college: cms.educationDetails?.college,
    core_highlights: cms.educationDetails?.coreHighlights,
    current_pursuit: cms.educationDetails?.currentPursuit,
    editing_suites: cms.editingSuites,
    hero_video_url: cms.heroVideoUrl,
    hero_settled_poster_url: cms.heroSettledPosterUrl,
    price_disclaimer: cms.priceDisclaimer,
    terms_and_conditions: cms.termsAndConditions,
    contact_clarification_msg: cms.contactClarificationMsg,
    updated_at: new Date().toISOString(),
  };
  await supabase.from('studio_cms').upsert(row);
}

export async function upsertClientVideoDeliverySupabase(d: ClientVideoDelivery): Promise<void> {
  if (!supabase) return;
  await supabase.from('client_video_deliveries').upsert({
    id: d.id,
    booking_ref: d.bookingRef,
    client_id: d.clientId,
    client_name: d.clientName,
    project_id: d.projectId ?? null,
    title: d.title,
    description: d.description,
    video_url: d.videoUrl,
    video_source_type: d.videoSourceType,
    thumbnail_url: d.thumbnailUrl,
    file_name: d.fileName,
    file_size_bytes: d.fileSizeBytes,
    file_size_formatted: d.fileSizeFormatted,
    mime_type: d.mimeType,
    file_category: d.fileCategory,
    download_token: d.downloadToken,
    expiry_date: d.expiryDate ?? null,
    download_count: d.downloadCount,
    max_downloads: d.maxDownloads,
    is_streamable: d.isStreamable,
    is_active: d.isActive,
    owner_notes: d.ownerNotes,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
}

export async function deleteClientVideoDeliverySupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('client_video_deliveries').delete().eq('id', id);
}

export async function upsertOwnerSupabase(owner: Owner): Promise<void> {
  if (!supabase) return;
  await supabase.from('owners').upsert({
    id: owner.id,
    name: owner.name,
    phone: owner.phone,
    email: owner.email,
    role: owner.role,
    permissions: owner.permissions,
    is_active: owner.isActive,
    created_at: owner.createdAt,
  }, { onConflict: 'id' });
}

export async function deleteOwnerSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('owners').delete().eq('id', id);
}
