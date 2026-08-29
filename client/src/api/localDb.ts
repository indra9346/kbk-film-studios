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
    heroVideoUrl: "/assets/hero-reel.mp4",
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
      id: 'work-sangeetha-aditya-sangeeth-2026',
      title: 'Sangeetha & Aditya — Dynamic Sangeeth Celebration Night',
      category: 'Haldi & Sangeeth Ceremonies',
      eventLocation: 'Bengaluru, KA',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: 'https://drive.google.com/file/d/1rqVfAXvqzroASucfdilB3-sRVGk9811Y/view',
      videoSourceType: 'google_drive',
      externalDestUrl: 'https://drive.google.com/file/d/1rqVfAXvqzroASucfdilB3-sRVGk9811Y/view',
      description: 'High-energy musical dance power of Sangeetha & Aditya Sangeeth celebration with punchy color grading and dynamic multicam pacing.',
      softwareUsed: ['DaVinci Resolve Studio', 'After Effects', 'Premiere Pro'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 1,
      createdAt: '2026-08-20T10:00:00Z'
    },
    {
      id: 'work-sangeetha-aditya-muhurtham-2026',
      title: 'Sangeetha & Aditya — Sacred Wedding Muhurtham & Ritual Highlights',
      category: 'Wedding Highlights',
      eventLocation: 'Hindupur, AP',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: 'https://drive.google.com/file/d/1v-OAwOJfS58jSyKbSKHXllw2Tnx7AqA3/view',
      videoSourceType: 'google_drive',
      externalDestUrl: 'https://drive.google.com/file/d/1v-OAwOJfS58jSyKbSKHXllw2Tnx7AqA3/view',
      description: 'Sacred Vedic mantras sound restoration and multi-camera synchronized traditional wedding ritual film for Sangeetha & Aditya.',
      softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 2,
      createdAt: '2026-08-19T10:00:00Z'
    },
    {
      id: 'work-hanumantha-reception-2026',
      title: 'Hanumantha Roy & Gayathri — Grand Reception Highlights',
      category: 'Wedding Highlights',
      eventLocation: 'Hindupur, AP',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: '/assets/works/hanumantha-reception.mp4',
      videoSourceType: 'direct_mp4',
      externalDestUrl: 'https://drive.google.com/file/d/1lmZ0mHo4lRI-Ie3452i-wrkM1uFC0jji/view',
      description: 'Grand luxury reception film featuring multi-camera speech capture, cinematic slow-motion highlights, and rich HDR color grading.',
      softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro', 'After Effects'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 3,
      createdAt: '2026-08-18T10:00:00Z'
    },
    {
      id: 'work-reception-master-2026',
      title: 'Luxury Wedding Reception — 4K Master Cut',
      category: 'Wedding Highlights',
      eventLocation: 'Bengaluru, KA',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: '/assets/works/reception-master.mp4',
      videoSourceType: 'direct_mp4',
      externalDestUrl: 'https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view',
      description: 'A master graded wedding reception highlight film woven into a seamless, emotionally moving cinematic narrative.',
      softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 4,
      createdAt: '2026-08-17T10:00:00Z'
    },
    {
      id: 'work-amulya-haldi-2026',
      title: 'Amulya Haldi Ceremony — Festive Yellow Splash Highlight',
      category: 'Haldi & Sangeeth Ceremonies',
      eventLocation: 'Hindupur, AP',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: '/assets/works/amulya-haldi.mp4',
      videoSourceType: 'direct_mp4',
      externalDestUrl: 'https://drive.google.com/file/d/1dHZDL0B23QtW6yo6HK_MfcDTMHk4J6Dn/view',
      description: 'Vibrant yellow splash color isolation, beat-matched family dances, and warm festive energy captured in 4K.',
      softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 5,
      createdAt: '2026-08-16T10:00:00Z'
    },
    {
      id: 'work-pavan-anjali-reception-2026',
      title: 'Pavan Kumar & Anjali — Luxury Reception Film',
      category: 'Wedding Highlights',
      eventLocation: 'Hindupur, AP',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: '/assets/works/pavan-anjali-reception.mp4',
      videoSourceType: 'direct_mp4',
      externalDestUrl: 'https://drive.google.com/file/d/1lmZ0mHo4lRI-Ie3452i-wrkM1uFC0jji/view',
      description: 'Cinematic wedding reception storytelling featuring elegant couple portraits, stage entrances, and guest celebration sequences.',
      softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 6,
      createdAt: '2026-08-15T10:00:00Z'
    },
    {
      id: 'work-pavan-anjali-muhurtham-2026',
      title: 'Pavan Kumar & Anjali — Sacred Muhurtham Highlights',
      category: 'Wedding Highlights',
      eventLocation: 'Hindupur, AP',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: '/assets/works/pavan-anjali-muhurtham.mp4',
      videoSourceType: 'direct_mp4',
      externalDestUrl: 'https://drive.google.com/file/d/14Oc3e5cNWXMOGIxPXk4V-OlN620eBqWs/view',
      description: 'Sacred Mangalashtak and Muhurtham rituals crafted into an emotional and timeless family keepsake.',
      softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 7,
      createdAt: '2026-08-14T10:00:00Z'
    },
    {
      id: 'work-pavan-anjali-teaser-2026',
      title: 'Pavan Kumar & Anjali — Reception Instagram Teaser (9:16)',
      category: 'Cinematic Teasers & Reels (9:16)',
      eventLocation: 'Hindupur, AP',
      eventYear: '2026',
      thumbnailUrl: '',
      videoUrl: '/assets/works/pavan-anjali-teaser.mp4',
      videoSourceType: 'direct_mp4',
      externalDestUrl: 'https://drive.google.com/file/d/1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP/view',
      description: 'Fast-paced vertical teaser cut engineered with dynamic bass drops and instant visual hooks.',
      softwareUsed: ['DaVinci Resolve Studio', 'After Effects'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 8,
      createdAt: '2026-08-13T10:00:00Z'
    }
  ],
  testimonials: [
    {
      id: "test-amulya-2026",
      clientName: "Amulya & Family",
      serviceTitle: "Haldi & Sangeeth Ceremonies",
      location: "Hindupur, Andhra Pradesh",
      rating: 5,
      reviewText: "The Haldi video editing is absolutely stunning! Bharath Kumar captured every splash, every smile, and every dance move with incredible cinematic precision. The yellow color grading was breathtaking — we cried watching it!",
      videoUrl: "/assets/works/amulya-haldi.mp4",
      thumbnailUrl: "",
      eventDate: "August 2026",
      isVerified: true,
      isPublished: true,
      bookingRef: "KBK-2026-AMULYA",
      createdAt: "2026-08-10T00:00:00.000Z"
    },
    {
      id: "test-sangeetha-aditya-2026",
      clientName: "Sangeetha & Aditya",
      serviceTitle: "Sangeeth Night & Wedding Muhurtham Master",
      location: "Bengaluru / Hindupur",
      rating: 5,
      reviewText: "KBK Film Studios delivered sheer magic! The beat sync on our Sangeeth dance night and the sacred mantra restoration on our Muhurtham film were beyond world class. Highly recommended!",
      videoUrl: "https://drive.google.com/file/d/1rqVfAXvqzroASucfdilB3-sRVGk9811Y/view",
      thumbnailUrl: "",
      eventDate: "August 2026",
      isVerified: true,
      isPublished: true,
      bookingRef: "KBK-2026-SANGEETHA",
      createdAt: "2026-08-08T00:00:00.000Z"
    },
    {
      id: "test-hanumantha-2026",
      clientName: "Hanumantha Roy & Gayathri",
      serviceTitle: "Wedding Highlights (Cinematic Master)",
      location: "Hindupur, Andhra Pradesh",
      rating: 5,
      reviewText: "Kurudi Bharath Kumar transformed our wedding footage into a pure movie! The color grading on our silk sarees and the emotional flow during the reception made all our family members amazed.",
      videoUrl: "/assets/works/hanumantha-reception.mp4",
      thumbnailUrl: "",
      eventDate: "July 2026",
      isVerified: true,
      isPublished: true,
      bookingRef: "KBK-2026-HROY",
      createdAt: "2026-08-01T00:00:00.000Z"
    },
    {
      id: "test-pavan-anjali-2026",
      clientName: "Pavan Kumar & Anjali",
      serviceTitle: "Wedding Highlights & Spot Edit",
      location: "Hindupur, Andhra Pradesh",
      rating: 5,
      reviewText: "The video pacing and color grading on DaVinci Resolve exceeded all our expectations. The same-day reception teaser was screened on the LED wall and received loud applause from all guests!",
      videoUrl: "/assets/works/pavan-anjali-reception.mp4",
      thumbnailUrl: "",
      eventDate: "June 2026",
      isVerified: true,
      isPublished: true,
      bookingRef: "KBK-2026-PAVAN",
      createdAt: "2026-07-20T00:00:00.000Z"
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

const STORAGE_KEY = 'kbk_local_database_v8';

function getDB(): LocalDBData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
      return DEFAULT_DB;
    }
    const parsed = JSON.parse(raw) as LocalDBData;
    if (!parsed.services || parsed.services.length === 0) {
      parsed.services = DEFAULT_DB.services;
    }
    if (!parsed.cms) {
      parsed.cms = DEFAULT_DB.cms;
    }
    if (!parsed.owners || parsed.owners.length === 0) {
      parsed.owners = DEFAULT_DB.owners;
    }
    return parsed;
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
    return getDB().works || [];
  },
  getTestimonials(): Testimonial[] {
    return getDB().testimonials || [];
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

    const owner = db.owners.find(o => {
      if (o.isActive === false) return false;

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
      budgetRange: data.budgetRange || `₹${service.basePrice.toLocaleString('en-IN')}`,
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
  },

  saveWork(work: any): { success: boolean; work: PublicWork } {
    const db = getDB();
    const normalized: PublicWork = {
      ...work,
      id: work.id && !String(work.id).startsWith('temp-') ? work.id : `work-${Date.now()}`,
      isPublished: work.isPublished !== false,
      eventYear: work.eventYear || new Date().getFullYear().toString(),
      eventLocation: work.eventLocation || 'India',
      softwareUsed: work.softwareUsed || ['DaVinci Resolve'],
      createdAt: work.createdAt || new Date().toISOString()
    };
    if (!db.works) db.works = [];
    const index = db.works.findIndex(item => item.id === normalized.id);
    if (index >= 0) db.works[index] = normalized;
    else db.works.unshift(normalized);
    saveDB(db);
    return { success: true, work: normalized };
  },

  deleteWork(id: string): { success: boolean; message: string } {
    const db = getDB();
    db.works = (db.works || []).filter(work => work.id !== id);
    saveDB(db);
    return { success: true, message: 'Showcase work removed.' };
  },

  deleteAllWorks(): { success: boolean; message: string } {
    const db = getDB();
    db.works = [];
    saveDB(db);
    return { success: true, message: 'All showcase works cleared from cache.' };
  },

  resetDefaultWorks(): PublicWork[] {
    const db = getDB();
    db.works = [...DEFAULT_DB.works];
    saveDB(db);
    return db.works;
  },

  saveTestimonial(testimonial: any): { success: boolean; testimonial: Testimonial } {
    const db = getDB();
    const normalized: Testimonial = {
      ...testimonial,
      id: testimonial.id && !String(testimonial.id).startsWith('temp-') ? testimonial.id : `testimonial-${Date.now()}`,
      isPublished: testimonial.isPublished !== false,
      isVerified: testimonial.isVerified !== false,
      rating: Number(testimonial.rating) || 5,
      createdAt: testimonial.createdAt || new Date().toISOString()
    };
    if (!db.testimonials) db.testimonials = [];
    const index = db.testimonials.findIndex(item => item.id === normalized.id);
    if (index >= 0) db.testimonials[index] = normalized;
    else db.testimonials.unshift(normalized);
    saveDB(db);
    return { success: true, testimonial: normalized };
  },

  deleteTestimonial(id: string): { success: boolean; message: string } {
    const db = getDB();
    db.testimonials = (db.testimonials || []).filter(testimonial => testimonial.id !== id);
    saveDB(db);
    return { success: true, message: 'Testimonial removed.' };
  },

  updateCMS(data: Partial<StudioCMSData>): { success: boolean; cms: StudioCMSData } {
    const db = getDB();
    db.cms = { ...db.cms, ...data };
    saveDB(db);
    return { success: true, cms: db.cms };
  }
};
