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

export const api = {
  // Public
  async getCMS(): Promise<StudioCMSData> {
    const res = await fetch(`${API_BASE}/cms`);
    if (!res.ok) throw new Error('Failed to load CMS data');
    return res.json();
  },

  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to load services');
    return res.json();
  },

  async getWorks(): Promise<PublicWork[]> {
    const res = await fetch(`${API_BASE}/works`);
    if (!res.ok) throw new Error('Failed to load works');
    return res.json();
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const res = await fetch(`${API_BASE}/testimonials`);
    if (!res.ok) throw new Error('Failed to load testimonials');
    return res.json();
  },

  async submitBooking(data: any): Promise<{ success: boolean; bookingRef: string; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit booking');
    return json;
  },

  // Passwordless Owner Auth & Access Verification
  async checkOwnerAccess(identifier: string): Promise<{ authorized: boolean; owner?: any; message?: string }> {
    const res = await fetch(`${API_BASE}/owner/check-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    return res.json();
  },

  async requestOwnerOTP(identifier: string): Promise<{ success: boolean; message: string; demoHint?: string }> {
    const res = await fetch(`${API_BASE}/auth/owner-request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send owner OTP');
    return json;
  },

  async verifyOwnerOTP(identifier: string, otpCode: string): Promise<{ success: boolean; token: string; owner: any }> {
    const res = await fetch(`${API_BASE}/auth/owner-verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otpCode }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invalid owner verification code');
    return json;
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
    const res = await fetch(`${API_BASE}/owner/dashboard-metrics`, {
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async getOwnerBookings(): Promise<BookingRequest[]> {
    const res = await fetch(`${API_BASE}/owner/bookings`, {
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to load bookings');
    return res.json();
  },

  async updateBookingStatus(id: string, data: { status: string; rejectionReason?: string; quotedAmount?: number; scheduledDate?: string; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update booking status');
    return res.json();
  },

  async reviseBookingPrice(id: string, newPrice: number, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/bookings/${id}/price-revision`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify({ newPrice, reason }),
    });
    if (!res.ok) throw new Error('Failed to revise price');
    return res.json();
  },

  async getOwnerProjects(): Promise<ServiceProject[]> {
    const res = await fetch(`${API_BASE}/owner/projects`, {
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async updateProjectStage(id: string, data: { stage: string; stageLabel?: string; message?: string; progressPercent?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/projects/${id}/stage`, {
      method: 'PATCH',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
  },

  async uploadClientDelivery(projectId: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/projects/${projectId}/delivery`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to attach delivery file');
    return res.json();
  },

  async uploadProjectFile(projectId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('kbk_owner_token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/owner/projects/${projectId}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  },

  async saveService(service: any): Promise<any> {
    const isEdit = Boolean(service.id && !service.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/services/${service.id}` : `${API_BASE}/owner/services`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to save service');
    return res.json();
  },

  async saveWork(work: any): Promise<any> {
    const isEdit = Boolean(work.id && !work.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/works/${work.id}` : `${API_BASE}/owner/works`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(work),
    });
    if (!res.ok) throw new Error('Failed to save work');
    return res.json();
  },

  async deleteWork(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/works/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to delete work');
    return res.json();
  },

  async deleteBooking(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to delete booking request');
    return res.json();
  },

  async deleteProject(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to delete lifecycle project');
    return res.json();
  },

  async saveTestimonial(testimonial: any): Promise<any> {
    const isEdit = Boolean(testimonial.id && !testimonial.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/testimonials/${testimonial.id}` : `${API_BASE}/owner/testimonials`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(testimonial),
    });
    if (!res.ok) throw new Error('Failed to save testimonial');
    return res.json();
  },

  async deleteTestimonial(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to delete testimonial');
    return res.json();
  },

  async updateCMS(data: Partial<StudioCMSData>): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/cms`, {
      method: 'PUT',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update CMS');
    return res.json();
  },

  async getOwners(): Promise<Owner[]> {
    const res = await fetch(`${API_BASE}/owner/owners`, {
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to load owners');
    return res.json();
  },

  async inviteOwner(data: { name: string; phone: string; email: string; role?: string; permissions?: string[] }): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/owners`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to invite owner');
    return json;
  },

  async removeOwner(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owner/owners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to remove owner');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/owner/audit-logs`, {
      headers: getAuthHeaders('owner'),
    });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  },
};
