import { db } from '../db.js';
import { isSupabaseEnabled, supabase } from '../supabase.js';
import type { BookingRequest, Client, ClientVideoDelivery, ServiceProject, Testimonial } from '../types.js';
import { ALLOWED_PROJECT_TRANSITIONS, PROJECT_STATUS_ALIASES, STAGE_LABELS } from './types.js';
import { normalizeProjectStage, projectIsOverdue } from './triggers.js';

const setProjectTouch = (project: ServiceProject) => {
  project.updatedAt = new Date().toISOString();
  return project;
};

export const createAuditLog = async (dbInstance: any, input: {
  actorRole: string;
  actorName: string;
  actorIdentifier: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
}) => {
  const log = dbInstance.addAuditLog({
    actorRole: input.actorRole,
    actorName: input.actorName,
    actorIdentifier: input.actorIdentifier,
    action: input.action,
    details: input.details,
    metadata: input.metadata || {},
  } as any);

  if (isSupabaseEnabled() && supabase) {
    try {
      await supabase.from('audit_logs').upsert({
        id: log.id,
        actor_role: log.actorRole,
        actor_name: log.actorName,
        actor_identifier: log.actorIdentifier,
        action: log.action,
        details: log.details,
        metadata: log.metadata || {},
        timestamp: log.timestamp,
      }, { onConflict: 'id' });
    } catch (error) {
      console.warn('[Automation] audit_logs sync skipped:', error);
    }
  }

  return log;
};

export const createClient = async (dbInstance: any, booking: BookingRequest): Promise<Client> => {
  const existingClient = dbInstance.getClients().find((client: Client) =>
    (booking.clientPhone && client.phone === booking.clientPhone) ||
    (booking.clientEmail && client.email && client.email.toLowerCase() === booking.clientEmail.toLowerCase())
  );

  if (existingClient) return existingClient;

  const client: Client = {
    id: booking.clientId || `client-${Date.now()}`,
    fullName: booking.clientName,
    phone: booking.clientPhone,
    email: booking.clientEmail || '',
    city: booking.clientCity || 'Hindupur, AP',
    createdAt: new Date().toISOString(),
  };

  dbInstance.getClients().unshift(client);

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('clients').upsert({
      id: client.id,
      full_name: client.fullName,
      phone: client.phone,
      email: client.email,
      city: client.city,
      created_at: client.createdAt,
    }, { onConflict: 'id' });
  }

  return client;
};

export const createProject = async (dbInstance: any, booking: BookingRequest, client: Client): Promise<ServiceProject> => {
  const existingProject = dbInstance.getServiceProjects().find((project: ServiceProject) =>
    project.bookingRef === booking.bookingRef || project.bookingId === booking.id
  );

  if (existingProject) return existingProject;

  const project: ServiceProject = {
    id: `proj-${booking.bookingRef.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    bookingId: booking.id,
    bookingRef: booking.bookingRef,
    clientId: client.id,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    clientEmail: booking.clientEmail || '',
    serviceId: booking.serviceId,
    serviceTitle: booking.serviceTitle,
    trackingToken: `TRK-${booking.bookingRef}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    currentStage: 'booking_requested',
    stageProgressPercent: 10,
    startDate: new Date().toISOString().split('T')[0],
    estimatedDeliveryDate: booking.preferredDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statusHistory: [{
      id: `stat-${Date.now()}`,
      stage: 'booking_requested',
      stageLabel: STAGE_LABELS.booking_requested,
      message: `Booking received for ${booking.serviceTitle}. Project created automatically.`,
      updatedBy: 'Automation Engine',
      timestamp: new Date().toISOString(),
    }],
    internalNotes: `Automation created from booking ${booking.bookingRef}.`,
    clientMessages: [{
      id: `msg-${Date.now()}`,
      sender: 'owner',
      senderName: 'Kurudi Bharath Kumar',
      text: `Your booking ${booking.bookingRef} for ${booking.serviceTitle} has been confirmed and is now active in the studio workflow.`,
      timestamp: new Date().toISOString(),
    }],
    deliveries: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbInstance.getServiceProjects().unshift(project);

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('service_projects').upsert({
      id: project.id,
      booking_id: project.bookingId,
      booking_ref: project.bookingRef,
      client_id: project.clientId,
      client_name: project.clientName,
      client_phone: project.clientPhone,
      client_email: project.clientEmail,
      service_id: project.serviceId,
      service_title: project.serviceTitle,
      tracking_token: project.trackingToken,
      current_stage: project.currentStage,
      stage_progress_percent: project.stageProgressPercent,
      start_date: project.startDate,
      estimated_delivery_date: project.estimatedDeliveryDate,
      status_history: project.statusHistory,
      internal_notes: project.internalNotes,
      client_messages: project.clientMessages,
      deliveries: project.deliveries,
      testimonial_id: project.testimonialId || null,
      is_overdue: Boolean(project.isOverdue),
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    }, { onConflict: 'id' });
  }

  return project;
};

export const updateProjectStatus = async (dbInstance: any, project: ServiceProject, nextStage: string, updatedBy: string, customMessage?: string) => {
  const normalizedStage = normalizeProjectStage(nextStage);
  const currentStage = project.currentStage;
  const allowed = ALLOWED_PROJECT_TRANSITIONS[currentStage] || [];

  if (allowed.length > 0 && !allowed.includes(normalizedStage)) {
    throw new Error(`Invalid workflow transition: ${currentStage} -> ${normalizedStage}`);
  }

  project.currentStage = normalizedStage as any;
  project.stageProgressPercent = {
    booking_requested: 10,
    booking_accepted: 20,
    footage_received: 35,
    rough_cut_assembly: 50,
    color_grading_audio: 70,
    client_review_revision: 85,
    client_approved: 95,
    files_delivered: 100,
    service_completed: 100,
    rejected: 0,
  }[normalizedStage] ?? project.stageProgressPercent;

  if (normalizedStage === 'files_delivered' || normalizedStage === 'service_completed') {
    project.actualDeliveryDate = new Date().toISOString().split('T')[0];
  }

  project.statusHistory.push({
    id: `stat-${Date.now()}`,
    stage: normalizedStage as any,
    stageLabel: STAGE_LABELS[normalizedStage] || normalizedStage,
    message: customMessage || `Project advanced to ${STAGE_LABELS[normalizedStage] || normalizedStage} by ${updatedBy}`,
    updatedBy,
    timestamp: new Date().toISOString(),
  });

  setProjectTouch(project);

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('service_projects').update({
      current_stage: project.currentStage,
      stage_progress_percent: project.stageProgressPercent,
      actual_delivery_date: project.actualDeliveryDate || null,
      status_history: project.statusHistory,
      updated_at: project.updatedAt,
      is_overdue: Boolean(project.isOverdue),
    }).eq('id', project.id);
  }

  return project;
};

export const createVideoDelivery = async (dbInstance: any, delivery: Partial<ClientVideoDelivery> & { bookingRef: string; title: string; videoUrl: string; }): Promise<ClientVideoDelivery> => {
  const project = dbInstance.getServiceProjects().find((item: ServiceProject) =>
    item.bookingRef === delivery.bookingRef || item.id === delivery.projectId
  );

  if (!project) {
    throw new Error(`Project for booking ${delivery.bookingRef} not found`);
  }

  const existing = dbInstance.getClientVideoDeliveries().find((entry: ClientVideoDelivery) =>
    entry.bookingRef === delivery.bookingRef && entry.title === delivery.title && entry.videoUrl === delivery.videoUrl
  );

  if (existing) return existing;

  const record: ClientVideoDelivery = {
    id: delivery.id || `cvd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    bookingRef: delivery.bookingRef,
    clientId: delivery.clientId || project.clientId,
    clientName: delivery.clientName || project.clientName,
    projectId: delivery.projectId || project.id,
    title: delivery.title,
    description: delivery.description || `Private delivery for ${project.serviceTitle}`,
    videoUrl: delivery.videoUrl,
    videoSourceType: delivery.videoSourceType || (delivery.videoUrl?.includes('drive.google.com') ? 'google_drive' : 'direct_mp4'),
    thumbnailUrl: delivery.thumbnailUrl || '/assets/kbk-logo.jpg',
    fileName: delivery.fileName || `${delivery.bookingRef}_video.mp4`,
    fileSizeBytes: delivery.fileSizeBytes || 0,
    fileSizeFormatted: delivery.fileSizeFormatted || 'Unknown size',
    mimeType: delivery.mimeType || 'video/mp4',
    fileCategory: delivery.fileCategory || 'master_video',
    downloadToken: delivery.downloadToken || `cvd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    storagePath: delivery.storagePath || '',
    streamUrl: delivery.streamUrl || '',
    expiryDate: delivery.expiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    downloadCount: delivery.downloadCount || 0,
    maxDownloads: delivery.maxDownloads || 50,
    isStreamable: delivery.isStreamable !== false,
    isActive: delivery.isActive !== false,
    ownerNotes: delivery.ownerNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbInstance.getClientVideoDeliveries().unshift(record);

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('client_video_deliveries').upsert({
      id: record.id,
      booking_ref: record.bookingRef,
      client_id: record.clientId,
      client_name: record.clientName,
      project_id: record.projectId,
      title: record.title,
      description: record.description,
      video_url: record.videoUrl,
      video_source_type: record.videoSourceType,
      thumbnail_url: record.thumbnailUrl,
      file_name: record.fileName,
      file_size_bytes: record.fileSizeBytes,
      file_size_formatted: record.fileSizeFormatted,
      mime_type: record.mimeType,
      file_category: record.fileCategory,
      download_token: record.downloadToken,
      expiry_date: record.expiryDate,
      download_count: record.downloadCount,
      max_downloads: record.maxDownloads,
      is_streamable: record.isStreamable,
      is_active: record.isActive,
      owner_notes: record.ownerNotes,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }, { onConflict: 'id' });
  }

  project.deliveries = Array.isArray(project.deliveries) ? project.deliveries.filter((existingItem: any) => existingItem.id !== record.id) : [];
  project.deliveries.unshift({
    id: `del-${Date.now()}`,
    projectId: project.id,
    bookingRef: project.bookingRef,
    title: record.title,
    fileName: record.fileName || `${project.bookingRef}_video.mp4`,
    fileSizeBytes: record.fileSizeBytes || 0,
    fileSizeFormatted: record.fileSizeFormatted || 'Unknown size',
    mimeType: record.mimeType || 'video/mp4',
    fileCategory: record.fileCategory || 'master_video',
    storagePath: `private_deliveries/${project.id}/${record.fileName || 'master.mp4'}`,
    downloadToken: record.downloadToken || `dl_${Date.now()}`,
    expiryDate: record.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString(),
    downloadCount: 0,
    maxDownloads: record.maxDownloads || 50,
    isStreamable: record.isStreamable !== false,
    streamUrl: record.streamUrl || `/api/client/stream-delivery/${record.downloadToken}`,
    createdAt: new Date().toISOString(),
  } as any);

  if (project.currentStage !== 'files_delivered' && project.currentStage !== 'service_completed') {
    project.currentStage = 'files_delivered';
    project.stageProgressPercent = 100;
    project.actualDeliveryDate = new Date().toISOString().split('T')[0];
    project.statusHistory.push({
      id: `stat-auto-${Date.now()}`,
      stage: 'files_delivered',
      stageLabel: 'Files Delivered',
      message: `Automated video delivery added: ${record.title}.`,
      updatedBy: 'Automation Delivery Engine',
      timestamp: new Date().toISOString(),
    });
  }

  setProjectTouch(project);
  await dbInstance.saveProject(project);
  return record;
};

export const createTestimonialTask = async (dbInstance: any, project: ServiceProject): Promise<Testimonial | undefined> => {
  const existingTestimonial = dbInstance.getTestimonials().find((entry: Testimonial) => entry.bookingRef === project.bookingRef);
  if (existingTestimonial) {
    project.testimonialId = existingTestimonial.id;
    return existingTestimonial;
  }

  const testimonial: Testimonial = {
    id: `test-auto-${project.bookingRef.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    clientName: project.clientName,
    serviceTitle: project.serviceTitle,
    eventDate: new Date().getFullYear().toString(),
    location: 'Hindupur, AP',
    rating: 5,
    reviewText: `Pending owner approval for ${project.serviceTitle}.`,
    videoUrl: '',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    isVerified: true,
    isPublished: false,
    bookingRef: project.bookingRef,
    createdAt: new Date().toISOString(),
  };

  dbInstance.getTestimonials().unshift(testimonial);
  project.testimonialId = testimonial.id;

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('testimonials').upsert({
      id: testimonial.id,
      client_name: testimonial.clientName,
      service_title: testimonial.serviceTitle,
      event_date: testimonial.eventDate,
      location: testimonial.location,
      rating: testimonial.rating,
      review_text: testimonial.reviewText,
      video_url: testimonial.videoUrl || '',
      thumbnail_url: testimonial.thumbnailUrl || '/assets/kbk-logo.jpg',
      is_verified: testimonial.isVerified,
      is_published: testimonial.isPublished,
      booking_ref: testimonial.bookingRef,
      created_at: testimonial.createdAt,
    }, { onConflict: 'id' });
  }

  await dbInstance.saveProject(project);
  return testimonial;
};

export const markProjectOverdue = async (dbInstance: any, project: ServiceProject): Promise<ServiceProject> => {
  if (project.isOverdue) return project;
  project.isOverdue = true;
  project.updatedAt = new Date().toISOString();

  const alreadyFlagged = dbInstance.getAuditLogs().some((entry: any) =>
    entry.action === 'PROJECT_OVERDUE' && String(entry.details || '').includes(project.bookingRef)
  );

  if (!alreadyFlagged) {
    await createAuditLog(dbInstance, {
      actorRole: 'system',
      actorName: 'KBK Automation Engine',
      actorIdentifier: 'system_workflow',
      action: 'PROJECT_OVERDUE',
      details: `Project ${project.bookingRef} passed expected delivery date and was flagged as overdue.`,
      metadata: { bookingRef: project.bookingRef, projectId: project.id },
    });
  }

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('service_projects').update({
      is_overdue: true,
      updated_at: project.updatedAt,
    }).eq('id', project.id);
  }

  await dbInstance.saveProject(project);
  return project;
};

export const ensureBookingProject = async (dbInstance: any, booking: BookingRequest, client: Client): Promise<ServiceProject> =>
  createProject(dbInstance, booking, client);

export default {
  createAuditLog,
  createClient,
  createProject,
  updateProjectStatus,
  createVideoDelivery,
  createTestimonialTask,
  markProjectOverdue,
  ensureBookingProject,
};
