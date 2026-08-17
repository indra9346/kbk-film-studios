export const AUTOMATION_EVENTS = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_UPDATED: 'BOOKING_UPDATED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_STATUS_CHANGED: 'PROJECT_STATUS_CHANGED',
  VIDEO_DELIVERY_ADDED: 'VIDEO_DELIVERY_ADDED',
  PROJECT_DELIVERED: 'PROJECT_DELIVERED',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED',
  PROJECT_OVERDUE: 'PROJECT_OVERDUE',
  TESTIMONIAL_CREATED: 'TESTIMONIAL_CREATED',
  TESTIMONIAL_APPROVED: 'TESTIMONIAL_APPROVED',
} as const;

export const PROJECT_STATUS_ALIASES: Record<string, string> = {
  NEW: 'booking_requested',
  CONFIRMED: 'booking_accepted',
  IN_PROGRESS: 'rough_cut_assembly',
  REVIEW: 'client_review_revision',
  CLIENT_APPROVAL: 'client_approved',
  APPROVED: 'client_approved',
  DELIVERED: 'files_delivered',
  COMPLETED: 'service_completed',
  BOOKING_REQUESTED: 'booking_requested',
  BOOKING_ACCEPTED: 'booking_accepted',
  FOOTAGE_RECEIVED: 'footage_received',
  ROUGH_CUT_ASSEMBLY: 'rough_cut_assembly',
  COLOR_GRADING_AUDIO: 'color_grading_audio',
  CLIENT_REVIEW_REVISION: 'client_review_revision',
  CLIENT_APPROVED: 'client_approved',
  FILES_DELIVERED: 'files_delivered',
  SERVICE_COMPLETED: 'service_completed',
};

export const ALLOWED_PROJECT_TRANSITIONS: Record<string, string[]> = {
  booking_requested: ['booking_accepted', 'rejected'],
  booking_accepted: ['footage_received', 'rough_cut_assembly'],
  footage_received: ['rough_cut_assembly', 'color_grading_audio'],
  rough_cut_assembly: ['color_grading_audio', 'client_review_revision'],
  color_grading_audio: ['client_review_revision', 'client_approved', 'files_delivered'],
  client_review_revision: ['color_grading_audio', 'client_approved', 'files_delivered'],
  client_approved: ['files_delivered', 'service_completed'],
  files_delivered: ['service_completed'],
  service_completed: [],
  rejected: [],
};

export const STAGE_LABELS: Record<string, string> = {
  booking_requested: 'Booking Requested',
  booking_accepted: 'Booking Accepted',
  footage_received: 'Footage Received',
  rough_cut_assembly: 'Rough Cut Assembly',
  color_grading_audio: 'Color Grading & Audio',
  client_review_revision: 'Client Review & Revisions',
  client_approved: 'Client Approved',
  files_delivered: 'Files Delivered',
  service_completed: 'Service Completed',
  rejected: 'Rejected',
};

export type AutomationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'overdue';

export interface AutomationExecution {
  id: string;
  workflowName: string;
  triggerEvent: string;
  entityId: string;
  entityType: string;
  status: AutomationStatus;
  actionTaken: string;
  details: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

export interface AutomationContext {
  bookingRef?: string;
  projectId?: string;
  clientId?: string;
  eventType?: string;
  payload?: Record<string, any>;
}
