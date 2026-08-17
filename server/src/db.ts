import fs from 'fs';
import path from 'path';
import {
  Owner,
  Client,
  ServiceItem,
  BookingRequest,
  BookingPriceHistory,
  ServiceProject,
  PrivateDeliveryFile,
  PublicWork,
  Testimonial,
  StudioCMSData,
  AuditLog,
  OTPVerification
} from './types.js';
import {
  isSupabaseEnabled,
  hydrateSupabaseData,
  upsertWorkSupabase,
  deleteWorkSupabase,
  upsertServiceSupabase,
  deleteServiceSupabase,
  upsertTestimonialSupabase,
  deleteTestimonialSupabase,
  upsertBookingSupabase,
  deleteBookingSupabase,
  upsertProjectSupabase,
  deleteProjectSupabase,
  updateCmsSupabase,
  upsertClientVideoDeliverySupabase,
  deleteClientVideoDeliverySupabase,
  upsertOwnerSupabase,
  deleteOwnerSupabase,
  ClientVideoDelivery
} from './supabase.js';

interface DatabaseSchema {
  owners: Owner[];
  clients: Client[];
  services: ServiceItem[];
  bookingRequests: BookingRequest[];
  bookingPriceHistories: BookingPriceHistory[];
  serviceProjects: ServiceProject[];
  privateDeliveries: PrivateDeliveryFile[];
  publicWorks: PublicWork[];
  testimonials: Testimonial[];
  studioCMS: StudioCMSData;
  auditLogs: AuditLog[];
  otpVerifications: OTPVerification[];
  clientVideoDeliveries: ClientVideoDelivery[];
}

// Resolve the data directory correctly for both environments:
// - Local dev: __dirname is server/src/, so ../data -> server/data/
// - Vercel serverless: __dirname is unreliable in bundled code, but
//   process.cwd() is /var/task/ and includeFiles places data at server/data/
const DATA_DIR = process.env.VERCEL === '1'
  ? path.join(process.cwd(), 'server', 'data')
  : path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'kbk_database.json');

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    slug: 'pre-wedding-editing',
    title: 'Pre-Wedding Video Editing',
    tagline: 'Cinematic romantic visual poetry with rhythmic cuts & drone pacing',
    shortDescription: 'Transform your pre-wedding raw footage into a dreamy, high-fashion cinematic love story with custom soundscapes.',
    detailedDescription: 'Full post-production treatment for pre-wedding shoots. Includes multi-camera audio sync, cinematic slow-motion speed ramps, specialized film-look color grading, personalized song mixing, dialogue mastering, and vertical teaser cuts for social media.',
    priceType: 'starting_from',
    basePrice: 14999,
    currency: 'INR',
    priceLabel: 'Starting from ₹14,999',
    inclusions: [
      'Full 4K/1080p Cinematic Master Film (3-5 mins)',
      '1x Vertical 9:16 Instagram Reel Teaser (60s)',
      'Hollywood Grade Film Tone & Color Palette',
      'Dialogue Clean-up & Ambient Audio Mastering',
      'Licensed Background Music Sync',
      '2 Rounds of Precision Revisions'
    ],
    exclusions: [
      'Raw footage shooting / camera equipment on location',
      'Travel, food, lodging for shoot crew',
      'Drone license permits or venue access charges'
    ],
    turnaroundDays: 5,
    featured: true,
    isUpcoming: false,
    isActive: true,
    sortOrder: 1,
    badge: 'Most Popular'
  },
  {
    id: 'srv-2',
    slug: 'wedding-highlights',
    title: 'Wedding Video Highlights',
    tagline: 'Emotionally immersive master highlights capturing timeless rituals & celebrations',
    shortDescription: 'A breathless, tear-jerking cinematic wedding highlight film that captures every sacred ritual and joyful celebration.',
    detailedDescription: 'Comprehensive wedding film editing that weaves Muhurtham, Varapooja, Mangalashtak, and Reception into a seamless emotional narrative. Features advanced color science tailored for vibrant Indian traditional silks and golden lighting.',
    priceType: 'starting_from',
    basePrice: 24999,
    currency: 'INR',
    priceLabel: 'Starting from ₹24,999',
    inclusions: [
      'Full Cinematic Highlight Film (7-12 mins)',
      '2x Vertical Teaser Reels for Social Sharing',
      'Custom Multi-Camera Synchronization (up to 4 cams)',
      'Indian Silk & Gold Optimized Color Grading',
      'Traditional Mantras & Speeches Sound Mastering',
      'Private High-Speed Isolated Master Delivery Locker'
    ],
    exclusions: [
      'On-venue videographers/photographers arrangements',
      'Travel & accommodation for editing crew if spot-requested',
      'Physical storage hard drives delivery couriers'
    ],
    turnaroundDays: 7,
    featured: true,
    isUpcoming: false,
    isActive: true,
    sortOrder: 2,
    badge: 'Signature Masterpiece'
  },
  {
    id: 'srv-3',
    slug: 'haldi-sangeeth',
    title: 'Haldi & Sangeeth Ceremonies',
    tagline: 'High-energy beat-synced edits for joyful yellow splashes & vibrant dance nights',
    shortDescription: 'High-octane edits capturing playful yellow haldi splashes, family dances, musical sangeeth choreography, and unfiltered joy.',
    detailedDescription: 'Tailored specifically for high-energy Indian pre-wedding celebrations. We employ dynamic beat matching, speed ramps, yellow-hue color isolation, and multi-track audio mastering to turn dance performances and haldi celebrations into festive masterpieces.',
    priceType: 'starting_from',
    basePrice: 12999,
    currency: 'INR',
    priceLabel: 'Starting from ₹12,999',
    inclusions: [
      'High-Energy Cinematic Reel (3-6 mins)',
      'Individual Dance Performance Individual Track Cuts',
      'Haldi Color Splash Pop & Yellow HDR Grading',
      'Dynamic Bass & Music Audio Mastering',
      '1x Vertical Fast-Paced Reel'
    ],
    exclusions: [
      'On-site video recording crew or sound stage setup',
      'Travel, food, and local venue access charges'
    ],
    turnaroundDays: 4,
    featured: true,
    isUpcoming: false,
    isActive: true,
    sortOrder: 3,
    badge: 'Festive High-Energy'
  },
  {
    id: 'srv-4',
    slug: 'maternity-shoot',
    title: 'Maternity Shoot Videos',
    tagline: 'Tender, heartwarming visual keepsakes celebrating the miracle of new life',
    shortDescription: 'Soft, luminous, and deeply personal maternity films celebrating the anticipation and love of expectant parents.',
    detailedDescription: 'Soft-contrast film aesthetics, warm pastel tones, and gentle pacing to highlight motherhood grace and family anticipation. Perfect for intimate indoor and scenic outdoor maternity sessions.',
    priceType: 'starting_from',
    basePrice: 9999,
    currency: 'INR',
    priceLabel: 'Starting from ₹9,999',
    inclusions: [
      'Cinematic Maternity Film (2-4 mins)',
      'Soft Dreamy Film Look & Skin Tone Smoothing',
      'Acoustic Emotional Music Sync',
      '1x Vertical Social Reel',
      '4K Digital Master Download'
    ],
    exclusions: [
      'Studio rental or outdoor shoot permits',
      'Travel & stay expenses for shoot'
    ],
    turnaroundDays: 3,
    featured: false,
    isUpcoming: false,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'srv-5',
    slug: 'baby-ceremony',
    title: 'Baby Ceremony Videos (Naming/Birthday)',
    tagline: 'Playful, vibrant storytelling for cradle ceremonies & milestone birthdays',
    shortDescription: 'Vibrant, joyful edits capturing your little one’s naming ceremony, cradle rituals, or first birthday celebrations.',
    detailedDescription: 'Whimsical color grading, cheerful upbeat musical pacing, and warm family candid moments immortalized for generations to come.',
    priceType: 'starting_from',
    basePrice: 8999,
    currency: 'INR',
    priceLabel: 'Starting from ₹8,999',
    inclusions: [
      'Joyful Ceremony Highlight Film (3-5 mins)',
      'Cute Candid Moments Cut',
      'Vibrant Pastel Color Grading',
      'Background Lullaby / Festive Music Sync',
      'Private Download Link'
    ],
    exclusions: [
      'Event videography coverage on location',
      'Food & travel expenses'
    ],
    turnaroundDays: 3,
    featured: false,
    isUpcoming: false,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'srv-6',
    slug: 'house-warming',
    title: 'House Warming Ceremonies (Gruhapravesam)',
    tagline: 'Sacred pooja traditions & architectural home walk-throughs in pristine 4K',
    shortDescription: 'Documenting the sacred Gruhapravesam rituals, homam blessings, family welcomes, and architectural beauty of your new dream home.',
    detailedDescription: 'Combines reverent coverage of sacred Vedic poojas and homam ceremonies with smooth, architectural cinematic walkthroughs highlighting the interiors and warmth of the new home.',
    priceType: 'starting_from',
    basePrice: 10999,
    currency: 'INR',
    priceLabel: 'Starting from ₹10,999',
    inclusions: [
      'Complete Ceremony Highlight Film (4-7 mins)',
      'Pooja & Homam Sacred Mantras Audio Clean-up',
      'Interior Architectural Cinematic Color Grading',
      'Family Welcome Montages'
    ],
    exclusions: [
      'Camera recording crew and drone pilot on location',
      'Travel & food arrangements'
    ],
    turnaroundDays: 4,
    featured: false,
    isUpcoming: false,
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'srv-7',
    slug: 'cinematic-teasers-reels',
    title: 'Cinematic Teasers & Vertical Reels',
    tagline: 'High-impact 9:16 viral edits crafted to stop the scroll and captivate viewers',
    shortDescription: 'Punchy, trend-aligned vertical reels and teaser promos optimized for Instagram, YouTube Shorts, and WhatsApp Status.',
    detailedDescription: 'Engineered for viral retention with instant visual hooks, precision sync to trending audio, seamless sound design effects (whooshes, risers), and punchy color grading.',
    priceType: 'starting_from',
    basePrice: 4999,
    currency: 'INR',
    priceLabel: 'Starting from ₹4,999',
    inclusions: [
      '3x Premium Vertical 9:16 Reels (30-60s each)',
      'Viral Hook & Beat Matching Editing',
      'High-Impact Sound Effects (SFX) Design',
      'Mobile OLED Optimized Color Grading',
      '24-48hr Rapid Delivery'
    ],
    exclusions: [
      'Video shoot production on location'
    ],
    turnaroundDays: 2,
    featured: true,
    isUpcoming: false,
    isActive: true,
    sortOrder: 7,
    badge: 'Rapid 48h Turnaround'
  },
  {
    id: 'srv-8',
    slug: 'event-coverage-montages',
    title: 'Event Coverage & Montages',
    tagline: 'Dynamic recap edits for corporate summits, anniversaries & cultural galas',
    shortDescription: 'Sleek, sophisticated event highlight montages for corporate gatherings, grand openings, anniversaries, and cultural galas.',
    detailedDescription: 'Multi-cam speaker highlights, audience reaction cutaways, sponsor billboard integration, keynote sound mastering, and executive presentation recaps.',
    priceType: 'starting_from',
    basePrice: 13999,
    currency: 'INR',
    priceLabel: 'Starting from ₹13,999',
    inclusions: [
      'Comprehensive Event Recap Film (5-8 mins)',
      'Executive Keynote Audio Polish',
      'Sponsor Logo & Title Lower Thirds Graphics',
      'High Bitrate 4K Master Export'
    ],
    exclusions: [
      'On-site video production and staging equipment'
    ],
    turnaroundDays: 5,
    featured: false,
    isUpcoming: false,
    isActive: true,
    sortOrder: 8
  },
  {
    id: 'srv-9',
    slug: 'spot-editing-live',
    title: 'Spot Editing Available (Same-Day On-Venue)',
    tagline: 'Instant same-day wedding edit ready for reception LED screens & live social blast',
    shortDescription: 'Live on-venue high-speed video editing! Watch morning wedding rituals projected as a grand cinematic film at the evening reception.',
    detailedDescription: 'Kurudi Bharath Kumar brings his mobile high-performance editing rig directly to your wedding venue. Raw morning ceremony footage is ingested, graded, mastered, and delivered in real-time within hours for a jaw-dropping evening reception screening.',
    priceType: 'starting_from',
    basePrice: 19999,
    currency: 'INR',
    priceLabel: 'Starting from ₹19,999',
    inclusions: [
      'Same-Day On-Venue Live Editing (Same Day Delivery)',
      'Ready for Reception Large LED Wall Projection (4K/1080p)',
      'Instant Teaser for Live Social Media Sharing',
      'Dedicated Mobile High-End Workstation Setup at Venue'
    ],
    exclusions: [
      'Travel, food & accommodation for editor (managed by client)',
      'LED wall projector rental (provided by event venue/client)',
      'Camera recording team (supplied by client or contracted separately)'
    ],
    turnaroundDays: 1,
    featured: true,
    isUpcoming: false,
    isActive: true,
    sortOrder: 9,
    badge: 'Same-Day Live Delivery'
  },
  {
    id: 'srv-10',
    slug: 'ai-video-cinematic-animation',
    title: 'AI-Assisted Video Creation & 3D Animation',
    tagline: 'Next-generation AI neural frame enhancements, 3D titles & smart rotoscoping',
    shortDescription: 'Studio Next-Gen Lab: Harnessing neural AI frame interpolation, smart object removal, automated multicam sync, and 3D titles.',
    detailedDescription: 'Future-ready post-production combining cutting-edge AI neural upscaling to 8K, AI voice audio isolation, smart generative fill for clean backgrounds, and bespoke 3D cinematic opening titles.',
    priceType: 'custom_quote',
    basePrice: 17999,
    currency: 'INR',
    priceLabel: 'Custom Quote / Lab Early Access',
    inclusions: [
      'AI Neural 4K/8K Upscaling & Frame Smoothing',
      'AI Voice Denoise & Dialogue Clarity Enhancement',
      'Bespoke 3D Gold Monogram & Title Animations',
      'Generative Background Clean-up & Object Removal'
    ],
    exclusions: [
      'Full manual 3D character rigging projects'
    ],
    turnaroundDays: 6,
    featured: true,
    isUpcoming: true,
    isActive: true,
    sortOrder: 10,
    badge: 'Upcoming Studio Lab'
  }
];

const INITIAL_PUBLIC_WORKS: PublicWork[] = [
  {
    id: 'work-amulya-haldi-2026',
    title: 'Amulya Haldi Ceremony — Cinematic Edit',
    category: 'Haldi & Sangeeth Ceremonies',
    eventLocation: 'Hindupur, AP',
    eventYear: '2026',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    videoUrl: 'https://drive.google.com/file/d/1dHZDL0B23QtW6yo6HK_MfcDTMHk4J6Dn/view',
    videoSourceType: 'google_drive',
    externalDestUrl: '',
    description: 'A vibrant and joyful Haldi ceremony cinematic highlight — yellow splash color isolation, beat-matched family dances, and warm festive energy captured in breathtaking 4K.',
    softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro'],
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'work-demo-wedding-2026',
    title: 'Venkatesh & Divya — Wedding Master Highlight',
    category: 'Wedding Highlights',
    eventLocation: 'Hindupur, AP',
    eventYear: '2026',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    videoUrl: '/assets/client-work-1.mp4',
    videoSourceType: 'direct_mp4',
    externalDestUrl: '',
    description: 'A breathtaking wedding master highlight film — Muhurtham, Mangalashtak, reception speeches, and candid family moments woven into a seamless 10-minute emotional cinematic narrative.',
    softwareUsed: ['DaVinci Resolve Studio', 'Adobe Premiere Pro', 'After Effects'],
    isFeatured: true,
    isPublished: true,
    sortOrder: 2,
    createdAt: '2026-02-10T10:00:00Z'
  }
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-amulya-2026',
    clientName: 'Amulya & Family',
    serviceTitle: 'Haldi & Sangeeth Ceremonies',
    eventDate: 'August 2026',
    location: 'Hindupur, Andhra Pradesh',
    rating: 5,
    reviewText: 'The Haldi video editing is absolutely stunning! Bharath Kumar captured every splash, every smile, and every dance move with incredible cinematic precision. The yellow color grading was breathtaking — we cried watching it. Highly recommended for any family ceremony!',
    videoUrl: 'https://drive.google.com/file/d/1dHZDL0B23QtW6yo6HK_MfcDTMHk4J6Dn/view',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    isVerified: true,
    isPublished: true,
    bookingRef: 'KBK-2026-AMULYA',
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'test-1',
    clientName: 'K S Indra Kumar (Demo Client)',
    serviceTitle: 'Cinematic Teasers/Reels (9:16)',
    eventDate: 'August 2026',
    location: 'Bengaluru, India',
    rating: 5,
    reviewText: 'Outstanding video pacing and professional color grading! The secure client portal and direct collaboration panel made the entire post-production process fast, secure, and hassle-free.',
    isVerified: true,
    isPublished: true,
    bookingRef: 'KBK-2026-INDRA',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CLIENT_VIDEO_DELIVERIES: ClientVideoDelivery[] = [
  {
    id: 'cvd-amulya-haldi-2026',
    bookingRef: 'KBK-2026-AMULYA',
    clientId: 'client-amulya',
    clientName: 'Amulya Family',
    projectId: 'proj-amulya',
    title: 'Amulya - Haldi Ceremony Video (4K Master)',
    description: 'Beautiful Haldi ceremony cinematic edit with vibrant yellow splash color grading, beat-synced choreography cuts, and festive music mastering.',
    videoUrl: 'https://drive.google.com/file/d/1dHZDL0B23QtW6yo6HK_MfcDTMHk4J6Dn/view',
    videoSourceType: 'google_drive',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    fileName: 'KBK_Amulya_Haldi_4K_Master.mp4',
    fileSizeBytes: 524288000,
    fileSizeFormatted: '~500 MB',
    mimeType: 'video/mp4',
    fileCategory: 'master_video',
    downloadToken: 'cvd_token_amulya_haldi_2026_secure',
    expiryDate: '2026-11-16T23:59:59Z',
    downloadCount: 0,
    maxDownloads: 50,
    isStreamable: true,
    isActive: true,
    ownerNotes: 'Haldi ceremony - vibrant yellow grading, DaVinci Resolve. Client approved for delivery.',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z'
  }
];

const INITIAL_STUDIO_CMS: StudioCMSData = {
  studioName: 'KBK Film Studios',
  tagline: 'Cinematic Storytelling Crafted With Precision | Premium Post-Production & Color Science',
  founderName: 'Kurudi Bharath Kumar',
  founderTitle: 'Founder, Lead Video Editor & Master Colorist',
  phone: '9346227894',
  whatsappNumber: '9346227894',
  email: 'kbkfilms.official@gmail.com',
  location: 'Hindupur, Andhra Pradesh, India',
  instagramHandle: '@kurudi_bharathkumar_official',
  instagramUrl: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=f5nglc3',
  youtubeHandle: '@bharathkumarglp2003',
  youtubeUrl: 'https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX',
  facebookHandle: 'KurudiBharathKumar',
  facebookUrl: 'https://facebook.com/KurudiBharathKumar',
  happyClientsCount: 800,
  filmsDeliveredCount: 1200,
  yearsExperience: 6,
  satisfactionRate: 99.8,
  founderBio: 'Kurudi Bharath Kumar is an accomplished filmmaker, post-production specialist, and senior colorist based in Hindupur, Andhra Pradesh. With an academic background in Computer Applications, Advertising, and Business Management, he combines technical rigor with emotive visual pacing to transform raw event footage into timeless, cinematic masterworks.',
  educationDetails: {
    degree: 'Bachelor of Commerce (Computer Applications)',
    college: 'Sri Krishnadevaraya University (SKU), Ananthapuramu',
    coreHighlights: [
      'Advertising and Media Planning',
      'Big Data Analytics & Data Science',
      'Sales Promotion & Management Strategies',
      'Distinction in Professional Video & Media Internships'
    ],
    currentPursuit: 'Master of Business Administration (MBA) - 2nd Year'
  },
  editingSuites: [
    'DaVinci Resolve Studio (Advanced Color Grading & Fairlight Audio)',
    'Adobe Premiere Pro (Multi-Cam Narrative Sync)',
    'Adobe After Effects (Cinematic VFX & Motion Graphics)',
    'FilmConvert Nitrate & Dehancer Pro (Film Emulation LUTs)',
    'Custom Calibrated OLED & DaVinci Speed Editor Rig'
  ],
  heroVideoUrl: '/assets/hero-reel.mp4',
  heroSettledPosterUrl: '/assets/kbk-logo.jpg',
  priceDisclaimer: 'The displayed price covers only the selected editing or video-production service and the deliverables stated in your booking. Accommodation, food, travel, local transport, venue charges, permits, courier expenses, and any other on-location or third-party expenses are not included unless specifically confirmed in writing. These arrangements and costs must be managed by the client.',
  termsAndConditions: [
    'The displayed service fee applies only to the selected service and agreed deliverables.',
    'Accommodation, food, travel, local transport, venue charges, permits, courier charges, and third-party expenses are excluded unless separately confirmed in writing.',
    'The client is responsible for arranging and paying all excluded expenses.',
    'Final scope, delivery date, and any custom quotation are confirmed after the owner reviews the service request.',
    'Delivery timelines depend on project complexity, timely submission of required footage/materials, and client feedback.',
    'Revisions are handled according to the agreed service scope. Additional revisions or changes outside the agreed scope may require an additional charge.',
    'The client confirms they have permission to provide all photos, videos, music references, logos, and other materials submitted for the project.',
    'Private delivered files are available through the client portal for the selected access period. Clients should download and safely back up their files.',
    'KBK Film Studios may display completed work publicly only after receiving client approval.',
    'By submitting this request, the client agrees to these terms.'
  ],
  contactClarificationMsg: 'Hi Bharath Kumar, I was reviewing the pricing for your video editing services on KBK Film Studios and would love a custom quote/clarification for my upcoming event.'
};

const INITIAL_OWNERS: Owner[] = [
  {
    id: 'owner-indra',
    name: 'K S Indra Kumar',
    phone: '9346476951',
    email: 'ik9893344@gmail.com',
    role: 'primary_owner',
    permissions: ['all', 'manage_owners', 'manage_pricing', 'manage_cms', 'manage_deliveries'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'owner-1',
    name: 'Kurudi Bharath Kumar',
    phone: '9346227894',
    email: 'kbkfilms.official@gmail.com',
    role: 'co_owner',
    permissions: ['manage_bookings', 'manage_lifecycle', 'manage_deliveries', 'manage_works', 'manage_pricing', 'manage_cms'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'owner-2',
    name: 'KBK Studio Lead Editor',
    phone: '9845012345',
    email: 'editor@kbkfilms.com',
    role: 'co_owner',
    permissions: ['manage_bookings', 'manage_lifecycle', 'manage_deliveries', 'manage_works'],
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z'
  }
];

// Sample demo booking and isolated client delivery
const INITIAL_DEMO_CLIENT: Client = {
  id: 'client-1',
  fullName: 'Venkatesh & Divya',
  phone: '9440187654',
  email: 'venkatesh.divya@gmail.com',
  city: 'Hindupur, AP',
  createdAt: '2026-02-05T08:30:00Z'
};

const INITIAL_DEMO_BOOKING: BookingRequest = {
  id: 'book-1',
  bookingRef: 'KBK-2026-8941',
  clientId: 'client-1',
  clientName: 'Venkatesh & Divya',
  clientPhone: '9440187654',
  clientEmail: 'venkatesh.divya@gmail.com',
  clientCity: 'Hindupur, AP',
  serviceId: 'srv-2',
  serviceTitle: 'Wedding Video Highlights',
  eventDate: '2026-02-28',
  preferredDeliveryDate: '2026-03-08',
  budgetRange: '₹25,000 - ₹35,000',
  footageDetails: 'Sony FX3 + A7IV multi-cam footage, 4K 10-bit S-Log3, approx 350GB on external SSD.',
  referenceLinks: 'https://youtube.com/@bharathkumarglp2003',
  customNotes: 'Looking for a royal emotional theme with Mangalashtak dialogue sync and fast Instagram teaser.',
  agreedTerms: true,
  priceSnapshot: {
    serviceId: 'srv-2',
    serviceTitle: 'Wedding Video Highlights',
    priceType: 'starting_from',
    basePrice: 24999,
    currency: 'INR',
    priceLabel: 'Starting from ₹24,999',
    inclusions: [
      'Full Cinematic Highlight Film (7-12 mins)',
      '2x Vertical Teaser Reels for Social Sharing',
      'Custom Multi-Camera Synchronization (up to 4 cams)',
      'Indian Silk & Gold Optimized Color Grading',
      'Traditional Mantras & Speeches Sound Mastering',
      'Private High-Speed Isolated Master Delivery Locker'
    ],
    exclusions: [
      'On-venue videographers/photographers arrangements',
      'Travel & accommodation for editing crew if spot-requested',
      'Physical storage hard drives delivery couriers'
    ],
    turnaroundDays: 7,
    snapshotDate: '2026-02-05T08:30:00Z'
  },
  quotedAmount: 24999,
  finalAmount: 24999,
  status: 'accepted',
  createdAt: '2026-02-05T08:30:00Z'
};

const INITIAL_DEMO_PROJECT: ServiceProject = {
  id: 'proj-1',
  bookingId: 'book-1',
  bookingRef: 'KBK-2026-8941',
  clientId: 'client-1',
  clientName: 'Venkatesh & Divya',
  clientPhone: '9440187654',
  clientEmail: 'venkatesh.divya@gmail.com',
  serviceId: 'srv-2',
  serviceTitle: 'Wedding Video Highlights',
  trackingToken: 'TRK-KBK-8941-SECURE',
  currentStage: 'color_grading_audio',
  stageProgressPercent: 65,
  startDate: '2026-02-06',
  estimatedDeliveryDate: '2026-03-08',
  statusHistory: [
    {
      id: 'stat-1',
      stage: 'booking_requested',
      stageLabel: 'Booking Requested',
      message: 'Booking submitted and received by KBK Film Studios.',
      updatedBy: 'System',
      timestamp: '2026-02-05T08:30:00Z'
    },
    {
      id: 'stat-2',
      stage: 'accepted_scheduled',
      stageLabel: 'Accepted & Scheduled',
      message: 'Booking accepted by Kurudi Bharath Kumar. Delivery timeline scheduled.',
      updatedBy: 'Kurudi Bharath Kumar',
      timestamp: '2026-02-05T11:00:00Z'
    },
    {
      id: 'stat-3',
      stage: 'raw_footage_received',
      stageLabel: 'Raw Footage Received',
      message: '350GB 4K raw footage ingested and verified in editing workstation.',
      updatedBy: 'Kurudi Bharath Kumar',
      timestamp: '2026-02-06T15:00:00Z'
    },
    {
      id: 'stat-4',
      stage: 'in_progress',
      stageLabel: 'In Progress (Rough Cut)',
      message: 'Multi-cam timeline synced and main emotional narrative assembly completed.',
      updatedBy: 'Kurudi Bharath Kumar',
      timestamp: '2026-02-07T18:00:00Z'
    },
    {
      id: 'stat-5',
      stage: 'color_grading_audio',
      stageLabel: 'Color Grading & Audio Mastering',
      message: 'Gold & silk palette HDR color grading and mantra sound restoration in DaVinci Resolve.',
      updatedBy: 'Kurudi Bharath Kumar',
      timestamp: '2026-02-08T14:30:00Z'
    }
  ],
  internalNotes: 'Client requested focus on bride entrance and father-daughter emotion.',
  clientMessages: [
    {
      id: 'msg-1',
      sender: 'owner',
      senderName: 'Kurudi Bharath Kumar',
      text: 'Hi Venkatesh & Divya! Your 350GB raw footage has been ingested. The timeline sync is looking phenomenal!',
      timestamp: '2026-02-06T16:00:00Z'
    },
    {
      id: 'msg-2',
      sender: 'client',
      senderName: 'Venkatesh',
      text: 'Thank you Bharath! Really excited to see the teaser and highlight master!',
      timestamp: '2026-02-06T17:15:00Z'
    }
  ],
  deliveries: [
    {
      id: 'del-1',
      projectId: 'proj-1',
      bookingRef: 'KBK-2026-8941',
      title: 'Venkatesh & Divya - 4K Master Teaser Reel (9:16)',
      fileName: 'KBK_Venkatesh_Divya_Teaser_4K.mp4',
      fileSizeBytes: 4886163,
      fileSizeFormatted: '4.88 MB',
      mimeType: 'video/mp4',
      fileCategory: 'teaser_reel',
      storagePath: 'private_deliveries/proj-1/KBK_Venkatesh_Divya_Teaser_4K.mp4',
      downloadToken: 'dl_token_8941_teaser_preview',
      expiryDate: '2026-05-30T23:59:59Z',
      downloadCount: 3,
      maxDownloads: 50,
      isStreamable: true,
      streamUrl: '/api/client/stream/dl_token_8941_teaser_preview',
      createdAt: '2026-02-08T15:00:00Z'
    }
  ],
  createdAt: '2026-02-05T11:00:00Z',
  updatedAt: '2026-02-08T15:00:00Z'
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private async syncSupabaseIfAvailable() {
    if (!isSupabaseEnabled()) return;

    const hydrated = await hydrateSupabaseData();
    if (!hydrated) return;

    const nextData: DatabaseSchema = {
      owners: hydrated.owners.length ? hydrated.owners : this.data.owners,
      clients: this.data.clients,
      services: this.data.services,
      bookingRequests: this.data.bookingRequests,
      bookingPriceHistories: this.data.bookingPriceHistories,
      serviceProjects: this.data.serviceProjects,
      privateDeliveries: this.data.privateDeliveries,
      publicWorks: hydrated.works.length ? hydrated.works : this.data.publicWorks,
      testimonials: hydrated.testimonials.length ? hydrated.testimonials : this.data.testimonials,
      studioCMS: hydrated.studioCMS ?? this.data.studioCMS,
      auditLogs: this.data.auditLogs,
      otpVerifications: this.data.otpVerifications,
      clientVideoDeliveries: hydrated.clientVideoDeliveries?.length ? hydrated.clientVideoDeliveries : this.data.clientVideoDeliveries,
    };

    this.data = nextData;
    this.saveDatabase(nextData);
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const privateStorageDir = path.resolve(process.cwd(), 'storage', 'private_deliveries', 'proj-1');
    if (!fs.existsSync(privateStorageDir)) {
      fs.mkdirSync(privateStorageDir, { recursive: true });
    }
  }

  private normalizeBundledVideoUrls(data: DatabaseSchema): DatabaseSchema {
    const replacements: Record<string, string> = {
      '1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP': '/assets/client-work-1.mp4',
      '14Oc3e5cNWXMOGIxPXk4V-OlN620eBqWs': '/assets/client-work-2.mp4'
    };
    data.publicWorks = data.publicWorks.map((work) => {
      const replacement = Object.entries(replacements)
        .find(([driveFileId]) => work.videoUrl?.includes(driveFileId))?.[1];
      return replacement ? { ...work, videoUrl: replacement } : work;
    });
    if (data.studioCMS?.heroVideoUrl?.includes('1X-bWfeq-8smOgdl9jBgrRwx3RNimChCP')) {
      data.studioCMS.heroVideoUrl = '/assets/hero-reel.mp4';
    }
    return data;
  }

  private loadDatabase(): DatabaseSchema {
    if (isSupabaseEnabled()) {
      const fallbackSchema = (() => {
        try {
          if (fs.existsSync(DB_FILE)) {
            const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
            const parsed = JSON.parse(fileContent);
            for (const initialOwner of INITIAL_OWNERS) {
              if (!parsed.owners.some((o: any) => o.phone === initialOwner.phone || o.email === initialOwner.email)) {
                parsed.owners.unshift(initialOwner);
              }
            }
            return this.normalizeBundledVideoUrls(parsed);
          }
        } catch (err) {
          console.error('Error reading database file, loading default initial schema:', err);
        }

        const defaultSchema: DatabaseSchema = {
          owners: INITIAL_OWNERS,
          clients: [INITIAL_DEMO_CLIENT],
          services: INITIAL_SERVICES,
          bookingRequests: [INITIAL_DEMO_BOOKING],
          bookingPriceHistories: [],
          serviceProjects: [INITIAL_DEMO_PROJECT],
          privateDeliveries: INITIAL_DEMO_PROJECT.deliveries,
          publicWorks: INITIAL_PUBLIC_WORKS,
          testimonials: INITIAL_TESTIMONIALS,
          studioCMS: INITIAL_STUDIO_CMS,
          auditLogs: [
            {
              id: 'audit-1',
              actorRole: 'primary_owner',
              actorName: 'Kurudi Bharath Kumar',
              actorIdentifier: '9346227894',
              action: 'STUDIO_INITIALIZED',
              details: 'KBK Film Studios database initialized with full service catalog & credentials.',
              timestamp: new Date().toISOString()
            }
          ],
          otpVerifications: [],
          clientVideoDeliveries: INITIAL_CLIENT_VIDEO_DELIVERIES,
        };

        return this.normalizeBundledVideoUrls(defaultSchema);
      })();

      const merged = fallbackSchema;
      void this.syncSupabaseIfAvailable();
      return merged;
    }

    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure initial primary owners exist
        for (const initialOwner of INITIAL_OWNERS) {
          if (!parsed.owners.some((o: any) => o.phone === initialOwner.phone || o.email === initialOwner.email)) {
            parsed.owners.unshift(initialOwner);
          }
        }
        return this.normalizeBundledVideoUrls(parsed);
      }
    } catch (err) {
      console.error('Error reading database file, loading default initial schema:', err);
    }

    const defaultSchema: DatabaseSchema = {
      owners: INITIAL_OWNERS,
      clients: [INITIAL_DEMO_CLIENT],
      services: INITIAL_SERVICES,
      bookingRequests: [INITIAL_DEMO_BOOKING],
      bookingPriceHistories: [],
      serviceProjects: [INITIAL_DEMO_PROJECT],
      privateDeliveries: INITIAL_DEMO_PROJECT.deliveries,
      publicWorks: INITIAL_PUBLIC_WORKS,
      testimonials: INITIAL_TESTIMONIALS,
      studioCMS: INITIAL_STUDIO_CMS,
      auditLogs: [
        {
          id: 'audit-1',
          actorRole: 'primary_owner',
          actorName: 'Kurudi Bharath Kumar',
          actorIdentifier: '9346227894',
          action: 'STUDIO_INITIALIZED',
          details: 'KBK Film Studios database initialized with full service catalog & credentials.',
          timestamp: new Date().toISOString()
        }
      ],
      otpVerifications: [],
      clientVideoDeliveries: INITIAL_CLIENT_VIDEO_DELIVERIES,
    };

    const normalizedDefaultSchema = this.normalizeBundledVideoUrls(defaultSchema);
    this.saveDatabase(normalizedDefaultSchema);
    return normalizedDefaultSchema;
  }

  public saveDatabase(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  // Getters
  public getOwners() { return this.data.owners; }
  public getClients() { return this.data.clients; }
  public getServices() { return this.data.services; }
  public getBookingRequests() { return this.data.bookingRequests; }
  public getBookingPriceHistories() { return this.data.bookingPriceHistories; }
  public getServiceProjects() { return this.data.serviceProjects; }
  public getPrivateDeliveries() { return this.data.privateDeliveries; }
  public getPublicWorks() { return this.data.publicWorks; }
  public getTestimonials() { return this.data.testimonials; }
  public getStudioCMS() { return this.data.studioCMS; }
  public getAuditLogs() { return this.data.auditLogs; }
  public getOTPVerifications() { return this.data.otpVerifications; }
  public getClientVideoDeliveries() { return this.data.clientVideoDeliveries || []; }

  // Atomic Public Works Operations
  public async saveWork(work: PublicWork): Promise<PublicWork> {
    const idx = this.data.publicWorks.findIndex(w => w.id === work.id);
    if (idx >= 0) {
      this.data.publicWorks[idx] = work;
    } else {
      this.data.publicWorks.unshift(work);
    }
    if (isSupabaseEnabled()) {
      await upsertWorkSupabase(work);
    }
    this.saveDatabase();
    return work;
  }

  public async deleteWork(id: string): Promise<boolean> {
    const cleanId = decodeURIComponent(id || '').trim();
    const idx = this.data.publicWorks.findIndex(w => w.id === cleanId || w.id.toLowerCase() === cleanId.toLowerCase());
    if (idx >= 0) {
      this.data.publicWorks.splice(idx, 1);
      if (isSupabaseEnabled()) {
        await deleteWorkSupabase(cleanId);
      }
      this.saveDatabase();
      return true;
    }
    if (isSupabaseEnabled()) {
      await deleteWorkSupabase(cleanId);
    }
    return false;
  }

  // Atomic Services Operations
  public async saveService(service: ServiceItem): Promise<ServiceItem> {
    const idx = this.data.services.findIndex(s => s.id === service.id);
    if (idx >= 0) {
      this.data.services[idx] = service;
    } else {
      this.data.services.push(service);
    }
    if (isSupabaseEnabled()) {
      await upsertServiceSupabase(service);
    }
    this.saveDatabase();
    return service;
  }

  public async deleteService(id: string): Promise<boolean> {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.data.services.splice(idx, 1);
      if (isSupabaseEnabled()) {
        await deleteServiceSupabase(id);
      }
      this.saveDatabase();
      return true;
    }
    if (isSupabaseEnabled()) {
      await deleteServiceSupabase(id);
    }
    return false;
  }

  // Atomic Testimonials Operations
  public async saveTestimonial(testimonial: Testimonial): Promise<Testimonial> {
    const idx = this.data.testimonials.findIndex(t => t.id === testimonial.id);
    if (idx >= 0) {
      this.data.testimonials[idx] = testimonial;
    } else {
      this.data.testimonials.unshift(testimonial);
    }
    if (isSupabaseEnabled()) {
      await upsertTestimonialSupabase(testimonial);
    }
    this.saveDatabase();
    return testimonial;
  }

  public async deleteTestimonial(id: string): Promise<boolean> {
    const idx = this.data.testimonials.findIndex(t => t.id === id);
    if (idx >= 0) {
      this.data.testimonials.splice(idx, 1);
      if (isSupabaseEnabled()) {
        await deleteTestimonialSupabase(id);
      }
      this.saveDatabase();
      return true;
    }
    if (isSupabaseEnabled()) {
      await deleteTestimonialSupabase(id);
    }
    return false;
  }

  // Atomic Bookings Operations
  public async saveBooking(booking: BookingRequest): Promise<BookingRequest> {
    const idx = this.data.bookingRequests.findIndex(b => b.id === booking.id || b.bookingRef === booking.bookingRef);
    if (idx >= 0) {
      this.data.bookingRequests[idx] = booking;
    } else {
      this.data.bookingRequests.unshift(booking);
    }
    if (isSupabaseEnabled()) {
      await upsertBookingSupabase(booking);
    }
    this.saveDatabase();
    return booking;
  }

  public async deleteBooking(id: string): Promise<boolean> {
    const idx = this.data.bookingRequests.findIndex(b => b.id === id || b.bookingRef === id);
    if (idx >= 0) {
      const removed = this.data.bookingRequests.splice(idx, 1)[0];
      this.data.serviceProjects = this.data.serviceProjects.filter(p => p.bookingId !== removed.id && p.bookingRef !== removed.bookingRef);
      if (isSupabaseEnabled()) {
        await deleteBookingSupabase(id);
      }
      this.saveDatabase();
      return true;
    }
    if (isSupabaseEnabled()) {
      await deleteBookingSupabase(id);
    }
    return false;
  }

  // Atomic Project Operations
  public async saveProject(project: ServiceProject): Promise<ServiceProject> {
    const idx = this.data.serviceProjects.findIndex(p => p.id === project.id || p.bookingRef === project.bookingRef);
    if (idx >= 0) {
      this.data.serviceProjects[idx] = project;
    } else {
      this.data.serviceProjects.unshift(project);
    }
    if (isSupabaseEnabled()) {
      await upsertProjectSupabase(project);
    }
    this.saveDatabase();
    return project;
  }

  public async deleteProject(id: string): Promise<boolean> {
    const idx = this.data.serviceProjects.findIndex(p => p.id === id || p.bookingRef === id);
    if (idx >= 0) {
      this.data.serviceProjects.splice(idx, 1);
      if (isSupabaseEnabled()) {
        await deleteProjectSupabase(id);
      }
      this.saveDatabase();
      return true;
    }
    if (isSupabaseEnabled()) {
      await deleteProjectSupabase(id);
    }
    return false;
  }

  // Atomic CMS Operations
  public async updateCMS(cms: StudioCMSData): Promise<StudioCMSData> {
    this.data.studioCMS = cms;
    if (isSupabaseEnabled()) {
      await updateCmsSupabase(cms);
    }
    this.saveDatabase();
    return cms;
  }

  // Atomic Owner Operations
  public async saveOwner(owner: Owner): Promise<Owner> {
    const idx = this.data.owners.findIndex(o => o.id === owner.id || o.phone === owner.phone || o.email === owner.email);
    if (idx >= 0) {
      this.data.owners[idx] = owner;
    } else {
      this.data.owners.push(owner);
    }
    if (isSupabaseEnabled()) {
      await upsertOwnerSupabase(owner);
    }
    this.saveDatabase();
    return owner;
  }

  public async deleteOwner(id: string): Promise<boolean> {
    const idx = this.data.owners.findIndex(o => o.id === id);
    if (idx >= 0) {
      this.data.owners.splice(idx, 1);
      if (isSupabaseEnabled()) {
        await deleteOwnerSupabase(id);
      }
      this.saveDatabase();
      return true;
    }
    if (isSupabaseEnabled()) {
      await deleteOwnerSupabase(id);
    }
    return false;
  }

  // Client Video Deliveries Management
  public async addClientVideoDelivery(delivery: ClientVideoDelivery): Promise<ClientVideoDelivery> {
    if (!this.data.clientVideoDeliveries) this.data.clientVideoDeliveries = [];
    this.data.clientVideoDeliveries.unshift(delivery);
    if (isSupabaseEnabled()) {
      await upsertClientVideoDeliverySupabase(delivery);
    }
    this.saveDatabase();
    return delivery;
  }

  public async updateClientVideoDelivery(id: string, updates: Partial<ClientVideoDelivery>): Promise<ClientVideoDelivery | null> {
    if (!this.data.clientVideoDeliveries) return null;
    const idx = this.data.clientVideoDeliveries.findIndex(d => d.id === id);
    if (idx === -1) return null;
    const updated = { ...this.data.clientVideoDeliveries[idx], ...updates, updatedAt: new Date().toISOString() };
    this.data.clientVideoDeliveries[idx] = updated;
    if (isSupabaseEnabled()) {
      await upsertClientVideoDeliverySupabase(updated);
    }
    this.saveDatabase();
    return updated;
  }

  public async removeClientVideoDelivery(id: string): Promise<boolean> {
    if (!this.data.clientVideoDeliveries) return false;
    const idx = this.data.clientVideoDeliveries.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.data.clientVideoDeliveries.splice(idx, 1);
    if (isSupabaseEnabled()) {
      await deleteClientVideoDeliverySupabase(id);
    }
    this.saveDatabase();
    return true;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    this.saveDatabase();
    return log;
  }
}

export const db = new DatabaseManager();
export type { ClientVideoDelivery };

