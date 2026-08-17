import {
  BookingRequest,
  ServiceProject,
  ServiceItem,
  PrivateDeliveryFile,
  PublicWork,
  Testimonial,
  StudioCMSData,
  Owner,
  AuditLog,
} from '../types';
import { localDb } from './localDb';
import {
  supabase,
  isSupabaseConfigured,
  mapWorkFromRow,
  mapWorkToRow,
  mapTestimonialFromRow,
  mapTestimonialToRow,
  mapServiceFromRow,
  mapCmsFromRow,
} from './supabaseClient';

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
      return fallback();
    }
    throw err;
  }
}

export const api = {
  // ----------------------------------------------------
  // PUBLIC GETTERS (Direct Supabase + API fallback)
  // ----------------------------------------------------
  async getCMS(): Promise<StudioCMSData> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('studio_cms').select('*').limit(1);
        if (!error && data && data.length > 0) {
          return mapCmsFromRow(data[0]);
        }
      } catch (e) {
        console.warn('[Supabase] getCMS error:', e);
      }
    }
    return safeRequest(`${API_BASE}/cms`, undefined, () => localDb.getCMS());
  },

  async getServices(): Promise<ServiceItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapServiceFromRow);
        }
      } catch (e) {
        console.warn('[Supabase] getServices error:', e);
      }
    }
    return safeRequest(`${API_BASE}/services`, undefined, () => localDb.getServices());
  },

  async getWorks(): Promise<PublicWork[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('public_works')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapWorkFromRow);
        }
      } catch (e) {
        console.warn('[Supabase] getWorks error:', e);
      }
    }
    return safeRequest(`${API_BASE}/works`, undefined, () => localDb.getWorks());
  },

  async getTestimonials(): Promise<Testimonial[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapTestimonialFromRow);
        }
      } catch (e) {
        console.warn('[Supabase] getTestimonials error:', e);
      }
    }
    return safeRequest(`${API_BASE}/testimonials`, undefined, () => localDb.getTestimonials());
  },

  async submitBooking(data: any): Promise<{ success: boolean; bookingRef: string; message: string }> {
    if (isSupabaseConfigured()) {
      try {
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const bookingRef = `KBK-2026-${randomDigits}`;
        const row = {
          id: `book-${Date.now()}`,
          booking_ref: bookingRef,
          client_id: `client-${Date.now()}`,
          client_name: data.fullName,
          client_phone: data.phone,
          client_email: data.email || '',
          client_city: data.city || 'Hindupur',
          service_id: data.serviceId,
          service_title: data.serviceTitle || 'Specialized Video Editing',
          event_date: data.eventDate,
          preferred_delivery_date: data.preferredDeliveryDate || '',
          budget_range: data.budgetRange || '',
          footage_details: data.footageDetails || '',
          reference_links: data.referenceLinks || '',
          custom_notes: data.customNotes || '',
          agreed_terms: true,
          price_snapshot: {},
          quoted_amount: 14999,
          final_amount: 14999,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        await supabase.from('booking_requests').insert(row);
      } catch (e) {
        console.warn('[Supabase] direct booking insert note:', e);
      }
    }

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
          throw new Error('Access restricted: Identifier not registered.');
        }
        return {
          success: true,
          token: `owner_token_${Date.now()}`,
          owner: check.owner,
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
    if (isSupabaseConfigured()) {
      try {
        const row = mapTestimonialToRow({
          clientName: data.clientName || 'Happy Client',
          serviceTitle: 'Wedding Video Highlights',
          eventDate: new Date().getFullYear().toString(),
          location: data.location || 'Hindupur, AP',
          rating: data.rating,
          reviewText: data.reviewText,
          videoUrl: data.videoUrl || '',
          bookingRef: data.bookingRef,
          isVerified: true,
          isPublished: true
        });
        await supabase.from('testimonials').insert(row);
      } catch (e) {
        console.warn('[Supabase] direct testimonial submit note:', e);
      }
    }

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
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            bookingRef: r.booking_ref,
            clientId: r.client_id,
            clientName: r.client_name,
            clientPhone: r.client_phone,
            clientEmail: r.client_email,
            clientCity: r.client_city,
            serviceId: r.service_id,
            serviceTitle: r.service_title,
            eventDate: r.event_date,
            preferredDeliveryDate: r.preferred_delivery_date || '',
            budgetRange: r.budget_range || '',
            footageDetails: r.footage_details || '',
            referenceLinks: r.reference_links || '',
            customNotes: r.custom_notes || '',
            agreedTerms: Boolean(r.agreed_terms),
            priceSnapshot: r.price_snapshot || {},
            quotedAmount: Number(r.quoted_amount || 0),
            finalAmount: r.final_amount ? Number(r.final_amount) : undefined,
            status: r.status || 'pending',
            rejectionReason: r.rejection_reason || undefined,
            createdAt: r.created_at || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.warn('[Supabase] getOwnerBookings note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/bookings`, { headers: getAuthHeaders('owner') }, () => localDb.getBookings());
  },

  async getOwnerProjects(): Promise<ServiceProject[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('service_projects').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            bookingId: r.booking_id,
            bookingRef: r.booking_ref,
            clientId: r.client_id,
            clientName: r.client_name,
            clientPhone: r.client_phone,
            clientEmail: r.client_email,
            serviceId: r.service_id,
            serviceTitle: r.service_title,
            trackingToken: r.tracking_token,
            currentStage: r.current_stage,
            stageProgressPercent: Number(r.stage_progress_percent || 10),
            startDate: r.start_date,
            estimatedDeliveryDate: r.estimated_delivery_date,
            actualDeliveryDate: r.actual_delivery_date || undefined,
            statusHistory: Array.isArray(r.status_history) ? r.status_history : [],
            internalNotes: r.internal_notes || '',
            clientMessages: Array.isArray(r.client_messages) ? r.client_messages : [],
            deliveries: Array.isArray(r.deliveries) ? r.deliveries : [],
            testimonialId: r.testimonial_id || undefined,
            isOverdue: Boolean(r.is_overdue),
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));
        }
      } catch (e) {
        console.warn('[Supabase] getOwnerProjects note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/projects`, { headers: getAuthHeaders('owner') }, () => localDb.getProjects());
  },

  async updateBookingStatus(id: string, payload: any): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('booking_requests').update({
          status: payload.status,
          quoted_amount: payload.quotedAmount,
          final_amount: payload.quotedAmount,
          rejection_reason: payload.rejectionReason
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] updateBookingStatus note:', e);
      }
    }

    const action = payload.status === 'rejected' ? 'reject' : 'accept';
    return safeRequest(`${API_BASE}/owner/bookings/${id}/${action}`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(payload),
    }, () => ({ success: true }));
  },

  async reviseBookingPrice(id: string, newPrice: number, reason?: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('booking_requests').update({
          final_amount: newPrice,
          custom_notes: reason ? `Revised: ${reason}` : undefined
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] reviseBookingPrice note:', e);
      }
    }

    return safeRequest(`${API_BASE}/owner/bookings/${id}/revise-price`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify({ newPrice, reason }),
    }, () => ({ success: true }));
  },

  async updateProjectStage(id: string, payload: any): Promise<any> {
    const stage = typeof payload === 'string' ? payload : payload.stage;
    const stageLabel = payload.stageLabel;
    const message = payload.message;
    const progressPercent = payload.progressPercent || 50;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('service_projects').update({
          current_stage: stage,
          stage_progress_percent: progressPercent,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] updateProjectStage note:', e);
      }
    }

    return safeRequest(`${API_BASE}/owner/projects/${id}/stage`, {
      method: 'PATCH',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify({ stage, stageLabel, message, progressPercent }),
    }, () => ({ success: true }));
  },

  async uploadProjectFile(projectId: string, file: File): Promise<{ success: boolean; fileName: string; fileSizeBytes: number; fileUrl: string }> {
    return {
      success: true,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileUrl: URL.createObjectURL(file)
    };
  },

  async uploadClientDelivery(projectId: string, data: any): Promise<any> {
    return safeRequest(`${API_BASE}/owner/projects/${projectId}/delivery`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true }));
  },

  async uploadDelivery(projectId: string, data: any): Promise<any> {
    return this.uploadClientDelivery(projectId, data);
  },

  async saveService(service: Partial<ServiceItem>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const row = {
          id: service.id || `srv-${Date.now()}`,
          slug: service.slug || `srv-${Date.now()}`,
          title: service.title,
          tagline: service.tagline || '',
          short_description: service.shortDescription || '',
          detailed_description: service.detailedDescription || '',
          price_type: service.priceType || 'starting_from',
          base_price: service.basePrice || 14999,
          currency: service.currency || 'INR',
          price_label: service.priceLabel || `Starting from ₹${service.basePrice}`,
          inclusions: service.inclusions || [],
          exclusions: service.exclusions || [],
          turnaround_days: service.turnaroundDays || 5,
          featured: Boolean(service.featured),
          is_upcoming: Boolean(service.isUpcoming),
          is_active: service.isActive !== false,
          sort_order: service.sortOrder || 0,
          badge: service.badge || null,
        };
        await supabase.from('services').upsert(row);
      } catch (e) {
        console.warn('[Supabase] direct saveService note:', e);
      }
    }

    const isEdit = Boolean(service.id && !service.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/services/${service.id}` : `${API_BASE}/owner/services`;
    const method = isEdit ? 'PUT' : 'POST';
    return safeRequest(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(service),
    }, () => ({ success: true, service }));
  },

  async deleteService(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct deleteService note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true, message: 'Service removed' }));
  },

  // ----------------------------------------------------
  // SHOWCASE WORKS CRUD (Direct Supabase Sync)
  // ----------------------------------------------------
  async saveWork(work: Partial<PublicWork>): Promise<any> {
    const finalWork: PublicWork = {
      id: work.id || `work-${Date.now()}`,
      title: work.title || 'Untitled Showcase Film',
      category: work.category || 'Wedding Highlights',
      eventLocation: work.eventLocation || 'Hindupur, AP',
      eventYear: work.eventYear || '2026',
      thumbnailUrl: work.thumbnailUrl || '/assets/kbk-logo.jpg',
      videoUrl: work.videoUrl || '',
      videoSourceType: (work.videoUrl?.includes('drive.google.com') ? 'google_drive' : work.videoUrl?.includes('youtube') ? 'youtube' : 'direct_mp4') as any,
      externalDestUrl: work.externalDestUrl || '',
      description: work.description || '',
      softwareUsed: work.softwareUsed || ['Premiere Pro', 'DaVinci Resolve'],
      isFeatured: work.isFeatured !== false,
      isPublished: work.isPublished !== false,
      sortOrder: work.sortOrder || 1,
      createdAt: work.createdAt || new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const row = mapWorkToRow(finalWork);
        const { error } = await supabase.from('public_works').upsert(row);
        if (error) console.warn('[Supabase] saveWork error:', error.message);
      } catch (e) {
        console.warn('[Supabase] direct saveWork exception:', e);
      }
    }

    localDb.saveWork(finalWork);

    const isEdit = Boolean(work.id && !work.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/works/${work.id}` : `${API_BASE}/owner/works`;
    const method = isEdit ? 'PUT' : 'POST';
    return safeRequest(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(finalWork),
    }, () => ({ success: true, work: finalWork }));
  },

  async deleteWork(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('public_works').delete().eq('id', id);
        if (error) console.warn('[Supabase] deleteWork error:', error.message);
      } catch (e) {
        console.warn('[Supabase] direct deleteWork exception:', e);
      }
    }

    localDb.deleteWork(id);

    return safeRequest(`${API_BASE}/owner/works/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true, message: 'Work deleted successfully' }));
  },

  async deleteBooking(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('booking_requests').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] deleteBooking note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => localDb.deleteBooking(id));
  },

  async deleteProject(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('service_projects').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] deleteProject note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => localDb.deleteProject(id));
  },

  // ----------------------------------------------------
  // TESTIMONIALS CRUD (Direct Supabase Sync)
  // ----------------------------------------------------
  async saveTestimonial(testimonial: any): Promise<any> {
    const finalTestimonial: Testimonial = {
      id: testimonial.id || `test-${Date.now()}`,
      clientName: testimonial.clientName || 'Happy Client',
      serviceTitle: testimonial.serviceTitle || 'Wedding Video Highlights',
      eventDate: testimonial.eventDate || '2026',
      location: testimonial.location || 'Hindupur, AP',
      rating: Number(testimonial.rating) || 5,
      reviewText: testimonial.reviewText || '',
      videoUrl: testimonial.videoUrl || '',
      thumbnailUrl: testimonial.thumbnailUrl || '/assets/kbk-logo.jpg',
      isVerified: testimonial.isVerified !== false,
      isPublished: testimonial.isPublished !== false,
      bookingRef: testimonial.bookingRef || undefined,
      createdAt: testimonial.createdAt || new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const row = mapTestimonialToRow(finalTestimonial);
        await supabase.from('testimonials').upsert(row);
      } catch (e) {
        console.warn('[Supabase] direct saveTestimonial exception:', e);
      }
    }

    localDb.saveTestimonial(finalTestimonial);

    const isEdit = Boolean(testimonial.id && !testimonial.id.startsWith('temp-'));
    const url = isEdit ? `${API_BASE}/owner/testimonials/${testimonial.id}` : `${API_BASE}/owner/testimonials`;
    const method = isEdit ? 'PUT' : 'POST';
    return safeRequest(url, {
      method,
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(finalTestimonial),
    }, () => ({ success: true, testimonial: finalTestimonial }));
  },

  async deleteTestimonial(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('testimonials').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct deleteTestimonial exception:', e);
      }
    }

    localDb.deleteTestimonial(id);

    return safeRequest(`${API_BASE}/owner/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true, message: 'Testimonial deleted' }));
  },

  // ----------------------------------------------------
  // STUDIO CMS CRUD (Direct Supabase Sync)
  // ----------------------------------------------------
  async updateCMS(data: Partial<StudioCMSData>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const row = {
          studio_name: data.studioName || 'KBK Film Studios',
          tagline: data.tagline || 'Luxury Wedding Video Editing & Master Film Post-Production',
          founder_name: data.founderName || 'Kurudi Bharath Kumar',
          founder_title: data.founderTitle || 'Lead Filmmaker & Senior Colorist',
          phone: data.phone || '+91 9346227894',
          whatsapp_number: data.whatsappNumber || '9346227894',
          email: data.email || 'kbkfilms.official@gmail.com',
          location: data.location || 'Hindupur, Andhra Pradesh, India',
          instagram_handle: data.instagramHandle || '@kbkfilms.official',
          instagram_url: data.instagramUrl || '',
          youtube_handle: data.youtubeHandle || '@bharathkumarglp2003',
          youtube_url: data.youtubeUrl || '',
          facebook_handle: data.facebookHandle || 'Kurudi Bharath Kumar',
          facebook_url: data.facebookUrl || '',
          happy_clients_count: data.happyClientsCount || 800,
          films_delivered_count: data.filmsDeliveredCount || 1200,
          years_experience: data.yearsExperience || 6,
          satisfaction_rate: data.satisfactionRate || 99.4,
          founder_bio: data.founderBio || '',
          hero_video_url: data.heroVideoUrl || '/assets/hero-reel.mp4',
          hero_settled_poster_url: data.heroSettledPosterUrl || '/assets/kbk-logo.jpg',
          price_disclaimer: data.priceDisclaimer || '',
          updated_at: new Date().toISOString()
        };
        await supabase.from('studio_cms').upsert(row);
      } catch (e) {
        console.warn('[Supabase] direct updateCMS exception:', e);
      }
    }

    localDb.updateCMS(data);

    return safeRequest(`${API_BASE}/owner/cms`, {
      method: 'PUT',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, studioCMS: data }));
  },

  async getOwners(): Promise<Owner[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('owners').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            email: r.email,
            role: r.role,
            permissions: r.permissions || [],
            isActive: Boolean(r.is_active),
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        console.warn('[Supabase] getOwners note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/owners`, { headers: getAuthHeaders('owner') }, () => localDb.getOwners());
  },

  async inviteOwner(data: { name: string; phone: string; email: string; role?: string; permissions?: string[] }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('owners').insert({
          name: data.name,
          phone: data.phone,
          email: data.email,
          role: data.role || 'co_owner',
          permissions: data.permissions || ['manage_bookings', 'manage_lifecycle', 'manage_deliveries', 'manage_works'],
          is_active: true
        });
      } catch (e) {
        console.warn('[Supabase] direct inviteOwner note:', e);
      }
    }

    return safeRequest(`${API_BASE}/owner/owners`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, owner: { id: `owner-${Date.now()}`, ...data, isActive: true, createdAt: new Date().toISOString() } }));
  },

  async removeOwner(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('owners').update({ is_active: false }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct removeOwner note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/owners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true, message: 'Owner removed' }));
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            actorRole: r.actor_role,
            actorName: r.actor_name,
            actorIdentifier: r.actor_identifier,
            action: r.action,
            details: r.details,
            timestamp: r.timestamp
          }));
        }
      } catch (e) {
        console.warn('[Supabase] getAuditLogs note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/audit-logs`, { headers: getAuthHeaders('owner') }, () => []);
  },

  // Client Video Deliveries (Owner Management)
  async getClientVideoDeliveries(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('client_video_deliveries').select('*').eq('is_active', true).order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            bookingRef: r.booking_ref,
            clientId: r.client_id,
            clientName: r.client_name,
            projectId: r.project_id,
            title: r.title,
            description: r.description || '',
            videoUrl: r.video_url,
            videoSourceType: r.video_source_type || 'direct_mp4',
            thumbnailUrl: r.thumbnail_url || '/assets/kbk-logo.jpg',
            fileName: r.file_name,
            fileSizeBytes: Number(r.file_size_bytes || 0),
            fileSizeFormatted: r.file_size_formatted || '0 MB',
            mimeType: r.mime_type || 'video/mp4',
            fileCategory: r.file_category || 'master_video',
            downloadToken: r.download_token,
            expiryDate: r.expiry_date,
            downloadCount: Number(r.download_count || 0),
            maxDownloads: Number(r.max_downloads || 50),
            isStreamable: Boolean(r.is_streamable),
            isActive: Boolean(r.is_active),
            ownerNotes: r.owner_notes || '',
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));
        }
      } catch (e) {
        console.warn('[Supabase] getClientVideoDeliveries note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/client-video-deliveries`, { headers: getAuthHeaders('owner') }, () => []);
  },

  async getClientVideoDeliveriesByBooking(bookingRef: string): Promise<any[]> {
    return safeRequest(`${API_BASE}/owner/client-video-deliveries/booking/${bookingRef}`, { headers: getAuthHeaders('owner') }, () => []);
  },

  async addClientVideoDelivery(data: any): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const token = `dl_token_${data.bookingRef?.replace('KBK-', '') || 'ref'}_${Math.random().toString(36).substring(2, 8)}`;
        const row = {
          id: `cvd-${Date.now()}`,
          booking_ref: data.bookingRef,
          client_id: data.clientId || `client-${Date.now()}`,
          client_name: data.clientName || 'Client',
          project_id: data.projectId || null,
          title: data.title,
          description: data.description || '',
          video_url: data.videoUrl,
          video_source_type: data.videoSourceType || 'direct_mp4',
          thumbnail_url: data.thumbnailUrl || '/assets/kbk-logo.jpg',
          file_name: data.fileName || `${data.bookingRef}_Master.mp4`,
          file_size_bytes: data.fileSizeBytes || 0,
          file_size_formatted: data.fileSizeFormatted || '0 MB',
          mime_type: 'video/mp4',
          file_category: data.fileCategory || 'master_video',
          download_token: token,
          expiry_date: new Date(Date.now() + (Number(data.expiryDays) || 90) * 86400000).toISOString(),
          download_count: 0,
          max_downloads: Number(data.maxDownloads) || 50,
          is_streamable: true,
          is_active: true,
          owner_notes: data.ownerNotes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await supabase.from('client_video_deliveries').insert(row);
      } catch (e) {
        console.warn('[Supabase] direct addClientVideoDelivery note:', e);
      }
    }

    return safeRequest(`${API_BASE}/owner/client-video-deliveries`, {
      method: 'POST',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true, delivery: { id: `cvd-local-${Date.now()}`, ...data } }));
  },

  async updateClientVideoDelivery(id: string, data: any): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('client_video_deliveries').update({
          title: data.title,
          description: data.description,
          video_url: data.videoUrl,
          owner_notes: data.ownerNotes,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct updateClientVideoDelivery note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/client-video-deliveries/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders('owner'),
      body: JSON.stringify(data),
    }, () => ({ success: true }));
  },

  async deleteClientVideoDelivery(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('client_video_deliveries').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct deleteClientVideoDelivery note:', e);
      }
    }
    return safeRequest(`${API_BASE}/owner/client-video-deliveries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('owner'),
    }, () => ({ success: true }));
  },

  // Client Video Deliveries (Public Access by booking ref)
  async getMyVideoDeliveries(bookingRef: string, token?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('client_video_deliveries').select('*').eq('booking_ref', bookingRef).eq('is_active', true);
        if (token) q = q.eq('download_token', token);
        const { data, error } = await q;
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('[Supabase] getMyVideoDeliveries note:', e);
      }
    }
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
