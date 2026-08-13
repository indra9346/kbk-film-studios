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

interface LocalDBData {
  cms: StudioCMSData;
  services: ServiceItem[];
  works: PublicWork[];
  testimonials: Testimonial[];
  owners: Owner[];
  bookingRequests: BookingRequest[];
  serviceProjects: ServiceProject[];
  privateDeliveries: PrivateDeliveryFile[];
  auditLogs: AuditLog[];
}

const DEFAULT_DB: LocalDBData = {
  cms: {
    studioName: "KBK Film Studios",
    tagline: "Luxury Wedding Video Editing & Master Film Post-Production",
    founderName: "Kurudi Bharath Kumar",
    founderTitle: "Lead Filmmaker & Senior Colorist",
    phone: "+91 9346227894",
    whatsappNumber: "919346227894",
    email: "kbkfilms.official@gmail.com",
    location: "Hindupur, Andhra Pradesh, India",
    instagramHandle: "@kbkfilms.official",
    instagramUrl: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=f5nglc3",
    youtubeHandle: "@bharathkumarglp2003",
    youtubeUrl: "https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX",
    facebookHandle: "Kurudi Bharath Kumar",
    facebookUrl: "https://facebook.com/KurudiBharathKumar",
    happyClientsCount: 800,
    filmsDeliveredCount: 1200,
    yearsExperience: 6,
    satisfactionRate: 99.4,
    founderBio: "Lead Filmmaker & Post-Production Colorist specializing in high-contrast cinematic wedding storytelling, dynamic pace-matching, and same-day on-venue spot edits.",
    educationDetails: {
      degree: "B.Com (Computer Applications)",
      college: "Sri Krishnadevaraya University (SKU)",
      coreHighlights: ["Software & DB Logic", "Multimedia & Audio-Visual Systems", "Business Logistics & Film Distribution"],
      currentPursuit: "MBA (2nd Year, Master of Business Administration)"
    },
    editingSuites: ["DaVinci Resolve Studio", "Adobe Premiere Pro", "After Effects", "FilmConvert Nitrate", "Dehancer Pro"],
    heroVideoUrl: "https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view?usp=drive_link",
    heroSettledPosterUrl: "/assets/kbk-logo.jpg",
    priceDisclaimer: "All prices are base estimates for standard multi-cam ceremonies. Final quotes may adjust slightly based on footage runtime, multi-cam angles, and express delivery requests.",
    termsAndConditions: [
      "25% advance required to lock calendar slot.",
      "Up to 3 complimentary revision rounds included.",
      "Raw footage archives preserved for 60 days following final master sign-off."
    ],
    contactClarificationMsg: "Studio Owner Kurudi Bharath Kumar directly oversees color grading and storyline sequencing for every client."
  },
  services: [
    {
      id: "srv-1",
      slug: "pre-wedding-video-editing",
      title: "Pre-Wedding Video Editing",
      tagline: "Romantic cinematic pacing with bespoke song design & mood color palettes",
      shortDescription: "Bespoke romantic cuts with DaVinci Resolve color grading and custom sound design.",
      detailedDescription: "Full post-production treatment for pre-wedding shoots. Includes multi-camera audio sync, cinematic slow-motion speed ramps, specialized film-look color grading, personalized song mixing, dialogue mastering, and vertical teaser cuts for social media.",
      priceType: "starting_from",
      basePrice: 14999,
      currency: "INR",
      priceLabel: "Starting from ?14,999",
      inclusions: ["Custom Color Grading (DaVinci Resolve)", "Licensed Background Music Sync", "Storyline Narrative Pacing", "Teaser Cut for Instagram (9:16)", "Up to 3 Revision Rounds"],
      exclusions: ["Raw footage shooting", "Drone capture at venue"],
      turnaroundDays: 5,
      featured: true,
      isUpcoming: false,
      isActive: true,
      sortOrder: 1
    },
    {
      id: "srv-2",
      slug: "wedding-video-highlights",
      title: "Wedding Video Highlights (Cinematic Master)",
      tagline: "Full wedding ritual highlights crafted into an emotional 4K keepsake",
      shortDescription: "Comprehensive wedding film editing weaving Muhurtham, Varapooja, and Reception into a 4K narrative.",
      detailedDescription: "Comprehensive wedding film editing that weaves together the bride/groom preparations, Muhurtham, Varapooja, Mangalashtak, and Reception into a seamless, emotionally moving cinematic film.",
      priceType: "starting_from",
      basePrice: 24999,
      currency: "INR",
      priceLabel: "Starting from ?24,999",
      inclusions: ["Complete Muhurtham & Ritual Flow", "Custom Multi-Camera Synchronization (up to 4 cams)", "Emotive Speech/Mantra Audio Clean-up", "Rich Indian Silk Color Science Palette", "Full Length + 3-Min Master Teaser", "Delivered in 4K ProRes & Master MP4"],
      exclusions: ["On-venue physical shooting"],
      turnaroundDays: 7,
      featured: true,
      isUpcoming: false,
      isActive: true,
      sortOrder: 2
    },
    {
      id: "srv-3",
      slug: "haldi-sangeeth-ceremonies",
      title: "Haldi & Sangeeth Ceremonies",
      tagline: "High-energy beat-synced edits for joyful yellow splashes & vibrant dance nights",
      shortDescription: "Dynamic beat-synced rhythm editing for Haldi and Sangeeth ceremonies.",
      detailedDescription: "Dynamic, fast-paced rhythm edits crafted specifically to amplify the festive joy of Haldi and the musical dance power of Sangeeth nights.",
      priceType: "starting_from",
      basePrice: 12999,
      currency: "INR",
      priceLabel: "Starting from ?12,999",
      inclusions: ["High-Energy Beat Transitions", "Punchy Color Vibrance Optimization", "Live Performance Multicam Cut", "Slow Motion Splash Speed Ramps", "Social Reel Cut (9:16) Included"],
      exclusions: ["On-venue shooting"],
      turnaroundDays: 4,
      featured: false,
      isUpcoming: false,
      isActive: true,
      sortOrder: 3
    },
    {
      id: "srv-4",
      slug: "maternity-cradle-ceremonies",
      title: "Maternity & Cradle Ceremonies",
      tagline: "Gentle warm tones and soft-contrast edits celebrating new beginnings",
      shortDescription: "Soft warm contrast edits preserving the beauty of motherhood and baby naming celebrations.",
      detailedDescription: "Warm and tender film editing crafted to preserve the beauty of motherhood and baby naming ceremonies with soft pastel grades and soothing acoustic sound design.",
      priceType: "starting_from",
      basePrice: 9999,
      currency: "INR",
      priceLabel: "Starting from ?9,999",
      inclusions: ["Soft Contrast Skin-Tone Film Looks", "Acoustic Emotional Music Sync", "Family Moments Highlights Cut", "Short Form Social Teaser", "2 Revision Rounds"],
      exclusions: ["Physical photography"],
      turnaroundDays: 4,
      featured: false,
      isUpcoming: false,
      isActive: true,
      sortOrder: 4
    },
    {
      id: "srv-5",
      slug: "spot-editing-same-day",
      title: "Spot Editing (Same-Day On-Venue)",
      tagline: "Live on-venue high-speed editing projected at reception screens that evening",
      shortDescription: "Live high-speed on-venue editing for evening reception LED wall screening.",
      detailedDescription: "KBK Film Studios brings a mobile workstation rig directly to your wedding hall. Morning Muhurtham and rituals are ingested, color-graded, and masterfully edited to be screened before evening reception guests.",
      priceType: "fixed_price",
      basePrice: 19999,
      currency: "INR",
      priceLabel: "?19,999 (Per Event Day)",
      badge: "High Demand",
      inclusions: ["On-Venue Mobile Editing Rig Setup", "Morning Rituals Ingested & Cut by 6:00 PM", "Live Reception LED Screen Export", "Instant Vertical Reel for WhatsApp Status", "Express Turnaround Guarantee"],
      exclusions: ["Projector/LED screen hardware rental"],
      turnaroundDays: 1,
      featured: true,
      isUpcoming: false,
      isActive: true,
      sortOrder: 5
    },
    {
      id: "srv-6",
      slug: "cinematic-teasers-reels",
      title: "Cinematic Teasers & Reels (9:16)",
      tagline: "Viral-ready vertical video cuts tailored for Instagram, YouTube Shorts & WhatsApp",
      shortDescription: "Viral-engineered 9:16 vertical video edits with trending sound design.",
      detailedDescription: "Engineered for viral retention with instant visual hooks, precision sync to trending audio, seamless sound design effects (whooshes, risers), and punchy color grading.",
      priceType: "starting_from",
      basePrice: 4999,
      currency: "INR",
      priceLabel: "Starting from ?4,999",
      inclusions: ["Vertical 9:16 4K Master Render", "Trending Audio Wave Pacing", "Sound Effects & Dynamic Zoom Transitions", "Eye-Catching Color Grading for OLED Phones", "Instant Delivery via WhatsApp / Locker"],
      exclusions: ["Shooting"],
      turnaroundDays: 2,
      featured: false,
      isUpcoming: false,
      isActive: true,
      sortOrder: 6
    }
  ],
  works: [
    {
      id: "work-1",
      title: "RECEPTION VIDEO",
      category: "Wedding Highlights",
      eventLocation: "Hindupur, AP",
      eventYear: "2026",
      thumbnailUrl: "/assets/kbk-logo.jpg",
      videoUrl: "https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view?usp=drive_link",
      videoSourceType: "direct_mp4",
      description: "A cinematic reception video capturing the joy, elegance, and memorable moments of the celebration with smooth transitions, warm tones, and balanced audio.",
      softwareUsed: ["Premiere Pro", "DaVinci Resolve"],
      isFeatured: true,
      isPublished: true,
      sortOrder: 1,
      createdAt: "2026-08-12T17:12:03.187Z"
    },
    {
      id: "work-2",
      title: "MUHURTHAM VIDEO",
      category: "Wedding Highlights",
      eventLocation: "Hindupur, AP",
      eventYear: "2026",
      thumbnailUrl: "/assets/kbk-logo.jpg",
      videoUrl: "https://drive.google.com/file/d/14Oc3e5cNWXMOGIxPXk4V-OlN620eBqWs/view?usp=drive_link",
      videoSourceType: "direct_mp4",
      description: "Sacred Mangalashtak and Muhurtham ceremony film with traditional mantra audio clean-up and gold silk color grading.",
      softwareUsed: ["Premiere Pro", "DaVinci Resolve"],
      isFeatured: true,
      isPublished: true,
      sortOrder: 2,
      createdAt: "2026-08-12T17:12:03.187Z"
    }
  ],
  testimonials: [
    {
      id: "test-1",
      clientName: "Ananya & Rajesh",
      serviceTitle: "Wedding Highlights & Sangeeth",
      location: "Bengaluru",
      rating: 5,
      reviewText: "Kurudi Bharath Kumar transformed our wedding footage into a pure movie! The color grading on our silk sarees and the emotional flow during the Muhurtham made our parents cry with joy. Delivered right on time via private locker.",
      eventDate: "January 2026",
      isVerified: true,
      isPublished: true,
      createdAt: "2026-01-15T00:00:00.000Z"
    },
    {
      id: "test-2",
      clientName: "Vikram & Sneha",
      serviceTitle: "Pre-Wedding & Same-Day Spot Edit",
      location: "Hindupur",
      rating: 5,
      reviewText: "The Same-Day Spot Editing at our reception hall was the biggest highlight of our wedding night. Morning rituals were projected on the LED wall by 7 PM. All our guests were amazed by the speed and cinematic quality!",
      eventDate: "December 2025",
      isVerified: true,
      isPublished: true,
      createdAt: "2025-12-20T00:00:00.000Z"
    }
  ],
  owners: [
    {
      id: "owner-editor",
      name: "KBK Studio Lead Editor",
      phone: "9845012345",
      email: "editor@kbkfilms.com",
      role: "co_owner",
      permissions: ["manage_bookings", "manage_lifecycle", "manage_deliveries", "manage_works"],
      isActive: true,
      createdAt: "2026-02-01T00:00:00Z"
    },
    {
      id: "owner-indra",
      name: "K S Indra Kumar",
      phone: "9346476951",
      email: "ik9893344@gmail.com",
      role: "primary_owner",
      permissions: ["all", "manage_owners", "manage_pricing", "manage_cms", "manage_deliveries"],
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z"
    },
    {
      id: "owner-bharath",
      name: "Kurudi Bharath Kumar",
      phone: "9346227894",
      email: "kbkfilms.official@gmail.com",
      role: "co_owner",
      permissions: ["manage_bookings", "manage_lifecycle", "manage_deliveries", "manage_works", "manage_pricing", "manage_cms"],
      isActive: true,
      createdAt: "2026-08-13T06:38:57.015Z"
    }
  ],
  bookingRequests: [],
  serviceProjects: [],
  privateDeliveries: [],
  auditLogs: []
};

const STORAGE_KEY = 'kbk_local_database_v1';

function getDB(): LocalDBData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
      return DEFAULT_DB;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_DB;
  }
}

function saveDB(data: LocalDBData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local database:', e);
  }
}

export const localDb = {
  getCMS(): StudioCMSData {
    return getDB().cms;
  },
  getServices(): ServiceItem[] {
    return getDB().services;
  },
  getWorks(): PublicWork[] {
    return getDB().works;
  },
  getTestimonials(): Testimonial[] {
    return getDB().testimonials;
  },
  getOwners(): Owner[] {
    return getDB().owners;
  },
  getBookings(): BookingRequest[] {
    return getDB().bookingRequests;
  },
  getProjects(): ServiceProject[] {
    return getDB().serviceProjects;
  },
  getDeliveries(): PrivateDeliveryFile[] {
    return getDB().privateDeliveries;
  },

  checkOwnerAccess(identifier: string): { authorized: boolean; owner?: any; message?: string } {
    const db = getDB();
    const raw = identifier.trim().toLowerCase();
    const digitsOnly = raw.replace(/\D/g, '');

    // Developer root credentials cannot be unlocked from public footer
    if (digitsOnly.endsWith('9346476951') || raw === 'ik9893344@gmail.com') {
      return {
        authorized: false,
        message: 'Access Restricted: Developer root credentials (9346476951) cannot be unlocked via public footer field. Developer must authenticate via the Developer Portfolio Management Console.'
      };
    }

    const owner = db.owners.find(o => {
      if (o.isActive === false) return false;
      if (o.role === 'primary_owner' || o.phone === '9346476951') return false;

      const ownerDigits = (o.phone || '').replace(/\D/g, '');
      const matchesPhone = digitsOnly.length >= 10 && (
        ownerDigits === digitsOnly ||
        (digitsOnly.length === 10 && ownerDigits.endsWith(digitsOnly)) ||
        (ownerDigits.length === 10 && digitsOnly.endsWith(ownerDigits))
      );
      const matchesEmail = (o.email || '').toLowerCase() === raw;
      return matchesPhone || matchesEmail;
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

    return {
      authorized: false,
      message: 'Access restricted: This phone number or email is not registered as an authorized studio administrator. Access must be granted by Developer K S Indra Kumar via the Developer Portfolio Management Console.'
    };
  },

  submitBooking(data: any): { success: boolean; bookingRef: string; message: string } {
    const db = getDB();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `KBK-2026-${randomDigits}`;
    const service = db.services.find(s => s.id === data.serviceId) || db.services[0];

    const booking: BookingRequest = {
      id: `book-${Date.now()}`,
      bookingRef,
      clientId: `client-${Date.now()}`,
      clientName: data.fullName || 'Client',
      clientPhone: data.phone || '',
      clientEmail: data.email || '',
      clientCity: data.city || 'Hindupur',
      serviceId: service.id,
      serviceTitle: service.title,
      eventDate: data.eventDate || new Date().toISOString().split('T')[0],
      preferredDeliveryDate: data.preferredDeliveryDate || '',
      budgetRange: data.budgetRange || `?${service.basePrice.toLocaleString('en-IN')}`,
      footageDetails: data.footageDetails || '',
      referenceLinks: data.referenceLinks || '',
      customNotes: data.customNotes || '',
      agreedTerms: Boolean(data.agreedTerms),
      priceSnapshot: {
        serviceId: service.id,
        serviceTitle: service.title,
        priceType: service.priceType,
        basePrice: service.basePrice,
        currency: service.currency,
        priceLabel: service.priceLabel,
        inclusions: [...service.inclusions],
        exclusions: [...service.exclusions],
        turnaroundDays: service.turnaroundDays,
        snapshotDate: new Date().toISOString()
      },
      quotedAmount: service.basePrice,
      finalAmount: service.basePrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.bookingRequests.unshift(booking);
    saveDB(db);

    return {
      success: true,
      bookingRef,
      message: 'Booking request submitted successfully! Kurudi Bharath Kumar has been notified.'
    };
  },

  deleteBooking(id: string): { success: boolean; message: string } {
    const db = getDB();
    const index = db.bookingRequests.findIndex(b => b.id === id || b.bookingRef === id);
    if (index !== -1) {
      const removed = db.bookingRequests.splice(index, 1)[0];
      db.serviceProjects = db.serviceProjects.filter(p => p.bookingId !== removed.id && p.bookingRef !== removed.bookingRef);
      saveDB(db);
    }
    return { success: true, message: 'Booking request and associated lifecycle records removed.' };
  },

  deleteProject(id: string): { success: boolean; message: string } {
    const db = getDB();
    db.serviceProjects = db.serviceProjects.filter(p => p.id !== id && p.bookingRef !== id);
    saveDB(db);
    return { success: true, message: 'Lifecycle project removed.' };
  }
};
