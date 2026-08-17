import type { BookingRequest, Client, ServiceProject, Testimonial } from '../types.js';
import { AUTOMATION_EVENTS } from './types.js';
import { createAuditLog, createClient, createProject, createTestimonialTask, createVideoDelivery, markProjectOverdue, updateProjectStatus } from './actions.js';
import { findClientByBooking, findProjectByBooking, findTestimonialForBooking, hasAuditLogForAction, projectIsOverdue } from './triggers.js';

export const handleBookingCreated = async (booking: BookingRequest, dbInstance: any) => {
  const existingClient = findClientByBooking(dbInstance, booking) || await createClient(dbInstance, booking);
  const project = await createProject(dbInstance, booking, existingClient);

  await createAuditLog(dbInstance, {
    actorRole: 'system',
    actorName: 'KBK Automation Engine',
    actorIdentifier: 'system_workflow',
    action: 'BOOKING_CREATED',
    details: `Booking ${booking.bookingRef} created and project ${project.id} linked to client ${existingClient.id}.`,
    metadata: { bookingRef: booking.bookingRef, projectId: project.id, clientId: existingClient.id },
  });

  return { client: existingClient, project };
};

export const handleProjectStatusChanged = async (dbInstance: any, project: ServiceProject, nextStage: string, updatedBy: string, customMessage?: string) => {
  const updated = await updateProjectStatus(dbInstance, project, nextStage, updatedBy, customMessage);

  if (updated.currentStage === 'service_completed') {
    await createAuditLog(dbInstance, {
      actorRole: 'system',
      actorName: 'KBK Automation Engine',
      actorIdentifier: 'system_workflow',
      action: 'PROJECT_COMPLETED',
      details: `Project ${updated.bookingRef} reached completed status.`,
      metadata: { bookingRef: updated.bookingRef, projectId: updated.id },
    });

    await createTestimonialTask(dbInstance, updated);
  }

  await createAuditLog(dbInstance, {
    actorRole: 'system',
    actorName: updatedBy,
    actorIdentifier: updatedBy,
    action: 'PROJECT_STATUS_CHANGED',
    details: `Project ${updated.bookingRef} status changed to ${updated.currentStage}.`,
    metadata: { bookingRef: updated.bookingRef, projectId: updated.id, previousStage: project.currentStage, nextStage: updated.currentStage },
  });

  return updated;
};

export const handleVideoDeliveryAdded = async (dbInstance: any, delivery: any) => {
  const project = findProjectByBooking(dbInstance, delivery.bookingRef, delivery.projectId) || await createProject(dbInstance, { id: 'unknown', clientId: delivery.clientId || 'client-unknown', clientName: delivery.clientName || 'Client', clientPhone: '', clientEmail: '', clientCity: '', serviceId: 'unknown', serviceTitle: 'Delivery Upload', eventDate: '', preferredDeliveryDate: '', budgetRange: '', footageDetails: '', referenceLinks: '', customNotes: '', agreedTerms: true, priceSnapshot: { serviceId: 'unknown', serviceTitle: 'Delivery Upload', priceType: 'starting_from', basePrice: 0, currency: 'INR', priceLabel: '', inclusions: [], exclusions: [], turnaroundDays: 0, snapshotDate: new Date().toISOString() }, quotedAmount: 0, finalAmount: 0, status: 'pending', createdAt: new Date().toISOString(), bookingRef: delivery.bookingRef } as any, { id: delivery.clientId || 'client-unknown', fullName: delivery.clientName || 'Client', phone: '', email: '', city: '', createdAt: new Date().toISOString() } as any);

  const record = await createVideoDelivery(dbInstance, delivery);
  await createAuditLog(dbInstance, {
    actorRole: 'system',
    actorName: 'KBK Automation Engine',
    actorIdentifier: 'system_workflow',
    action: 'VIDEO_DELIVERY_ADDED',
    details: `Video delivery ${record.title} added for booking ${record.bookingRef}.`,
    metadata: { bookingRef: record.bookingRef, projectId: record.projectId, videoUrl: record.videoUrl },
  });

  return { project, record };
};

export const handleProjectCompleted = async (dbInstance: any, project: ServiceProject) => {
  if (!project) return null;

  const existingTestimonial = findTestimonialForBooking(dbInstance, project.bookingRef);
  const testimonial = existingTestimonial || await createTestimonialTask(dbInstance, project);

  await createAuditLog(dbInstance, {
    actorRole: 'system',
    actorName: 'KBK Automation Engine',
    actorIdentifier: 'system_workflow',
    action: 'PROJECT_COMPLETED',
    details: `Project ${project.bookingRef} completed and testimonial task created.`,
    metadata: { bookingRef: project.bookingRef, projectId: project.id, testimonialId: testimonial?.id },
  });

  return testimonial;
};

export const handleProjectOverdue = async (dbInstance: any, project: ServiceProject) => {
  if (!project || !projectIsOverdue(project)) return null;
  const existingOverdue = hasAuditLogForAction(dbInstance, 'PROJECT_OVERDUE', project.bookingRef);
  if (existingOverdue && project.isOverdue) return project;

  const updatedProject = await markProjectOverdue(dbInstance, project);
  await createAuditLog(dbInstance, {
    actorRole: 'system',
    actorName: 'KBK Automation Engine',
    actorIdentifier: 'system_workflow',
    action: 'PROJECT_OVERDUE',
    details: `Project ${updatedProject.bookingRef} was flagged as overdue.`,
    metadata: { bookingRef: updatedProject.bookingRef, projectId: updatedProject.id },
  });

  return updatedProject;
};

export const runAutomationWorkflow = async (eventType: string, payload: any, dbInstance: any) => {
  switch (eventType) {
    case AUTOMATION_EVENTS.BOOKING_CREATED:
      return handleBookingCreated(payload.booking, dbInstance);
    case AUTOMATION_EVENTS.PROJECT_STATUS_CHANGED:
      return handleProjectStatusChanged(dbInstance, payload.project, payload.nextStage, payload.updatedBy || 'Owner', payload.message);
    case AUTOMATION_EVENTS.VIDEO_DELIVERY_ADDED:
      return handleVideoDeliveryAdded(dbInstance, payload.delivery || payload);
    case AUTOMATION_EVENTS.PROJECT_COMPLETED:
      return handleProjectCompleted(dbInstance, payload.project);
    case AUTOMATION_EVENTS.PROJECT_OVERDUE:
      return handleProjectOverdue(dbInstance, payload.project);
    default:
      return { ok: true, eventType, payload };
  }
};
