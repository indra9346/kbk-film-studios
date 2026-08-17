import { supabase, isSupabaseEnabled } from './supabase.js';
import type { BookingRequest, ServiceProject, Client, PublicWork, Testimonial, ServiceProjectStage } from './types.js';

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  triggerEvent: string;
  entityId: string;
  entityType: string;
  status: 'completed' | 'failed' | 'pending';
  actionTaken: string;
  details: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

// Allowed state transitions to avoid invalid workflow jumps
export const ALLOWED_STAGE_TRANSITIONS: Record<string, string[]> = {
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
  footage_received: 'Raw Footage Ingested & Verified',
  rough_cut_assembly: 'Rough Cut Assembly & Storyline',
  color_grading_audio: 'Color Grading & Audio Mastering',
  client_review_revision: 'Client Teaser Preview & Revisions',
  client_approved: 'Client Final Sign-off',
  files_delivered: '4K Masters Delivered in Locker',
  service_completed: 'Service Completed & Archived',
  rejected: 'Booking Request Declined',
};

export const STAGE_PROGRESS: Record<string, number> = {
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
};

class WorkflowEngine {
  private inMemoryExecutions: WorkflowExecution[] = [];

  // Dispatch event payload to external n8n webhook if configured
  public async dispatchToN8n(event: string, payload: Record<string, any>): Promise<void> {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) return;

    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-KBK-Event': event },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          studio: 'KBK Film Studios',
          data: payload,
        }),
      });
    } catch (err) {
      console.warn('[WorkflowEngine] n8n webhook delivery note:', err);
    }
  }

  // Record workflow execution log both in Supabase & memory
  public async recordExecution(entry: Omit<WorkflowExecution, 'id' | 'startedAt' | 'completedAt'> & { startedAt?: string }): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      startedAt: entry.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      ...entry,
    };

    this.inMemoryExecutions.unshift(execution);
    if (this.inMemoryExecutions.length > 200) {
      this.inMemoryExecutions.pop();
    }

    if (isSupabaseEnabled() && supabase) {
      try {
        await supabase.from('workflow_executions').insert({
          id: execution.id,
          workflow_name: execution.workflowName,
          trigger_event: execution.triggerEvent,
          entity_id: execution.entityId,
          entity_type: execution.entityType,
          status: execution.status,
          action_taken: execution.actionTaken,
          details: execution.details,
          error_message: execution.errorMessage || null,
          started_at: execution.startedAt,
          completed_at: execution.completedAt,
        });
      } catch (e) {
        console.warn('[WorkflowEngine] Supabase execution log write note:', e);
      }
    }

    return execution;
  }

  public getExecutions(): WorkflowExecution[] {
    return this.inMemoryExecutions;
  }

  // 1. AUTOMATION: Booking Submitted -> Auto Create/Match Client & Service Project
  public async handleBookingSubmitted(booking: BookingRequest, dbInstance: any): Promise<{ client: Client; project: ServiceProject }> {
    const startTime = new Date().toISOString();
    try {
      // 1a. Check if client exists by phone/email or create new client record
      let existingClient = dbInstance.getClients().find((c: Client) =>
        (booking.clientPhone && c.phone === booking.clientPhone) ||
        (booking.clientEmail && c.email && c.email.toLowerCase() === booking.clientEmail.toLowerCase())
      );

      if (!existingClient) {
        existingClient = {
          id: booking.clientId || `client-${Date.now()}`,
          fullName: booking.clientName,
          phone: booking.clientPhone,
          email: booking.clientEmail || '',
          city: booking.clientCity || 'Hindupur, AP',
          createdAt: new Date().toISOString(),
        };
        dbInstance.getClients().unshift(existingClient);
        if (isSupabaseEnabled() && supabase) {
          await supabase.from('clients').upsert({
            id: existingClient.id,
            full_name: existingClient.fullName,
            phone: existingClient.phone,
            email: existingClient.email,
            city: existingClient.city,
            created_at: existingClient.createdAt,
          }, { onConflict: 'id' });
        }
      }

      // 1b. Idempotency check: check if project already exists for this booking
      let existingProject = dbInstance.getServiceProjects().find((p: ServiceProject) => p.bookingRef === booking.bookingRef || p.bookingId === booking.id);

      if (!existingProject) {
        const estDelivery = booking.preferredDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const newProject: ServiceProject = {
          id: `proj-${booking.bookingRef.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          bookingId: booking.id,
          bookingRef: booking.bookingRef,
          clientId: existingClient.id,
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          clientEmail: booking.clientEmail || '',
          serviceId: booking.serviceId,
          serviceTitle: booking.serviceTitle,
          trackingToken: `TRK-${booking.bookingRef}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          currentStage: 'booking_requested',
          stageProgressPercent: STAGE_PROGRESS['booking_requested'] || 10,
          startDate: new Date().toISOString().split('T')[0],
          estimatedDeliveryDate: estDelivery,
          statusHistory: [
            {
              id: `stat-${Date.now()}`,
              stage: 'booking_requested',
              stageLabel: 'Booking Requested',
              message: `Booking received for ${booking.serviceTitle}. Auto-assigned to KBK post-production queue.`,
              updatedBy: 'System Automation Engine',
              timestamp: new Date().toISOString(),
            },
          ],
          internalNotes: booking.customNotes ? `Client Notes: ${booking.customNotes}` : '',
          clientMessages: [
            {
              id: `msg-auto-welcome-${Date.now()}`,
              sender: 'owner',
              senderName: 'Kurudi Bharath Kumar',
              text: `Welcome to KBK Film Studios, ${booking.clientName}! Your booking request (#${booking.bookingRef}) for "${booking.serviceTitle}" has been received. Our team will review your raw footage specs and confirm your slot shortly.`,
              timestamp: new Date().toISOString(),
            },
          ],
          deliveries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        dbInstance.getServiceProjects().unshift(newProject);
        existingProject = newProject;

        if (isSupabaseEnabled() && supabase) {
          await supabase.from('service_projects').upsert({
            id: newProject.id,
            booking_id: newProject.bookingId,
            booking_ref: newProject.bookingRef,
            client_id: newProject.clientId,
            client_name: newProject.clientName,
            client_phone: newProject.clientPhone,
            client_email: newProject.clientEmail,
            service_id: newProject.serviceId,
            service_title: newProject.serviceTitle,
            tracking_token: newProject.trackingToken,
            current_stage: newProject.currentStage,
            stage_progress_percent: newProject.stageProgressPercent,
            start_date: newProject.startDate,
            estimated_delivery_date: newProject.estimatedDeliveryDate,
            status_history: newProject.statusHistory,
            internal_notes: newProject.internalNotes,
            client_messages: newProject.clientMessages,
            deliveries: newProject.deliveries,
            created_at: newProject.createdAt,
            updated_at: newProject.updatedAt,
          }, { onConflict: 'id' });
        }
      }

      // Record audit & workflow execution
      dbInstance.addAuditLog({
        actorRole: 'system',
        actorName: 'KBK Automation Engine',
        actorIdentifier: 'system_workflow',
        action: 'BOOKING_AUTO_PROCESSED',
        details: `Automated client matching and project creation for booking #${booking.bookingRef} (${booking.clientName}).`,
      });

      await this.recordExecution({
        workflowName: 'Booking → Project Automation',
        triggerEvent: 'BOOKING_CREATED',
        entityId: booking.bookingRef,
        entityType: 'booking',
        status: 'completed',
        actionTaken: `Created project #${existingProject.id} and linked client #${existingClient.id}`,
        details: { bookingRef: booking.bookingRef, clientName: booking.clientName, service: booking.serviceTitle },
        startedAt: startTime,
      });

      // Dispatch to external n8n webhook
      void this.dispatchToN8n('BOOKING_CREATED', {
        bookingRef: booking.bookingRef,
        clientName: booking.clientName,
        phone: booking.clientPhone,
        serviceTitle: booking.serviceTitle,
        projectId: existingProject.id,
      });

      return { client: existingClient, project: existingProject };
    } catch (err: any) {
      await this.recordExecution({
        workflowName: 'Booking → Project Automation',
        triggerEvent: 'BOOKING_CREATED',
        entityId: booking.bookingRef,
        entityType: 'booking',
        status: 'failed',
        actionTaken: 'Failed to complete automatic project creation',
        details: { bookingRef: booking.bookingRef },
        errorMessage: err.message || 'Unknown automation error',
        startedAt: startTime,
      });
      throw err;
    }
  }

  // 2. AUTOMATION: Project Status Workflow & State Machine
  public async handleProjectStatusTransition(
    projectId: string,
    targetStage: string,
    updatedBy: string,
    customMessage: string | undefined,
    dbInstance: any
  ): Promise<ServiceProject> {
    const startTime = new Date().toISOString();
    const project = dbInstance.getServiceProjects().find((p: ServiceProject) => p.id === projectId || p.bookingRef === projectId);
    if (!project) {
      throw new Error(`Project #${projectId} not found`);
    }

    const currentStage = project.currentStage;
    const allowed = ALLOWED_STAGE_TRANSITIONS[currentStage] || [];

    // If attempting transition, validate or allow if owner override
    const stageLabel = STAGE_LABELS[targetStage] || targetStage;
    const progressPercent = STAGE_PROGRESS[targetStage] ?? project.stageProgressPercent;

    project.currentStage = targetStage as any;
    project.stageProgressPercent = progressPercent;
    project.updatedAt = new Date().toISOString();

    if (targetStage === 'files_delivered' || targetStage === 'service_completed') {
      project.actualDeliveryDate = new Date().toISOString().split('T')[0];
    }

    project.statusHistory.push({
      id: `stat-${Date.now()}`,
      stage: targetStage as any,
      stageLabel,
      message: customMessage || `Project advanced to ${stageLabel} by ${updatedBy}`,
      updatedBy,
      timestamp: new Date().toISOString(),
    });

    // If delivered or completed, auto-trigger testimonial draft creation if not existing
    if ((targetStage === 'files_delivered' || targetStage === 'service_completed') && !project.testimonialId) {
      void this.handleProjectCompletedTestimonialTrigger(project, dbInstance);
    }

    // Persist in Supabase
    if (isSupabaseEnabled() && supabase) {
      await supabase.from('service_projects').update({
        current_stage: project.currentStage,
        stage_progress_percent: project.stageProgressPercent,
        actual_delivery_date: project.actualDeliveryDate || null,
        status_history: project.statusHistory,
        updated_at: project.updatedAt,
      }).eq('id', project.id);
    }

    dbInstance.addAuditLog({
      actorRole: 'owner',
      actorName: updatedBy,
      actorIdentifier: 'owner_action',
      action: 'PROJECT_STAGE_UPDATED',
      details: `Project #${project.bookingRef} transitioned from ${currentStage} to ${targetStage} (${stageLabel}).`,
    });

    await this.recordExecution({
      workflowName: 'Project Status State Machine',
      triggerEvent: 'PROJECT_STATUS_CHANGED',
      entityId: project.bookingRef,
      entityType: 'project',
      status: 'completed',
      actionTaken: `Updated stage to ${stageLabel} (${progressPercent}%)`,
      details: { previousStage: currentStage, newStage: targetStage, updatedBy },
      startedAt: startTime,
    });

    // Dispatch to n8n webhook
    void this.dispatchToN8n('PROJECT_STATUS_CHANGED', {
      bookingRef: project.bookingRef,
      clientName: project.clientName,
      previousStage: currentStage,
      newStage: targetStage,
      stageLabel,
      updatedBy,
    });

    dbInstance.saveDatabase();
    return project;
  }

  // 3. AUTOMATION: Video Delivery Auto-link & Progress Advancement
  public async handleVideoDeliveryAdded(deliveryData: any, dbInstance: any): Promise<void> {
    const startTime = new Date().toISOString();
    try {
      const project = dbInstance.getServiceProjects().find((p: ServiceProject) => p.bookingRef === deliveryData.bookingRef || p.id === deliveryData.projectId);
      if (project) {
        if (project.currentStage !== 'files_delivered' && project.currentStage !== 'service_completed') {
          // Auto advance to client_approved / files_delivered if video is attached
          project.currentStage = 'files_delivered';
          project.stageProgressPercent = 100;
          project.actualDeliveryDate = new Date().toISOString().split('T')[0];
          project.statusHistory.push({
            id: `stat-auto-del-${Date.now()}`,
            stage: 'files_delivered',
            stageLabel: '4K Masters Delivered in Locker',
            message: `Automated deliverable attachment: "${deliveryData.title}" is now streamable & downloadable in the private locker.`,
            updatedBy: 'Automation Delivery Engine',
            timestamp: new Date().toISOString(),
          });
          project.updatedAt = new Date().toISOString();

          if (isSupabaseEnabled() && supabase) {
            await supabase.from('service_projects').update({
              current_stage: project.currentStage,
              stage_progress_percent: project.stageProgressPercent,
              actual_delivery_date: project.actualDeliveryDate,
              status_history: project.statusHistory,
              updated_at: project.updatedAt,
            }).eq('id', project.id);
          }
        }
      }

      await this.recordExecution({
        workflowName: 'Video Delivery Automation',
        triggerEvent: 'VIDEO_DELIVERY_ATTACHED',
        entityId: deliveryData.bookingRef,
        entityType: 'delivery',
        status: 'completed',
        actionTaken: `Attached delivery "${deliveryData.title}" and synchronized locker state`,
        details: { title: deliveryData.title, bookingRef: deliveryData.bookingRef, category: deliveryData.fileCategory },
        startedAt: startTime,
      });

      void this.dispatchToN8n('VIDEO_DELIVERED', {
        bookingRef: deliveryData.bookingRef,
        clientName: deliveryData.clientName,
        title: deliveryData.title,
        videoUrl: deliveryData.videoUrl,
      });
    } catch (err: any) {
      await this.recordExecution({
        workflowName: 'Video Delivery Automation',
        triggerEvent: 'VIDEO_DELIVERY_ATTACHED',
        entityId: deliveryData.bookingRef,
        entityType: 'delivery',
        status: 'failed',
        actionTaken: 'Failed to link video deliverable',
        errorMessage: err.message,
        details: deliveryData,
        startedAt: startTime,
      });
    }
  }

  // 4. AUTOMATION: Testimonial Pending Trigger
  public async handleProjectCompletedTestimonialTrigger(project: ServiceProject, dbInstance: any): Promise<void> {
    const startTime = new Date().toISOString();
    try {
      const existingTestimonial = dbInstance.getTestimonials().find((t: Testimonial) => t.bookingRef === project.bookingRef);
      if (!existingTestimonial) {
        const draftTestimonial: Testimonial = {
          id: `test-auto-${project.bookingRef.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          clientName: project.clientName,
          serviceTitle: project.serviceTitle,
          eventDate: new Date().getFullYear().toString(),
          location: 'Hindupur, AP',
          rating: 5,
          reviewText: `Exceptional cinematic video editing for ${project.serviceTitle}. The emotional flow and color grading surpassed our expectations.`,
          videoUrl: '',
          thumbnailUrl: '/assets/kbk-logo.jpg',
          isVerified: true,
          isPublished: false, // Pending Owner Review
          bookingRef: project.bookingRef,
          createdAt: new Date().toISOString(),
        };

        dbInstance.getTestimonials().unshift(draftTestimonial);
        project.testimonialId = draftTestimonial.id;

        if (isSupabaseEnabled() && supabase) {
          await supabase.from('testimonials').upsert({
            id: draftTestimonial.id,
            client_name: draftTestimonial.clientName,
            service_title: draftTestimonial.serviceTitle,
            event_date: draftTestimonial.eventDate,
            location: draftTestimonial.location,
            rating: draftTestimonial.rating,
            review_text: draftTestimonial.reviewText,
            is_verified: draftTestimonial.isVerified,
            is_published: draftTestimonial.isPublished,
            booking_ref: draftTestimonial.bookingRef,
            created_at: draftTestimonial.createdAt,
          }, { onConflict: 'id' });
        }

        await this.recordExecution({
          workflowName: 'Testimonial Review Workflow',
          triggerEvent: 'PROJECT_DELIVERED',
          entityId: project.bookingRef,
          entityType: 'testimonial',
          status: 'completed',
          actionTaken: `Created pending testimonial draft for owner review (#${draftTestimonial.id})`,
          details: { clientName: project.clientName, service: project.serviceTitle },
          startedAt: startTime,
        });

        void this.dispatchToN8n('TESTIMONIAL_PENDING_REVIEW', {
          testimonialId: draftTestimonial.id,
          bookingRef: project.bookingRef,
          clientName: project.clientName,
        });
      }
    } catch (e: any) {
      console.warn('[WorkflowEngine] Testimonial auto-trigger note:', e);
    }
  }

  // 5. AUTOMATION: Overdue Projects Detection
  public async checkOverdueProjects(dbInstance: any): Promise<ServiceProject[]> {
    const today = new Date().toISOString().split('T')[0];
    const projects = dbInstance.getServiceProjects();
    const newlyFlagged: ServiceProject[] = [];

    for (const p of projects) {
      if (p.currentStage !== 'files_delivered' && p.currentStage !== 'service_completed' && p.currentStage !== 'rejected') {
        if (p.estimatedDeliveryDate && p.estimatedDeliveryDate < today) {
          if (!p.isOverdue) {
            p.isOverdue = true;
            newlyFlagged.push(p);
            if (isSupabaseEnabled() && supabase) {
              await supabase.from('service_projects').update({ is_overdue: true }).eq('id', p.id);
            }
          }
        }
      }
    }

    if (newlyFlagged.length > 0) {
      await this.recordExecution({
        workflowName: 'Overdue Project Monitor',
        triggerEvent: 'CHECK_OVERDUE_PROJECTS',
        entityId: 'batch-overdue',
        entityType: 'project',
        status: 'completed',
        actionTaken: `Flagged ${newlyFlagged.length} project(s) past expected delivery date`,
        details: { flaggedProjects: newlyFlagged.map((p) => p.bookingRef) },
      });

      void this.dispatchToN8n('PROJECTS_OVERDUE_ALERT', {
        count: newlyFlagged.length,
        projects: newlyFlagged.map((p) => ({ ref: p.bookingRef, client: p.clientName, due: p.estimatedDeliveryDate })),
      });
    }

    return newlyFlagged;
  }
}

export const workflowEngine = new WorkflowEngine();
