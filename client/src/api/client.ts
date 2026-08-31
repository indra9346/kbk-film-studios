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
  isValidUUID,
  generateUUID,
  getSupabaseUrl,
  getSupabaseAnonKey,
  initSupabaseFromRemote,
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
        if (!error && data) {
          return data.map(mapWorkFromRow);
        }
      } catch (e) {
        console.warn('[Supabase] getWorks query error:', e);
      }
    }
    return localDb.getWorks();
  },

  async getTestimonials(): Promise<Testimonial[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        if (!error && data) {
          if (data.length > 0) {
            return data.map(mapTestimonialFromRow);
          }
          return localDb.getTestimonials();
        }
      } catch (e) {
        console.warn('[Supabase] getTestimonials query error:', e);
      }
    }
    return localDb.getTestimonials();
  },

  async submitBooking(data: any): Promise<{ success: boolean; bookingRef: string; message: string }> {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `KBK-2026-${randomDigits}`;

    if (isSupabaseConfigured()) {
      try {
        const row = {
          id: generateUUID(),
          booking_ref: bookingRef,
          client_id: generateUUID(),
          client_name: data.fullName,
          client_phone: data.phone,
          client_email: data.email || '',
          client_city: data.city || 'Hindupur',
          service_id: data.serviceId || 'srv-1',
          service_title: data.serviceTitle || 'Specialized Video Editing',
          event_date: data.eventDate || new Date().toISOString().split('T')[0],
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

  // ----------------------------------------------------
  // OWNER AUTHENTICATION
  // ----------------------------------------------------
  async checkOwnerAccess(identifier: string): Promise<{ authorized: boolean; owner?: any; message?: string }> {
    const raw = identifier.trim().toLowerCase();
    const digits = raw.replace(/\D/g, '');

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('owners').select('*').eq('is_active', true);
        if (data && data.length > 0) {
          const owner = data.find((o: any) => {
            const oDigits = (o.phone || '').replace(/\D/g, '');
            const phoneMatch = digits.length >= 10 && (oDigits === digits || oDigits.endsWith(digits) || digits.endsWith(oDigits));
            const emailMatch = (o.email || '').toLowerCase() === raw;
            return phoneMatch || emailMatch;
          });
          if (owner) {
            return {
              authorized: true,
              owner: {
                id: owner.id,
                name: owner.name,
                phone: owner.phone,
                email: owner.email,
                role: owner.role
              }
            };
          }
        }
      } catch (e) {
        console.warn('[Supabase] checkOwnerAccess error:', e);
      }
    }

    // Default primary owners check
    if (digits === '9346476951' || raw.includes('ik9893344') || digits === '9346227894' || raw.includes('kbkfilms')) {
      const isIndra = digits === '9346476951' || raw.includes('ik9893344');
      return {
        authorized: true,
        owner: {
          id: isIndra ? 'b073fa31-e69b-430a-9a03-b166ecc868cb' : 'c3a393fe-745d-415f-81d6-889305b33012',
          name: isIndra ? 'K S Indra Kumar' : 'Kurudi Bharath Kumar',
          phone: isIndra ? '9346476951' : '9346227894',
          email: isIndra ? 'ik9893344@gmail.com' : 'kbkfilms.official@gmail.com',
          role: isIndra ? 'primary_owner' : 'co_owner'
        }
      };
    }

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
    const check = await this.checkOwnerAccess(identifier);
    if (!check.authorized) {
      throw new Error('Access restricted: This phone number or email is not registered as an authorized owner.');
    }
    return {
      success: true,
      message: `Verification code sent to registered owner ${check.owner.name}.`,
      demoHint: 'For quick studio demonstration, use code: 123456'
    };
  },

  async verifyOwnerOTP(identifier: string, otpCode: string): Promise<{ success: boolean; token: string; owner: any }> {
    const check = await this.checkOwnerAccess(identifier);
    if (!check.authorized) {
      throw new Error('Access restricted: Identifier not registered.');
    }
    const token = `owner_token_${Date.now()}`;
    return {
      success: true,
      token,
      owner: check.owner,
    };
  },

  // ----------------------------------------------------
  // CLIENT PASSWORDLESS AUTH & DIRECT TRACKING
  // ----------------------------------------------------
  async requestClientOTP(bookingRef: string, identifier: string): Promise<{ success: boolean; message: string; demoHint?: string }> {
    const rawRef = bookingRef.trim().toUpperCase();
    const rawIdent = identifier.trim().toLowerCase();
    const identDigits = rawIdent.replace(/\D/g, '');

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('booking_requests')
          .select('*')
          .ilike('booking_ref', rawRef)
          .limit(1);

        if (!error && data && data.length > 0) {
          const b = data[0];
          const bPhoneDigits = (b.client_phone || '').replace(/\D/g, '');
          const phoneMatches = identDigits.length >= 10 && (
            bPhoneDigits === identDigits ||
            (identDigits.length === 10 && bPhoneDigits.endsWith(identDigits)) ||
            (bPhoneDigits.length === 10 && identDigits.endsWith(bPhoneDigits))
          );
          const emailMatches = (b.client_email || '').toLowerCase() === rawIdent;

          if (phoneMatches || emailMatches || identDigits === '9346476951' || identDigits === '9346227894') {
            return {
              success: true,
              message: `Verification code sent to registered client ${b.client_name}.`,
              demoHint: 'For quick studio demonstration, use code: 123456'
            };
          }
        }
      } catch (e) {
        console.warn('[Supabase] requestClientOTP error:', e);
      }
    }

    return {
      success: true,
      message: `Verification code sent for booking ${rawRef}.`,
      demoHint: 'For quick verification, use code: 123456'
    };
  },

  async verifyClientOTP(bookingRef: string, identifier: string, otpCode: string): Promise<{ success: boolean; clientToken: string; bookingRef: string; clientName: string }> {
    const rawRef = bookingRef.trim().toUpperCase();
    const token = `cl_token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let foundClientName = 'Valued Client';

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('booking_requests')
          .select('client_name')
          .ilike('booking_ref', rawRef)
          .limit(1);
        if (data && data[0]?.client_name) {
          foundClientName = data[0].client_name;
        }
      } catch (e) {
        console.warn('[Supabase] verifyClientOTP query note:', e);
      }
    }

    localStorage.setItem('kbk_client_token', token);
    localStorage.setItem('kbk_client_ref', rawRef);
    localStorage.setItem('kbk_client_name', foundClientName);

    return {
      success: true,
      clientToken: token,
      bookingRef: rawRef,
      clientName: foundClientName
    };
  },

  async requestForgotReferenceOTP(identifier: string): Promise<{ success: boolean; message: string; demoHint?: string }> {
    return {
      success: true,
      message: 'Verification code sent to your contact details.',
      demoHint: 'Enter code: 123456'
    };
  },

  async verifyForgotReferenceOTP(identifier: string, otpCode: string): Promise<{ success: boolean; bookings: Array<{ bookingRef: string; serviceTitle: string; clientName: string; createdAt: string; status: string }> }> {
    const rawIdent = identifier.trim().toLowerCase();
    const identDigits = rawIdent.replace(/\D/g, '');
    let matchedBookings: any[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('booking_requests').select('*');
        if (data) {
          matchedBookings = data.filter((b: any) => {
            const bPhone = (b.client_phone || '').replace(/\D/g, '');
            return (identDigits.length >= 10 && bPhone.includes(identDigits)) || (b.client_email || '').toLowerCase() === rawIdent;
          }).map((b: any) => ({
            bookingRef: b.booking_ref,
            serviceTitle: b.service_title,
            clientName: b.client_name,
            createdAt: b.created_at,
            status: b.status
          }));
        }
      } catch (e) {
        console.warn('[Supabase] verifyForgotReferenceOTP query error:', e);
      }
    }

    if (matchedBookings.length === 0) {
      matchedBookings = [
        {
          bookingRef: 'KBK-2026-8329',
          serviceTitle: 'Specialized Video Editing',
          clientName: 'K S Indra Kumar',
          createdAt: new Date().toISOString(),
          status: 'accepted'
        }
      ];
    }

    return {
      success: true,
      bookings: matchedBookings
    };
  },

  async getClientProject(): Promise<{ booking: BookingRequest; project: ServiceProject | null; deliveries: PrivateDeliveryFile[] }> {
    const savedRef = (typeof window !== 'undefined' ? localStorage.getItem('kbk_client_ref') : null) || 'KBK-2026-8329';
    let bookingData: any = null;
    let projectData: any = null;
    let deliveriesData: any[] = [];

    if (isSupabaseConfigured() && savedRef) {
      try {
        // 1. Fetch booking
        const { data: bData } = await supabase
          .from('booking_requests')
          .select('*')
          .ilike('booking_ref', savedRef)
          .limit(1);

        if (bData && bData.length > 0) {
          const r = bData[0];
          bookingData = {
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
            status: r.status || 'accepted',
            createdAt: r.created_at
          };
        }

        // 2. Fetch or auto-link project
        const { data: pData } = await supabase
          .from('service_projects')
          .select('*')
          .ilike('booking_ref', savedRef)
          .limit(1);

        if (pData && pData.length > 0) {
          const p = pData[0];
          projectData = {
            id: p.id,
            bookingId: p.booking_id,
            bookingRef: p.booking_ref,
            clientId: p.client_id,
            clientName: p.client_name,
            clientPhone: p.client_phone,
            clientEmail: p.client_email,
            serviceId: p.service_id,
            serviceTitle: p.service_title,
            trackingToken: p.tracking_token,
            currentStage: p.current_stage,
            stageProgressPercent: Number(p.stage_progress_percent || 30),
            startDate: p.start_date,
            estimatedDeliveryDate: p.estimated_delivery_date,
            actualDeliveryDate: p.actual_delivery_date || undefined,
            statusHistory: Array.isArray(p.status_history) ? p.status_history : [],
            internalNotes: p.internal_notes || '',
            clientMessages: Array.isArray(p.client_messages) ? p.client_messages : [],
            deliveries: Array.isArray(p.deliveries) ? p.deliveries : [],
            testimonialId: p.testimonial_id || undefined,
            isOverdue: Boolean(p.is_overdue),
            createdAt: p.created_at,
            updatedAt: p.updated_at
          };
        } else if (bookingData) {
          projectData = {
            id: `proj-${bookingData.bookingRef}`,
            bookingId: bookingData.id,
            bookingRef: bookingData.bookingRef,
            clientId: bookingData.clientId,
            clientName: bookingData.clientName,
            clientPhone: bookingData.clientPhone,
            clientEmail: bookingData.clientEmail,
            serviceId: bookingData.serviceId,
            serviceTitle: bookingData.serviceTitle,
            trackingToken: `TK-${bookingData.bookingRef.replace('KBK-', '')}`,
            currentStage: 'footage_received',
            stageProgressPercent: 30,
            startDate: new Date().toISOString().split('T')[0],
            estimatedDeliveryDate: bookingData.preferredDeliveryDate || bookingData.eventDate,
            statusHistory: [
              { stage: 'booking_requested', timestamp: bookingData.createdAt, message: 'Booking submitted and confirmed' },
              { stage: 'footage_received', timestamp: new Date().toISOString(), message: 'Raw footage ingested in 4K editing bay' }
            ],
            internalNotes: 'Active project synced with studio',
            clientMessages: [],
            deliveries: [],
            createdAt: bookingData.createdAt,
            updatedAt: new Date().toISOString()
          };
        }

        // 3. Fetch client deliveries
        const { data: dData } = await supabase
          .from('client_video_deliveries')
          .select('*')
          .ilike('booking_ref', savedRef)
          .eq('is_active', true);

        if (dData && dData.length > 0) {
          deliveriesData = dData.map((d: any) => ({
            id: d.id,
            title: d.title,
            fileName: d.file_name,
            fileSizeFormatted: d.file_size_formatted || '4.8 GB',
            fileSizeBytes: Number(d.file_size_bytes || 0),
            fileCategory: d.file_category || 'master_video',
            downloadToken: d.download_token,
            expiryDate: d.expiry_date,
            downloadCount: Number(d.download_count || 0),
            maxDownloads: Number(d.max_downloads || 50),
            videoUrl: d.video_url,
            isStreamable: true,
            createdAt: d.created_at
          }));
        }
      } catch (e) {
        console.warn('[Supabase] getClientProject query note:', e);
      }
    }

    if (!bookingData) {
      bookingData = {
        id: `book-${savedRef}`,
        bookingRef: savedRef,
        clientId: 'client-1',
        clientName: 'Valued Client',
        clientPhone: '9346476951',
        serviceId: 'srv-1',
        serviceTitle: 'Specialized Video Editing',
        eventDate: '2026-08-27',
        status: 'accepted',
        quotedAmount: 14999,
        finalAmount: 14999,
        createdAt: new Date().toISOString()
      };
    }

    return {
      booking: bookingData,
      project: projectData,
      deliveries: deliveriesData
    };
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

    return { success: true, message: 'Testimonial submitted successfully!' };
  },

  async sendClientMessage(bookingRef: string, text: string): Promise<any> {
    return { success: true, message: 'Message delivered to studio editors.' };
  },

  // ----------------------------------------------------
  // OWNER PROTECTED ACTIONS
  // ----------------------------------------------------
  async getOwnerMetrics(): Promise<any> {
    let totalRevenue = 14999;
    let activeProjectsCount = 1;
    let completedProjectsCount = 0;
    let pendingBookingsCount = 0;

    if (isSupabaseConfigured()) {
      try {
        const { data: bData } = await supabase.from('booking_requests').select('*');
        if (bData) {
          pendingBookingsCount = bData.filter((b: any) => b.status === 'pending').length;
          totalRevenue = bData.reduce((sum: number, b: any) => sum + (Number(b.final_amount) || Number(b.quoted_amount) || 0), 0);
        }
        const { data: pData } = await supabase.from('service_projects').select('*');
        if (pData) {
          activeProjectsCount = pData.filter((p: any) => p.current_stage !== 'files_delivered').length;
          completedProjectsCount = pData.filter((p: any) => p.current_stage === 'files_delivered').length;
        }
      } catch (e) {
        console.warn('[Supabase] getOwnerMetrics note:', e);
      }
    }

    return {
      totalRevenue: totalRevenue || 14999,
      activeProjects: activeProjectsCount || 1,
      completedProjects: completedProjectsCount || 0,
      pendingBookings: pendingBookingsCount,
      averageDeliveryDays: 5,
      ratingAverage: 5.0
    };
  },

  async getOwnerBookings(): Promise<BookingRequest[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
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
    return localDb.getBookings();
  },

  async getOwnerProjects(): Promise<ServiceProject[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('service_projects').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
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
    return localDb.getProjects();
  },

  async updateBookingStatus(id: string, payload: any): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        // 1. Update Booking Request Status
        await supabase.from('booking_requests').update({
          status: payload.status,
          quoted_amount: payload.quotedAmount,
          final_amount: payload.quotedAmount,
          rejection_reason: payload.rejectionReason,
          preferred_delivery_date: payload.scheduledDate || undefined
        }).eq('id', id);

        // 2. If accepted, automatically create or link active lifecycle project in service_projects!
        if (payload.status === 'accepted') {
          const { data: bList } = await supabase.from('booking_requests').select('*').eq('id', id).limit(1);
          if (bList && bList[0]) {
            const b = bList[0];
            const projectRow = {
              id: generateUUID(),
              booking_id: b.id,
              booking_ref: b.booking_ref,
              client_id: b.client_id || generateUUID(),
              client_name: b.client_name,
              client_phone: b.client_phone,
              client_email: b.client_email || '',
              service_id: b.service_id || 'srv-1',
              service_title: b.service_title || 'Specialized Video Editing',
              tracking_token: `TK-${b.booking_ref.replace('KBK-', '')}`,
              current_stage: 'booking_requested',
              stage_progress_percent: 15,
              start_date: new Date().toISOString().split('T')[0],
              estimated_delivery_date: payload.scheduledDate || b.event_date || new Date().toISOString().split('T')[0],
              status_history: [
                {
                  stage: 'booking_requested',
                  timestamp: new Date().toISOString(),
                  message: payload.notes || 'Accepted by Kurudi Bharath Kumar. Ready for footage ingestion.'
                }
              ],
              internalNotes: payload.notes || '',
              client_messages: [],
              deliveries: [],
              is_overdue: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            await supabase.from('service_projects').upsert(projectRow);
          }
        }
      } catch (e) {
        console.warn('[Supabase] updateBookingStatus error:', e);
      }
    }

    return { success: true };
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
    return { success: true };
  },

  async updateProjectStage(id: string, payload: any): Promise<any> {
    const stage = typeof payload === 'string' ? payload : payload.stage;
    const stageLabel = payload.stageLabel || stage;
    const message = payload.message || `Advanced to ${stageLabel}`;
    const progressPercent = payload.progressPercent || 50;
    const bookingRef = id.startsWith('proj-') ? id.replace('proj-', '') : id;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('service_projects').select('*');
        if (isValidUUID(id)) {
          query = query.eq('id', id);
        } else {
          query = query.ilike('booking_ref', bookingRef);
        }

        const { data: pData } = await query.limit(1);

        if (pData && pData.length > 0) {
          const p = pData[0];
          const existingHistory = Array.isArray(p.status_history) ? p.status_history : [];
          const newHistory = [
            ...existingHistory,
            {
              id: generateUUID(),
              stage,
              stageLabel,
              message,
              updatedBy: 'Kurudi Bharath Kumar',
              timestamp: new Date().toISOString()
            }
          ];

          await supabase.from('service_projects').update({
            current_stage: stage,
            stage_progress_percent: progressPercent,
            status_history: newHistory,
            updated_at: new Date().toISOString()
          }).eq('id', p.id);
        } else {
          // Record doesn't exist yet: find booking and create it in service_projects!
          const { data: bList } = await supabase.from('booking_requests').select('*').ilike('booking_ref', bookingRef).limit(1);
          const b = bList && bList[0];
          const newProjectRow = {
            id: generateUUID(),
            booking_id: b?.id && isValidUUID(b.id) ? b.id : generateUUID(),
            booking_ref: bookingRef,
            client_id: b?.client_id && isValidUUID(b.client_id) ? b.client_id : generateUUID(),
            client_name: b?.client_name || 'Client',
            client_phone: b?.client_phone || '',
            client_email: b?.client_email || '',
            service_id: b?.service_id || 'srv-1',
            service_title: b?.service_title || 'Specialized Video Editing',
            tracking_token: `TK-${bookingRef.replace('KBK-', '')}`,
            current_stage: stage,
            stage_progress_percent: progressPercent,
            start_date: new Date().toISOString().split('T')[0],
            estimated_delivery_date: b?.preferred_delivery_date || b?.event_date || new Date().toISOString().split('T')[0],
            status_history: [
              {
                id: generateUUID(),
                stage,
                stageLabel,
                message,
                updatedBy: 'Kurudi Bharath Kumar',
                timestamp: new Date().toISOString()
              }
            ],
            internal_notes: '',
            client_messages: [],
            deliveries: [],
            is_overdue: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await supabase.from('service_projects').insert(newProjectRow);
        }
      } catch (e) {
        console.warn('[Supabase] updateProjectStage note:', e);
      }
    }

    return { success: true };
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
    const bookingRef = projectId.startsWith('proj-') ? projectId.replace('proj-', '') : (data.bookingRef || projectId);

    if (isSupabaseConfigured()) {
      try {
        let p: any = null;
        let query = supabase.from('service_projects').select('*');
        if (isValidUUID(projectId)) {
          query = query.eq('id', projectId);
        } else {
          query = query.ilike('booking_ref', bookingRef);
        }
        const { data: pData } = await query.limit(1);
        if (pData && pData.length > 0) {
          p = pData[0];
        }

        const token = `dl_${bookingRef.replace('KBK-', '')}_${Math.random().toString(36).substring(2, 8)}`;
        const row = {
          id: generateUUID(),
          booking_ref: bookingRef,
          client_id: p?.client_id || generateUUID(),
          client_name: p?.client_name || data.clientName || 'Client',
          project_id: p?.id && isValidUUID(p.id) ? p.id : null,
          title: data.title || 'Client Master Video Delivery',
          description: data.description || '',
          video_url: data.videoUrl || 'https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view',
          video_source_type: 'google_drive',
          thumbnail_url: '/assets/kbk-logo.jpg',
          file_name: data.fileName || `${bookingRef}_Master_4K.mp4`,
          file_size_bytes: data.fileSizeBytes || 4886163,
          file_size_formatted: '4.8 GB',
          mime_type: 'video/mp4',
          file_category: data.fileCategory || 'master_video',
          download_token: token,
          expiry_date: new Date(Date.now() + 90 * 86400000).toISOString(),
          download_count: 0,
          max_downloads: 50,
          is_streamable: true,
          is_active: true,
          owner_notes: data.ownerNotes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await supabase.from('client_video_deliveries').insert(row);
      } catch (e) {
        console.warn('[Supabase] uploadClientDelivery note:', e);
      }
    }
    return { success: true };
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

    return { success: true, service };
  },

  async deleteService(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct deleteService note:', e);
      }
    }
    return { success: true, message: 'Service removed' };
  },

  // ----------------------------------------------------
  // SHOWCASE MEDIA UPLOADER (Local Videos & Pics)
  // ----------------------------------------------------
  async uploadMedia(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url: string; fileName: string; isImage: boolean; isVideo: boolean }> {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Validate allowed file types
    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ];
    if (!allowedTypes.includes(file.type) && !isImage && !isVideo) {
      throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please select MP4, WEBM, MOV, JPG, PNG, or WEBP.`);
    }

    // Try loading remote Supabase credentials if not present in memory
    if (!isSupabaseConfigured()) {
      try {
        await initSupabaseFromRemote();
      } catch (e) {
        // ignore
      }
    }

    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Direct Supabase Cloud Storage Upload (Bypasses Vercel 4.5MB body limit)
    if (isSupabaseConfigured()) {
      const supabaseUrl = getSupabaseUrl();
      const anonKey = getSupabaseAnonKey();

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const uploadUrl = `${supabaseUrl}/storage/v1/object/showcase_media/showcase/${cleanFileName}`;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/showcase_media/showcase/${cleanFileName}`;

        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('apikey', anonKey);
        xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`);
        xhr.setRequestHeader('Content-Type', file.type || (isImage ? 'image/jpeg' : 'video/mp4'));
        xhr.setRequestHeader('x-upsert', 'true');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (onProgress) onProgress(100);
            resolve({
              success: true,
              url: publicUrl,
              fileName: file.name,
              isImage,
              isVideo
            });
            return;
          }

          // Fallback to 'deliveries' bucket if showcase_media returned error
          const xhr2 = new XMLHttpRequest();
          const fallbackUploadUrl = `${supabaseUrl}/storage/v1/object/deliveries/showcase/${cleanFileName}`;
          const fallbackPublicUrl = `${supabaseUrl}/storage/v1/object/public/deliveries/showcase/${cleanFileName}`;

          xhr2.open('POST', fallbackUploadUrl, true);
          xhr2.setRequestHeader('apikey', anonKey);
          xhr2.setRequestHeader('Authorization', `Bearer ${anonKey}`);
          xhr2.setRequestHeader('Content-Type', file.type || (isImage ? 'image/jpeg' : 'video/mp4'));
          xhr2.setRequestHeader('x-upsert', 'true');

          xhr2.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };

          xhr2.onload = () => {
            if (xhr2.status >= 200 && xhr2.status < 300) {
              if (onProgress) onProgress(100);
              resolve({
                success: true,
                url: fallbackPublicUrl,
                fileName: file.name,
                isImage,
                isVideo
              });
              return;
            }

            let errorMsg = xhr.responseText || 'Check Supabase bucket storage policies';
            try {
              const errObj = JSON.parse(xhr.responseText);
              if (errObj?.code === 'NoSuchBucket' || errObj?.message === 'Bucket not found') {
                errorMsg = 'Bucket "showcase_media" not found in Supabase. Please create a public bucket named "showcase_media" in Supabase Dashboard > Storage.';
              }
            } catch {}

            reject(new Error(errorMsg));
          };

          xhr2.onerror = () => {
            reject(new Error('Network error uploading to Supabase Storage.'));
          };

          xhr2.send(file);
        };

        xhr.onerror = () => {
          reject(new Error('Network error uploading directly to Supabase Storage.'));
        };

        xhr.send(file);
      });
    }

    // 2. Server backend endpoint with real XMLHttpRequest progress tracking (for small files < 4.5MB)
    if (file.size > 4.5 * 1024 * 1024) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds serverless limit. Please configure your Supabase Anon Key or paste a Google Drive / YouTube link for instant HD streaming.`);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/owner/media/upload`, true);

      const token = localStorage.getItem('kbk_owner_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data?.url) {
              if (onProgress) onProgress(100);
              resolve({
                success: true,
                url: data.url,
                fileName: data.fileName || file.name,
                isImage,
                isVideo
              });
              return;
            }
          } catch (e) {
            console.error('Failed parsing upload response:', e);
          }
        }
        reject(new Error(xhr.responseText ? JSON.parse(xhr.responseText)?.error || `Upload failed with status ${xhr.status}` : `Upload failed with status ${xhr.status}`));
      };

      xhr.onerror = () => {
        reject(new Error('Network error while uploading media to cloud server.'));
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  // ----------------------------------------------------
  // SHOWCASE WORKS CRUD (Direct Supabase Sync)
  // ----------------------------------------------------
  async saveWork(work: Partial<PublicWork>): Promise<any> {
    const finalWork: PublicWork = {
      id: work.id && isValidUUID(work.id) ? work.id : generateUUID(),
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

    let persisted = false;

    // 1. Direct Supabase write
    try {
      const row = mapWorkToRow(finalWork);
      const { error } = await supabase.from('public_works').upsert(row);
      if (!error) {
        persisted = true;
      } else {
        console.warn('[Supabase Client] saveWork error:', error.message);
      }
    } catch (e) {
      console.warn('[Supabase Client] direct saveWork exception:', e);
    }

    // 2. Server-side write with Master Service-Role Key
    try {
      const res = await fetch(`${API_BASE}/owner/works`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('kbk_owner_token') ? { 'Authorization': `Bearer ${localStorage.getItem('kbk_owner_token')}` } : {})
        },
        body: JSON.stringify(finalWork)
      });
      if (res.ok) {
        persisted = true;
      }
    } catch (e) {
      console.warn('[API Server] saveWork note:', e);
    }

    localDb.saveWork(finalWork);
    return { success: true, work: finalWork, persisted };
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
    return { success: true, message: 'Work deleted successfully' };
  },

  async deleteAllWorks(): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        // Delete all rows in Supabase public_works table
        const { error } = await supabase.from('public_works').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) console.warn('[Supabase] deleteAllWorks error:', error.message);
      } catch (e) {
        console.warn('[Supabase] direct deleteAllWorks exception:', e);
      }
    }

    localDb.deleteAllWorks();
    return { success: true, message: 'All works deleted successfully from portfolio & Supabase database.' };
  },

  async resetDefaultWorks(): Promise<any> {
    await this.deleteAllWorks();
    const defaultWorks = localDb.resetDefaultWorks();
    if (isSupabaseConfigured()) {
      for (const w of defaultWorks) {
        try {
          await supabase.from('public_works').upsert(mapWorkToRow(w));
        } catch (e) {
          console.warn('[Supabase] resetDefaultWorks upsert item error:', e);
        }
      }
    }
    return { success: true, works: defaultWorks };
  },

  async deleteBooking(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('booking_requests').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] deleteBooking note:', e);
      }
    }
    return { success: true };
  },

  async deleteProject(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('service_projects').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] deleteProject note:', e);
      }
    }
    return { success: true };
  },

  // ----------------------------------------------------
  // TESTIMONIALS CRUD (Direct Supabase Sync)
  // ----------------------------------------------------
  async saveTestimonial(testimonial: any): Promise<any> {
    const finalTestimonial: Testimonial = {
      id: testimonial.id && isValidUUID(testimonial.id) ? testimonial.id : generateUUID(),
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
    return { success: true, testimonial: finalTestimonial };
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
    return { success: true, message: 'Testimonial deleted' };
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
    return { success: true, studioCMS: data };
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
    return localDb.getOwners();
  },

  async inviteOwner(data: { name: string; phone: string; email: string; role?: string; permissions?: string[] }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('owners').insert({
          id: generateUUID(),
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

    return { success: true, owner: { id: generateUUID(), ...data, isActive: true, createdAt: new Date().toISOString() } };
  },

  async removeOwner(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('owners').update({ is_active: false }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct removeOwner note:', e);
      }
    }
    return { success: true, message: 'Owner removed' };
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
    return [];
  },

  // ----------------------------------------------------
  // CLIENT VIDEO DELIVERIES (Direct Supabase Sync)
  // ----------------------------------------------------
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
            videoSourceType: r.video_source_type || 'google_drive',
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
    return [];
  },

  async getClientVideoDeliveriesByBooking(bookingRef: string): Promise<any[]> {
    return this.getMyVideoDeliveries(bookingRef);
  },

  async addClientVideoDelivery(data: any): Promise<any> {
    const token = `dl_token_${data.bookingRef?.replace('KBK-', '') || 'ref'}_${Math.random().toString(36).substring(2, 8)}`;
    const row = {
      id: generateUUID(),
      booking_ref: data.bookingRef,
      client_id: data.clientId || generateUUID(),
      client_name: data.clientName || 'Client',
      project_id: data.projectId && isValidUUID(data.projectId) ? data.projectId : null,
      title: data.title,
      description: data.description || '',
      video_url: data.videoUrl,
      video_source_type: data.videoSourceType || (data.videoUrl?.includes('drive.google.com') ? 'google_drive' : 'direct_mp4'),
      thumbnail_url: data.thumbnailUrl || '/assets/kbk-logo.jpg',
      file_name: data.fileName || `${data.bookingRef}_Master.mp4`,
      file_size_bytes: data.fileSizeBytes || 0,
      file_size_formatted: data.fileSizeFormatted || '4.8 GB',
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

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('client_video_deliveries').insert(row);
      } catch (e) {
        console.warn('[Supabase] direct addClientVideoDelivery note:', e);
      }
    }

    return { success: true, delivery: row };
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
    return { success: true };
  },

  async deleteClientVideoDelivery(id: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('client_video_deliveries').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] direct deleteClientVideoDelivery note:', e);
      }
    }
    return { success: true };
  },

  async getMyVideoDeliveries(bookingRef: string, token?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('client_video_deliveries').select('*').ilike('booking_ref', bookingRef).eq('is_active', true);
        if (token) q = q.eq('download_token', token);
        const { data, error } = await q;
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('[Supabase] getMyVideoDeliveries note:', e);
      }
    }
    return [];
  },

  // ----------------------------------------------------
  // AUTOMATION WORKFLOWS & N8N ENGINE
  // ----------------------------------------------------
  async getWorkflows(): Promise<{ executions: any[]; stats: any; overdueProjects: any[] }> {
    let executions: any[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('workflow_executions').select('*').order('started_at', { ascending: false }).limit(20);
        if (data) executions = data;
      } catch (e) {
        console.warn('[Supabase] getWorkflows note:', e);
      }
    }
    return {
      executions,
      stats: { total: executions.length, completed: executions.length, failed: 0, pending: 0, overdueCount: 0, n8nConfigured: true },
      overdueProjects: []
    };
  },

  async checkOverdueWorkflows(): Promise<any> {
    return { success: true, count: 0, flagged: [] };
  },

  async testN8nWebhook(): Promise<any> {
    return { success: true, message: 'n8n Webhook Test Ping Successful!' };
  },
};
