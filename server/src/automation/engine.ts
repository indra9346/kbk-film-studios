import { isSupabaseEnabled, supabase } from '../supabase.js';
import type { BookingRequest, ServiceProject } from '../types.js';
import { AUTOMATION_EVENTS } from './types.js';
import { handleBookingCreated, handleProjectCompleted, handleProjectOverdue, handleProjectStatusChanged, handleVideoDeliveryAdded, runAutomationWorkflow } from './workflows.js';

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  triggerEvent: string;
  entityId: string;
  entityType: string;
  status: 'completed' | 'failed' | 'pending' | 'running' | 'overdue';
  actionTaken: string;
  details: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

export class AutomationEngine {
  private executions: WorkflowExecution[] = [];

  public async dispatchToN8n(event: string, payload: Record<string, any>): Promise<void> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-KBK-Event': event },
        body: JSON.stringify({ event, timestamp: new Date().toISOString(), studio: 'KBK Film Studios', data: payload }),
      });
    } catch (err) {
      console.warn('[AutomationEngine] n8n dispatch failed:', err);
    }
  }

  public async recordExecution(entry: Omit<WorkflowExecution, 'id' | 'startedAt' | 'completedAt'> & { startedAt?: string }): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: entry.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      ...entry,
    };

    this.executions.unshift(execution);
    if (this.executions.length > 150) this.executions.pop();

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
      } catch (error) {
        console.warn('[AutomationEngine] workflow execution log skipped:', error);
      }
    }

    return execution;
  }

  public getExecutions(): WorkflowExecution[] {
    return this.executions;
  }

  public async handleBookingCreated(booking: BookingRequest, dbInstance: any) {
    const startedAt = new Date().toISOString();
    try {
      const result = await handleBookingCreated(booking, dbInstance);
      await this.recordExecution({
        workflowName: 'Booking Created Workflow',
        triggerEvent: AUTOMATION_EVENTS.BOOKING_CREATED,
        entityId: booking.bookingRef,
        entityType: 'booking',
        status: 'completed',
        actionTaken: `Linked booking ${booking.bookingRef} to project ${result.project.id}`,
        details: { bookingRef: booking.bookingRef, projectId: result.project.id, clientId: result.client.id },
        startedAt,
      });
      void this.dispatchToN8n(AUTOMATION_EVENTS.BOOKING_CREATED, { bookingRef: booking.bookingRef, projectId: result.project.id, clientId: result.client.id });
      return result;
    } catch (error: any) {
      await this.recordExecution({
        workflowName: 'Booking Created Workflow',
        triggerEvent: AUTOMATION_EVENTS.BOOKING_CREATED,
        entityId: booking.bookingRef,
        entityType: 'booking',
        status: 'failed',
        actionTaken: 'Failed to create project from booking',
        details: { bookingRef: booking.bookingRef },
        errorMessage: error?.message || 'Unknown booking automation failure',
        startedAt,
      });
      throw error;
    }
  }

  public async handleProjectStatusChanged(dbInstance: any, project: ServiceProject, nextStage: string, updatedBy: string, customMessage?: string) {
    const startedAt = new Date().toISOString();
    try {
      const result = await handleProjectStatusChanged(dbInstance, project, nextStage, updatedBy, customMessage);
      await this.recordExecution({
        workflowName: 'Project Status Workflow',
        triggerEvent: AUTOMATION_EVENTS.PROJECT_STATUS_CHANGED,
        entityId: project.bookingRef,
        entityType: 'project',
        status: 'completed',
        actionTaken: `Updated project ${project.bookingRef} to ${result.currentStage}`,
        details: { bookingRef: project.bookingRef, previousStage: project.currentStage, nextStage: result.currentStage },
        startedAt,
      });
      void this.dispatchToN8n(AUTOMATION_EVENTS.PROJECT_STATUS_CHANGED, { bookingRef: project.bookingRef, nextStage: result.currentStage, updatedBy });
      return result;
    } catch (error: any) {
      await this.recordExecution({
        workflowName: 'Project Status Workflow',
        triggerEvent: AUTOMATION_EVENTS.PROJECT_STATUS_CHANGED,
        entityId: project.bookingRef,
        entityType: 'project',
        status: 'failed',
        actionTaken: 'Failed to update project status',
        details: { bookingRef: project.bookingRef, nextStage },
        errorMessage: error?.message || 'Unknown project status error',
        startedAt,
      });
      throw error;
    }
  }

  public async handleVideoDeliveryAdded(dbInstance: any, delivery: any) {
    const startedAt = new Date().toISOString();
    try {
      const result = await handleVideoDeliveryAdded(dbInstance, delivery);
      await this.recordExecution({
        workflowName: 'Video Delivery Workflow',
        triggerEvent: AUTOMATION_EVENTS.VIDEO_DELIVERY_ADDED,
        entityId: delivery.bookingRef,
        entityType: 'delivery',
        status: 'completed',
        actionTaken: `Recorded delivery ${delivery.title} for ${delivery.bookingRef}`,
        details: { bookingRef: delivery.bookingRef, title: delivery.title, projectId: result.project.id },
        startedAt,
      });
      void this.dispatchToN8n(AUTOMATION_EVENTS.VIDEO_DELIVERY_ADDED, { bookingRef: delivery.bookingRef, title: delivery.title, projectId: result.project.id });
      return result;
    } catch (error: any) {
      await this.recordExecution({
        workflowName: 'Video Delivery Workflow',
        triggerEvent: AUTOMATION_EVENTS.VIDEO_DELIVERY_ADDED,
        entityId: delivery.bookingRef,
        entityType: 'delivery',
        status: 'failed',
        actionTaken: 'Failed to process video delivery automation',
        details: { bookingRef: delivery.bookingRef, title: delivery.title },
        errorMessage: error?.message || 'Unknown delivery automation error',
        startedAt,
      });
      throw error;
    }
  }

  public async handleProjectCompleted(dbInstance: any, project: ServiceProject) {
    const startedAt = new Date().toISOString();
    try {
      const result = await handleProjectCompleted(dbInstance, project);
      await this.recordExecution({
        workflowName: 'Project Completion Workflow',
        triggerEvent: AUTOMATION_EVENTS.PROJECT_COMPLETED,
        entityId: project.bookingRef,
        entityType: 'project',
        status: 'completed',
        actionTaken: `Created testimonial task ${result?.id || 'existing'}`,
        details: { bookingRef: project.bookingRef, testimonialId: result?.id },
        startedAt,
      });
      return result;
    } catch (error: any) {
      await this.recordExecution({
        workflowName: 'Project Completion Workflow',
        triggerEvent: AUTOMATION_EVENTS.PROJECT_COMPLETED,
        entityId: project.bookingRef,
        entityType: 'project',
        status: 'failed',
        actionTaken: 'Failed to create testimonial task',
        details: { bookingRef: project.bookingRef },
        errorMessage: error?.message || 'Unknown completion automation error',
        startedAt,
      });
      throw error;
    }
  }

  public async checkProjectOverdue(dbInstance: any) {
    const projects = dbInstance.getServiceProjects();
    const results: ServiceProject[] = [];

    for (const project of projects) {
      if (!project || !project.bookingRef) continue;
      const overdue = project.isOverdue || (project.estimatedDeliveryDate && new Date(project.estimatedDeliveryDate) < new Date() && project.currentStage !== 'files_delivered' && project.currentStage !== 'service_completed');
      if (overdue) {
        const result = await handleProjectOverdue(dbInstance, project);
        if (result) results.push(result);
      }
    }

    return results;
  }

  public async runWorkflow(eventType: string, payload: any, dbInstance: any): Promise<any> {
    return runAutomationWorkflow(eventType, payload, dbInstance);
  }
}

export const automationEngine = new AutomationEngine();
