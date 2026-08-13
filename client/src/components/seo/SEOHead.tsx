import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudio } from '../../context/StudioContext';

interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
}

const ROUTE_SEO: Record<string, PageMetadata> = {
  '/': {
    title: 'KBK Films | Luxury Wedding Video Editing, Film Post-Production & Cinematic Shoots (India)',
    description: 'Master 4K wedding video editing, cinematic color grading, pre-wedding romantic films, same-day spot editing, and viral vertical reels across Bangalore, Hyderabad, Mumbai, Delhi, Chennai & all India by Kurudi Bharath Kumar.',
    keywords: 'KBK Films, kbkfilms.com, Luxury Wedding Video Editing, Pre-Wedding Films, Cinematic Color Grading, DaVinci Resolve, Spot Editing, Bangalore, Hyderabad, Mumbai, Delhi, India Wedding Filmmaker',
    canonicalPath: '/'
  },
  '/services': {
    title: 'Services & Transparent Pricing | KBK Film Studios • Pan-India Wedding & Event Video Editing',
    description: 'Explore verified transparent pricing for Wedding Highlights, Pre-Wedding Films, Haldi & Sangeeth, Maternity Shoots, and Same-Day On-Venue Spot Editing with 10-clause protection across India.',
    keywords: 'Wedding Video Editing Prices India, Pre-Wedding Video Cost, Sangeeth Video Editing, Spot Editing Rates, 4K Color Grading Package, KBK Films Services',
    canonicalPath: '/services'
  },
  '/works': {
    title: 'Explore Films & Works Showcase | KBK Film Studios • 4K Cinematic Portfolio (India)',
    description: 'Watch full 4K masterworks including Traditional Muhurtham Films, Grand Wedding Receptions, and Cinematic Teasers with zero buffer streaming and grading breakdowns.',
    keywords: 'Wedding Film Portfolio, 4K Wedding Videos India, Cinematic Muhurtham Film, Reception Highlights, Kurudi Bharath Kumar Works, Video Editing Showcase',
    canonicalPath: '/works'
  },
  '/about': {
    title: 'About Founder Kurudi Bharath Kumar | Master Filmmaker & Senior Colorist • KBK Films India',
    description: 'Discover the craft and vision of Kurudi Bharath Kumar. 1000+ weddings crafted across India, enterprise workstation rig, DaVinci Resolve certified colorist.',
    keywords: 'Kurudi Bharath Kumar, KBK Films Founder, Video Editor Biography, Senior Colorist India, Andhra Pradesh Filmmaker, Wedding Cinema Post-Production',
    canonicalPath: '/about'
  },
  '/testimonials': {
    title: 'Client Reviews & Video Feedback | 1,000+ Happy Couples Across India • KBK Film Studios',
    description: 'Read authentic verified feedback and watch customer video reviews from couples and families across Bangalore, Hyderabad, Mumbai, Chennai, and Rayalaseema who trusted KBK Films.',
    keywords: 'KBK Films Reviews, Client Video Testimonials, Customer Feedback, Best Video Editor Rating, Customer Experiences India',
    canonicalPath: '/testimonials'
  },
  '/book': {
    title: 'Book Cinematic Video Editing Online | Instant Transparent Quote • KBK Film Studios (India)',
    description: 'Calculate your custom video editing quotation with add-ons, select event dates, and submit booking requests with immediate WhatsApp and studio notification.',
    keywords: 'Book Video Editor Online India, Wedding Video Editing Quotation, Instant Quote Calculator, Hire Wedding Colorist, KBK Films Booking',
    canonicalPath: '/book'
  },
  '/track': {
    title: 'Private Service Tracker & Master Delivery Locker | KBK Film Studios India',
    description: 'Track your raw footage ingestion, multi-cam assembly, color grading, sound mastering, and download 4K ProRes deliverables from your secure isolated locker.',
    keywords: 'Track Video Editing Status, Client Delivery Locker, 4K Video Download, KBK Project Tracking, Secure Deliverables India',
    canonicalPath: '/track'
  },
  '/owner': {
    title: 'Owner Space Master Studio Console | KBK Film Studios Management',
    description: 'Authorized studio management console for bookings, pricing CMS, project lifecycle orchestration, and deliverable lockers.',
    keywords: 'KBK Owner Console, Studio Management, Authorized Access',
    canonicalPath: '/owner-space'
  },
  '/owner-space': {
    title: 'Owner Space Master Studio Console | KBK Film Studios Management',
    description: 'Authorized studio management console for bookings, pricing CMS, project lifecycle orchestration, and deliverable lockers.',
    keywords: 'KBK Owner Console, Studio Management, Authorized Access',
    canonicalPath: '/owner-space'
  }
};

export function SEOHead() {
  const location = useLocation();
  const { testimonials, works } = useStudio();

  useEffect(() => {
    const meta = ROUTE_SEO[location.pathname] || ROUTE_SEO['/'];
    const baseUrl = window.location.hostname.includes('kbkfilms.com') 
      ? 'https://kbkfilms.com' 
      : (window.location.origin.includes('localhost') ? 'https://kbkfilms.com' : window.location.origin);

    // 1. Update Title
    document.title = meta.title;

    // 2. Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta Tags
    setMeta('description', meta.description);
    setMeta('keywords', meta.keywords);
    setMeta('title', meta.title);

    // 4. Update OpenGraph Tags
    setMeta('og:title', meta.title, true);
    setMeta('og:description', meta.description, true);
    setMeta('og:url', `${baseUrl}${meta.canonicalPath}`, true);

    // 5. Update Twitter Tags
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);
    setMeta('twitter:url', `${baseUrl}${meta.canonicalPath}`);

    // 6. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${baseUrl}${meta.canonicalPath}`);

    // 7. Dynamic JSON-LD Schema Generation for Testimonials & Video Reviews
    let dynamicSchemaTag = document.getElementById('dynamic-seo-schema') as HTMLScriptElement | null;
    if (!dynamicSchemaTag) {
      dynamicSchemaTag = document.createElement('script');
      dynamicSchemaTag.id = 'dynamic-seo-schema';
      dynamicSchemaTag.type = 'application/ld+json';
      document.head.appendChild(dynamicSchemaTag);
    }

    if (location.pathname === '/testimonials' && testimonials.length > 0) {
      const publishedTestimonials = testimonials.filter(t => t.isPublished);
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "KBK Film Studios Verified Client Reviews & Video Testimonials",
        "itemListElement": publishedTestimonials.map((t, idx) => ({
          "@type": "Review",
          "position": idx + 1,
          "author": {
            "@type": "Person",
            "name": t.clientName
          },
          "reviewBody": t.reviewText,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": t.rating || 5,
            "bestRating": 5,
            "worstRating": 1
          },
          "itemReviewed": {
            "@type": "ProfessionalService",
            "name": "KBK Film Studios",
            "url": "https://kbkfilms.com"
          },
          ...(t.videoUrl ? {
            "video": {
              "@type": "VideoObject",
              "name": `Video Review by ${t.clientName}`,
              "description": t.reviewText,
              "thumbnailUrl": t.thumbnailUrl || "https://kbkfilms.com/assets/kbk-logo.jpg",
              "uploadDate": t.createdAt || new Date().toISOString(),
              "contentUrl": t.videoUrl
            }
          } : {})
        }))
      };
      dynamicSchemaTag.textContent = JSON.stringify(schemaData);
    } else {
      dynamicSchemaTag.textContent = '';
    }
  }, [location, testimonials, works]);

  return null;
}

