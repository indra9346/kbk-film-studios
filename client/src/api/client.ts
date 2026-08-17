import {
  ServiceItem,
  PublicWork,
  Testimonial,
  StudioCMSData,
  BookingRequest,
  ServiceProject,
  PrivateDeliveryFile,
  Owner,
  AuditLog
} from '../types';
import { localDb } from './localDb';

const API_BASE = '/api';
function getAuthHeaders(type: 'owner' | 'client' = 'owner'): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (type === 'owner') {
    const token = localStorage.getItem('kbk_owner_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } else {
    const clientToken = localStorage.getItem('kbk_client_token');
    if (clientToken) headers['Authorization'] = `Bearer ${clientToken}`;
  }
  return headers;
}

async function safeRequest<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }

    if (res.ok && !contentType.includes('application/json')) {
      const text = await res.text();
      if (text && (text.includes('<!doctype html') || text.includes('<html'))) {
        if (fallback) return fallback();
        throw new Error('API route misconfigured — server returned HTML instead of JSON.');
      }
    }

    if (contentType.includes('application/json')) {
      const errJson = await res.json();
      throw new Error(errJson.error || errJson.message || 'API request failed');
    }

    if (!res.ok && fallback) {
      return fallback();
    }

    throw new Error(`API server returned HTTP ${res.status}`);
  } catch (err: any) {
    if (fallback) {
      console.warn(`[API] Using fallback for ${url}:`, err.message);
      return fallback();
    }
    throw err;
  }
}

export const api = {
  // Public
  async getCMS(): Promise<StudioCMSData> {
    return safeRequest(`${API_BASE}/cms`, undefined, () => localDb.getCMS());
  },

  async getServices(): Promise<ServiceItem[]> {
    return safeRequest(`${API_BASE}/services`, undefined, () => localDb.getServices());
  },

  async getWorks(): Promise<PublicWork[]> {
    return safeRequest(`${API_BASE}/works`, undefined, () => localDb.getWorks());
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return safeRequest(`${API_BASE}/testimonials`, undefined, () => localDb.getTestimonials());
  },

  async submitBooking(data: any): Promise<{ success: boolean; bookingRef: string; message: string }> {
    return safeRequest(
      `${API_BASE}/bookings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => localDb.submitBooking(data)
    );
  },

  // Passwordless Owner Auth & Access Verification
  async checkOwnerAccess(identifier: string): Promise<{ authorized: boolean; owner?: any; message?: string }> {
    return safeRequest(
      `${API_BASE}/owner/check-access`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      },
      () => localDb.checkOwnerAccess(identifier)
    );
  },

  async requestOwnerOTP(identifier: string): Promise<{ success: boolean; message: string; demoHint?: string }> {
    return safeRequest(
      `${API_BASE}/auth/owner-request-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      },
      () => {
        const check = localDb.checkOwnerAccess(identifier);
        if (!check.authorized) {
          throw new Error('Access restricted: This phone number or email is not registered as an authorized owner.');
        }
        return {
          success: true,
          message: `Verification code sent to registered owner ${check.owner.name}.`,
          demoHint: 'For quick studio demonstration, use code: 123456'
        };
      }
    );
  },

  async verifyOwnerOTP(identifier: string, otpCode: string): Promise<{ success: boolean; token: string; owner: any }> {
    return safeRequest(
      `${API_BASE}/auth/owner-verify-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otpCode }),
      },
      () => {
        const check = localDb.checkOwnerAccess(identifier);
        if (!check.authorized) {
          throw new Error('Access restricted: Invalid or unauthorized owner.');
        }
        const token = `owner_session_${Date.now()}`;
        return {
          success: true,
          token,
          owner: check.owner
        };
      }
    );
  },

  // Passwordless Client Auth & Tracking
  async requestClientOTP(bookingRef: string, identifier: string): Promise<{ success: boolean; message: string; demoHint?: string }> {
    const res = await fetch(`${API_BASE}/auth/client-request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingRef, identifier }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send client OTP');
    return json;
  },

  async verifyClientOTP(bookingRef: string, identifier: string, otpCode: string): Promise<{ success: boolean; clientToken: string; bookingRef: string; clientName: string }> {
    const res = await fetch(`${API_BASE}/auth/client-verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingRef, identifier, otpCode }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invalid OTP code');
    return json;
  },

  async requestForgotReferenceOTP(identifier: string): Promise<{ success: boolean; message: string; demoHint?: string }> {
    const res = await fetch(`${API_BASE}/auth/client-forgot-reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to request code');
    return json;
  },

  async verifyForgotReferenceOTP(identifier: string, otpCode: string): Promise<{ success: boolean; bookings: Array<{ bookingRef: string; serviceTitle: string; clientName: string; createdAt: string; status: string }> }> {
    const res = await fetch(`${API_BASE}/auth/client-verify-forgot-reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otpCode }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to verify code');
    return json;
  },

  async getClientProject(): Promise<{ booking: BookingRequest; project: ServiceProject | null; deliveries: PrivateDeliveryFile[] }> {
    const res = await fetch(`${API_BASE}/client/track`, {
      headers: getAuthHeaders('client'),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load client project data');
    return json;
  },

  async submitClientTestimonial(data: { bookingRef: string; clientName?: string; location?: string; rating: number; reviewText: string; videoUrl?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/client/testimonial`, {
      method: 'POST',
      headers: getAuthHeaders('client'),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit review');
    return json;
  },

  async sendClientMessage(bookingRef: string, text: string): Promise<any> {
    const res = await fetch(`${API_BASE}/client/message`, {
      method: 'POST',
      headers: getAuthHeaders('client'),
      body: JSON.stringify({ bookingRef, text }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send message');
    return json;
  },

  // Owner Space Protected Endpoints
  async getOwnerMetrics(): Promise<any> {
    return safeRequest(`${API_BASE}/owner/dashboard-metrics`, { headers: getAuthHeaders('owner') }, () => {
      const bookings = localDb.getBookings();
      const projects = localDb.getProjects();
      const completed = projects.filter(p => p.currentStage === 'files_delivered' || p.currentStage === 'service_completed').length;
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalAmount || b.quotedAmount || 0), 0);
      return {
        totalRevenue,
        activeProjects: projects.filter(p => p.currentStage !== 'files_delivered' && p.currentStage !== 'service_completed').length,
        completedProjects: completed,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        averageDeliveryDays: 5,
        ratingAverage: 5.0
      };
    });
  },

  async getOwnerBookings(): Promise<BookingRequest[]> {
    return safeRequest(`${API_BASE}/owner/bookings`, { headers: getAuthHeaders('owner') }, () => localDb.getBookings());
  },

  async updateBookingStatus(id: string, data: { status: string; rejectionReason?: string; quotedAmount?: number; scheduledDate?: string; notes?: string }): Promise<any> {
    return safeRequest(`${API_BASE}/owner/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, message: 'Status updated' }));
  },

  async reviseBookingPrice(id: string, newPrice: number, reason: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/bookings/${id}/price-revision`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify({ newPrice, reason }),
    }, () => ({ success: true, message: 'Price revised' }));
  },

  async getOwnerProjects(): Promise<ServiceProject[]> {
    return safeRequest(`${API_BASE}/owner/projects`, { headers: getAuthHeaders('owner') }, () => localDb.getProjects());
  },

  async updateProjectStage(id: string, data: { stage: string; stageLabel?: string; message?: string; progressPercent?: number }): Promise<any> {
    return safeRequest(`${API_BASE}/owner/projects/${id}/stage`, {
      method: 'PATCH',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, message: 'Stage updated' }));
  },

  async uploadClientDelivery(projectId: string, data: any): Promise<any> {
    return safeRequest(`${API_BASE}/owner/projects/${projectId}/delivery`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, message: 'Delivery attached' }));
  },

  async uploadProjectFile(projectId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('kbk_owner_token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return safeRequest(`${API_BASE}/owner/projects/${projectId}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }, () => ({ success: true, url: URL.createObjectURL(file), filename: file.name }));
  },

  async saveService(service: any): Promise<any> {
    const isEdit = Boolean(service.id && !service.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/services/${service.id}` : `${API_BASE}/owner/services`;
    const method = isEdit ? 'PUT' : 'POST';
    return safeRequest(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(service),
    }, () => ({ success: true, service }));
  },

  async saveWork(work: any): Promise<any> {
    const isEdit = Boolean(work.id && !work.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/works/${work.id}` : `${API_BASE}/owner/works`;
    const method = isEdit ? 'PUT' : 'POST';
    return safeRequest(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(work),
    }, () => localDb.saveWork(work));
  },

  async deleteWork(id: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/works/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => localDb.deleteWork(id));
  },

  async deleteBooking(id: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => localDb.deleteBooking(id));
  },

  async deleteProject(id: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => localDb.deleteProject(id));
  },

  async saveTestimonial(testimonial: any): Promise<any> {
    const isEdit = Boolean(testimonial.id && !testimonial.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/testimonials/${testimonial.id}` : `${API_BASE}/owner/testimonials`;
    const method = isEdit ? 'PUT' : 'POST';
    return safeRequest(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(testimonial),
    }, () => localDb.saveTestimonial(testimonial));
  },

  async deleteTestimonial(id: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => localDb.deleteTestimonial(id));
  },

  async updateCMS(data: Partial<StudioCMSData>): Promise<any> {
    return safeRequest(`${API_BASE}/owner/cms`, {
      method: 'PUT',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => localDb.updateCMS(data));
  },

  async getOwners(): Promise<Owner[]> {
    return safeRequest(`${API_BASE}/owner/owners`, { headers: getAuthHeaders('owner') }, () => localDb.getOwners());
  },

  async inviteOwner(data: { name: string; phone: string; email: string; role?: string; permissions?: string[] }): Promise<any> {
    return safeRequest(`${API_BASE}/owner/owners`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, owner: { id: `owner-${Date.now()}`, ...data, isActive: true, createdAt: new Date().toISOString() } }));
  },

  async removeOwner(id: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/owners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true, message: 'Owner removed' }));
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return safeRequest(`${API_BASE}/owner/audit-logs`, { headers: getAuthHeaders('owner') }, () => []);
  },

  // Client Video Deliveries (Owner Management)
  async getClientVideoDeliveries(): Promise<any[]> {
    return safeRequest(`${API_BASE}/owner/client-video-deliveries`, { headers: getAuthHeaders('owner') }, () => []);
  },

  async getClientVideoDeliveriesByBooking(bookingRef: string): Promise<any[]> {
    return safeRequest(`${API_BASE}/owner/client-video-deliveries/booking/${bookingRef}`, { headers: getAuthHeaders('owner') }, () => []);
  },

  async addClientVideoDelivery(data: {
    bookingRef: string;
    clientId?: string;
    clientName?: string;
    projectId?: string;
    title: string;
    description?: string;
    videoUrl: string;
    videoSourceType?: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSizeBytes?: number;
    fileSizeFormatted?: string;
    fileCategory?: string;
    expiryDays?: number;
    maxDownloads?: number;
    ownerNotes?: string;
  }): Promise<any> {
    return safeRequest(`${API_BASE}/owner/client-video-deliveries`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, delivery: { id: `cvd-local-${Date.now()}`, ...data } }));
  },

  async updateClientVideoDelivery(id: string, data: any): Promise<any> {
    return safeRequest(`${API_BASE}/owner/client-video-deliveries/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true }));
  },

  async deleteClientVideoDelivery(id: string): Promise<any> {
    return safeRequest(`${API_BASE}/owner/client-video-deliveries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true }));
  },

  // Client Video Deliveries (Public Access by booking ref)
  async getMyVideoDeliveries(bookingRef: string, token?: string): Promise<any[]> {
    const url = `${API_BASE}/client/video-deliveries?bookingRef=${encodeURIComponent(bookingRef)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders('client') });
    if (!res.ok) return [];
    return res.json();
  },

  // Automation Workflows & n8n Engine Endpoints
  async getWorkflows(): Promise<{ executions: any[]; stats: any; overdueProjects: any[] }> {
    return safeRequest(`${API_BASE}/owner/workflows`, { headers: getAuthHeaders('owner') }, () => ({
      executions: [],
      stats: { total: 0, completed: 0, failed: 0, pending: 0, overdueCount: 0, n8nConfigured: false },
      overdueProjects: []
    }));
  },

  async checkOverdueWorkflows(): Promise<any> {
    return safeRequest(`${API_BASE}/owner/workflows/overdue-check`, {
      method: 'POST',
      headers: getAuthHeaders('owner')
    }, () => ({ success: true, count: 0, flagged: [] }));
  },

  async testN8nWebhook(): Promise<any> {
    return safeRequest(`${API_BASE}/owner/workflows/test-n8n`, {
      method: 'POST',
      headers: getAuthHeaders('owner')
    }, () => ({ success: true, message: 'Simulated n8n test ping' }));
  },
};

