import type { BookingRequest, Client, ClientVideoDelivery, ServiceProject, Testimonial } from '../types.js';
import { PROJECT_STATUS_ALIASES } from './types.js';

export const normalizeProjectStage = (stage?: string): string => {
  if (!stage) return 'booking_requested';
  const key = String(stage).trim().toUpperCase();
  if (PROJECT_STATUS_ALIASES[key]) return PROJECT_STATUS_ALIASES[key];
  const normalized = String(stage).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return normalized || 'booking_requested';
};

export const projectDueDate = (project: ServiceProject): string | undefined => project.estimatedDeliveryDate || project.startDate;

export const projectIsOverdue = (project: ServiceProject, compareDate = new Date()) => {
  if (!project || !project.estimatedDeliveryDate) return false;
  if (project.currentStage === 'files_delivered' || project.currentStage === 'service_completed' || String(project.currentStage) === 'rejected') return false;
  const due = new Date(project.estimatedDeliveryDate);
  if (Number.isNaN(due.getTime())) return false;
  return due < compareDate;
};

export const findClientByBooking = (dbInstance: any, booking: BookingRequest): Client | undefined =>
  dbInstance.getClients().find((c: Client) =>
    (booking.clientPhone && c.phone === booking.clientPhone) ||
    (booking.clientEmail && c.email && c.email.toLowerCase() === booking.clientEmail.toLowerCase())
  );

export const findProjectByBooking = (dbInstance: any, bookingRef: string, projectId?: string): ServiceProject | undefined =>
  dbInstance.getServiceProjects().find((project: ServiceProject) =>
    project.id === projectId || project.bookingRef === bookingRef || project.bookingId === bookingRef
  );

export const findProjectByDelivery = (dbInstance: any, delivery: Partial<ClientVideoDelivery>): ServiceProject | undefined =>
  dbInstance.getServiceProjects().find((project: ServiceProject) =>
    project.bookingRef === delivery.bookingRef || project.id === delivery.projectId
  );

export const findTestimonialForBooking = (dbInstance: any, bookingRef?: string): Testimonial | undefined =>
  !bookingRef ? undefined : dbInstance.getTestimonials().find((testimonial: Testimonial) => testimonial.bookingRef === bookingRef);

export const hasAuditLogForAction = (dbInstance: any, action: string, bookingRef?: string): boolean => {
  return dbInstance.getAuditLogs().some((entry: any) =>
    entry.action === action && (!bookingRef || String(entry.details || '').includes(String(bookingRef)))
  );
};
