import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { workflowEngine } from './workflowEngine.js';
import { automationEngine } from './automation/engine.js';
import { supabase, isSupabaseEnabled, isValidUUID } from './supabase.js';
import {
  BookingRequest,
  ServiceProject,
  ServiceItem,
  PrivateDeliveryFile,
  PublicWork,
  Testimonial,
  StudioCMSData,
  Owner,
  ServiceProjectStage
} from './types.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kbk_film_studios_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (hero reel, client videos, and logo)
const clientPublicPath = path.resolve(process.cwd(), '..', 'client', 'public');
if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
}

// Serve private deliveries storage for direct streaming
const storagePath = path.resolve(process.cwd(), 'storage');
if (fs.existsSync(storagePath)) {
  app.use('/storage', express.static(storagePath));
}

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARES
// ----------------------------------------------------

interface AuthRequest extends Request {
  owner?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

const normalizePhoneDigits = (value: string) => {
  const digits = (value || '').replace(/\D/g, '');
  return digits.startsWith('91') ? digits.slice(2) : digits;
};

const matchesPhoneIdentifier = (candidate: string, target: string) => {
  const cand = normalizePhoneDigits(candidate);
  const targ = normalizePhoneDigits(target);
  if (!cand || !targ) return false;
  return cand === targ || cand.endsWith(targ) || targ.endsWith(cand);
};

const findDeliveryByToken = (token: string) => {
  const privateDelivery = db.getPrivateDeliveries().find(d => d.downloadToken === token);
  if (privateDelivery) return privateDelivery;

  const clientDelivery = db.getClientVideoDeliveries().find(d => d.downloadToken === token && d.isActive !== false);
  if (!clientDelivery) return null;

  return {
    ...clientDelivery,
    projectId: clientDelivery.projectId || clientDelivery.bookingRef,
    title: clientDelivery.title || `${clientDelivery.bookingRef} Private Delivery`,
    fileName: clientDelivery.fileName || `${clientDelivery.bookingRef}_private_video.mp4`,
    fileSizeBytes: clientDelivery.fileSizeBytes || 0,
    fileSizeFormatted: clientDelivery.fileSizeFormatted || 'Unknown size',
    mimeType: clientDelivery.mimeType || 'video/mp4',
    fileCategory: clientDelivery.fileCategory || 'master_video',
    expiryDate: clientDelivery.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString(),
    downloadCount: clientDelivery.downloadCount || 0,
    maxDownloads: clientDelivery.maxDownloads || 50,
    isStreamable: clientDelivery.isStreamable !== false,
    streamUrl: clientDelivery.streamUrl || `/api/client/stream-delivery/${token}`,
    createdAt: clientDelivery.createdAt || new Date().toISOString(),
  } as any;
};

const requireOwnerAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Owner session token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded) {
      res.status(403).json({ error: 'Forbidden: Invalid owner token payload' });
      return;
    }

    // Verify owner still exists and is active in database
    const ownerRecord = db.getOwners().find(
      o => o.isActive && (o.phone === decoded.phone || o.email.toLowerCase() === decoded.email.toLowerCase())
    );

    if (!ownerRecord) {
      res.status(403).json({ error: 'Forbidden: Owner account is deactivated or disconnected.' });
      return;
    }

    req.owner = ownerRecord;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired owner session token' });
    return;
  }
};

// Multer Config for Deliveries
const deliveryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;
    const dir = path.resolve(process.cwd(), 'storage', 'private_deliveries', id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const uploadDelivery = multer({ storage: deliveryStorage });

// Multer Storage for Showcase Videos & Photos
const showcaseMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(process.cwd(), 'storage', 'showcase_media');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${sanitized}`);
  }
});
const uploadMedia = multer({
  storage: showcaseMediaStorage,
  limits: { fileSize: 300 * 1024 * 1024 } // 300MB
});

app.post('/api/owner/media/upload', uploadMedia.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No media file uploaded' });
    return;
  }
  const isImage = req.file.mimetype.startsWith('image/');
  const isVideo = req.file.mimetype.startsWith('video/');
  const cleanFileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `showcase/${cleanFileName}`;

  // 1. Upload directly to Supabase Storage for persistent cloud hosting
  if (isSupabaseEnabled() && supabase) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      let { data, error } = await supabase.storage
        .from('showcase_media')
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      let targetBucket = 'showcase_media';
      if (error) {
        // Fallback to 'deliveries' bucket if 'showcase_media' bucket isn't present
        const fallback = await supabase.storage
          .from('deliveries')
          .upload(filePath, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: true
          });
        if (!fallback.error) {
          targetBucket = 'deliveries';
          error = null;
        }
      }

      if (!error) {
        const { data: pubData } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          try { fs.unlinkSync(req.file.path); } catch {}
          res.json({
            success: true,
            url: pubData.publicUrl,
            fileName: req.file.originalname,
            originalName: req.file.originalname,
            fileSizeBytes: req.file.size,
            mimeType: req.file.mimetype,
            isImage,
            isVideo
          });
          return;
        }
      }
    } catch (sbErr) {
      console.warn('[Server] Supabase storage upload exception:', sbErr);
    }
  }

  // 2. Fallback local URL if Supabase not configured
  const fileUrl = `/storage/showcase_media/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileSizeBytes: req.file.size,
    mimeType: req.file.mimetype,
    isImage,
    isVideo
  });
});

// Public Supabase Configuration Endpoint (allows frontend to auto-sync with Supabase Storage)
app.get('/api/public/supabase-config', (req: Request, res: Response) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || 'https://hhqadycmsxsedlvdfcnn.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  });
});

app.post('/api/owner/projects/:id/upload', requireOwnerAuth, uploadDelivery.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  res.json({
    success: true,
    fileName: req.file.filename,
    fileSizeBytes: req.file.size,
    mimeType: req.file.mimetype,
    storagePath: `storage/private_deliveries/${req.params.id}/${req.file.filename}`
  });
});

// ----------------------------------------------------
// 1. PUBLIC API ROUTES
// ----------------------------------------------------

// Get Studio CMS data (Bio, Education, SKU Degree + MBA, 800+ stats, terms)
app.get('/api/cms', (req: Request, res: Response) => {
  res.json(db.getStudioCMS());
});

// Get Public Services Catalogue with Prices and Inclusions
app.get('/api/services', (req: Request, res: Response) => {
  const services = db.getServices().filter(s => s.isActive);
  res.json(services);
});

// Get Public Works Showcase
app.get('/api/works', (req: Request, res: Response) => {
  const works = db.getPublicWorks().filter(w => w.isPublished);
  res.json(works);
});

// In-memory cache for resolved Google Drive download links
const driveStreamCache = new Map<string, { downloadUrl: string; cookies: string; expiresAt: number }>();
const VIDEO_CACHE_DIR = path.resolve(__dirname, '../uploads/video-cache');
if (!fs.existsSync(VIDEO_CACHE_DIR)) {
  fs.mkdirSync(VIDEO_CACHE_DIR, { recursive: true });
}

// Set of files currently downloading in background
const downloadingSet = new Set<string>();

async function ensureVideoCached(fileId: string): Promise<string | null> {
  const cachePath = path.join(VIDEO_CACHE_DIR, `${fileId}.mp4`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 1000000) {
    return cachePath;
  }

  if (downloadingSet.has(fileId)) {
    return null;
  }

  downloadingSet.add(fileId);
  (async () => {
    try {
      const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const initialRes = await fetch(initialUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const cookies = initialRes.headers.get('set-cookie') || '';
      const text = await initialRes.text();

      let downloadUrl = initialUrl;
      if (text.includes('id="download-form"')) {
        const actionMatch = text.match(/action="([^"]+)"/);
        const action = actionMatch ? actionMatch[1] : 'https://drive.usercontent.google.com/download';
        const uuidMatch = text.match(/name="uuid" value="([^"]+)"/);
        const uuid = uuidMatch ? uuidMatch[1] : '';
        const confirmMatch = text.match(/name="confirm" value="([^"]+)"/);
        const confirm = confirmMatch ? confirmMatch[1] : 't';
        downloadUrl = `${action}?id=${fileId}&export=download&confirm=${confirm}${uuid ? `&uuid=${uuid}` : ''}`;
      }

      const driveRes = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Cookie': cookies
        }
      });

      if (driveRes.ok && driveRes.body) {
        const tempPath = `${cachePath}.tmp`;
        const fileStream = fs.createWriteStream(tempPath);
        const { Readable } = await import('stream');
        await new Promise((resolve, reject) => {
          // @ts-ignore
          Readable.fromWeb(driveRes.body).pipe(fileStream);
          fileStream.on('finish', () => resolve(true));
          fileStream.on('error', (err) => reject(err));
        });
        if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 1000000) {
          fs.renameSync(tempPath, cachePath);
          console.log(`[StreamCache] Cached video ${fileId} (${fs.statSync(cachePath).size} bytes)`);
        }
      }
    } catch (err) {
      console.error(`[StreamCache] Failed caching ${fileId}:`, err);
    } finally {
      downloadingSet.delete(fileId);
    }
  })();

  return null;
}

async function getDriveDirectDownloadUrl(fileId: string): Promise<{ downloadUrl: string; cookies: string }> {
  const cached = driveStreamCache.get(fileId);
  if (cached && cached.expiresAt > Date.now()) {
    return { downloadUrl: cached.downloadUrl, cookies: cached.cookies };
  }

  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const initialRes = await fetch(initialUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  const cookies = initialRes.headers.get('set-cookie') || '';
  const text = await initialRes.text();

  let downloadUrl = initialUrl;
  if (text.includes('id="download-form"')) {
    const actionMatch = text.match(/action="([^"]+)"/);
    const action = actionMatch ? actionMatch[1] : 'https://drive.usercontent.google.com/download';
    const uuidMatch = text.match(/name="uuid" value="([^"]+)"/);
    const uuid = uuidMatch ? uuidMatch[1] : '';
    const confirmMatch = text.match(/name="confirm" value="([^"]+)"/);
    const confirm = confirmMatch ? confirmMatch[1] : 't';

    downloadUrl = `${action}?id=${fileId}&export=download&confirm=${confirm}${uuid ? `&uuid=${uuid}` : ''}`;
  }

  const result = { downloadUrl, cookies, expiresAt: Date.now() + 15 * 60 * 1000 };
  driveStreamCache.set(fileId, result);
  return result;
}

// Public Google Drive Video Stream Proxy (Supports instant local disk streaming + HTML5 autoplay)
app.get('/api/public/stream-drive/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send('File ID required');
    return;
  }

  const cachePath = path.join(VIDEO_CACHE_DIR, `${id}.mp4`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 1000000) {
    const stat = fs.statSync(cachePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(cachePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      };
      res.writeHead(200, head);
      fs.createReadStream(cachePath).pipe(res);
    }
    return;
  }

  // Trigger background caching for future instant streams
  ensureVideoCached(id);

  try {
    const { downloadUrl, cookies } = await getDriveDirectDownloadUrl(id);
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };
    if (cookies) headers['Cookie'] = cookies;
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const driveRes = await fetch(downloadUrl, { headers });

    if (!driveRes.ok && driveRes.status !== 206) {
      driveStreamCache.delete(id);
      res.status(driveRes.status).send('Unable to stream media from Google Drive');
      return;
    }

    const contentType = driveRes.headers.get('content-type') || 'video/mp4';
    const contentLength = driveRes.headers.get('content-length');
    const contentRange = driveRes.headers.get('content-range');
    const acceptRanges = driveRes.headers.get('accept-ranges') || 'bytes';

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType.includes('html') ? 'video/mp4' : contentType,
      'Accept-Ranges': acceptRanges
    };

    if (contentLength) responseHeaders['Content-Length'] = contentLength;
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    res.writeHead(driveRes.status, responseHeaders);

    if (driveRes.body) {
      const { Readable } = await import('stream');
      // @ts-ignore
      Readable.fromWeb(driveRes.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Error streaming Google Drive video:', err);
    if (!res.headersSent) {
      res.status(500).send('Streaming error');
    }
  }
});

// Get Public Testimonials
app.get('/api/testimonials', (req: Request, res: Response) => {
  const testimonials = db.getTestimonials().filter(t => t.isPublished);
  res.json(testimonials);
});

// Submit New Booking Request
app.post('/api/bookings', async (req: Request, res: Response) => {
  const {
    fullName,
    phone,
    email,
    city,
    serviceId,
    eventDate,
    preferredDeliveryDate,
    budgetRange,
    footageDetails,
    referenceLinks,
    customNotes,
    agreedTerms
  } = req.body;

  if (!fullName || !phone || !email || !serviceId || !eventDate || !agreedTerms) {
    res.status(400).json({ error: 'Missing required booking fields or terms agreement' });
    return;
  }

  const service = db.getServices().find(s => s.id === serviceId);
  if (!service) {
    res.status(404).json({ error: 'Selected service not found in catalogue' });
    return;
  }

  // Generate unique booking reference (e.g., KBK-2026-XXXX)
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const bookingRef = `KBK-2026-${randomDigits}`;

  // Find or create Client record
  let client = db.getClients().find(c => c.phone === phone || c.email.toLowerCase() === email.toLowerCase());
  if (!client) {
    client = {
      id: `client-${Date.now()}`,
      fullName,
      phone,
      email,
      city: city || 'Not specified',
      createdAt: new Date().toISOString()
    };
    db.getClients().push(client);
  }

  // Create immutable Price Snapshot
  const priceSnapshot = {
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
  };

  const booking: BookingRequest = {
    id: `book-${Date.now()}`,
    bookingRef,
    clientId: client.id,
    clientName: fullName,
    clientPhone: phone,
    clientEmail: email,
    clientCity: city || 'Not specified',
    serviceId: service.id,
    serviceTitle: service.title,
    eventDate,
    preferredDeliveryDate: preferredDeliveryDate || '',
    budgetRange: budgetRange || `₹${service.basePrice.toLocaleString('en-IN')}`,
    footageDetails: footageDetails || '',
    referenceLinks: referenceLinks || '',
    customNotes: customNotes || '',
    agreedTerms: Boolean(agreedTerms),
    priceSnapshot,
    quotedAmount: service.basePrice,
    finalAmount: service.basePrice,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  await db.saveBooking(booking);

  // Trigger Automation Workflow: Client creation + Project creation + Audit Log + n8n dispatch
  try {
    await automationEngine.handleBookingCreated(booking, db);
  } catch (wfErr) {
    console.error('[AutomationEngine] Booking automation error:', wfErr);
  }

  db.addAuditLog({
    actorRole: 'client',
    actorName: fullName,
    actorIdentifier: phone,
    action: 'BOOKING_SUBMITTED',
    details: `Booking ${bookingRef} created for ${service.title} (Snapshot Price: ₹${service.basePrice.toLocaleString('en-IN')}).`
  });

  res.status(201).json({
    success: true,
    message: 'Booking request submitted successfully! Kurudi Bharath Kumar has been notified.',
    bookingRef,
    serviceTitle: service.title,
    quotedAmount: service.basePrice,
    estimatedTurnaround: `${service.turnaroundDays} Days`
  });
});

// ----------------------------------------------------
// 2. PASSWORDLESS AUTHENTICATION & OTP
// ----------------------------------------------------

// Request Owner Access OTP (Registered owners only)
app.post('/api/auth/owner-request-otp', (req: Request, res: Response) => {
  const { identifier } = req.body; // phone or email
  if (!identifier) {
    res.status(400).json({ error: 'Phone number or email is required' });
    return;
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const digitsOnly = cleanIdentifier.replace(/\D/g, '');
  const owner = db.getOwners().find(o => {
    if (!o.isActive) return false;
    const ownerDigits = (o.phone || '').replace(/\D/g, '');
    const matchesPhone = digitsOnly.length >= 10 && (
      ownerDigits === digitsOnly ||
      ownerDigits.endsWith(digitsOnly) ||
      digitsOnly.endsWith(ownerDigits)
    );
    const matchesEmail = (o.email || '').toLowerCase() === cleanIdentifier;
    return matchesPhone || matchesEmail;
  });

  if (!owner) {
    res.status(403).json({
      error: 'Access restricted: This phone number or email is not registered as an authorized owner.'
    });
    return;
  }

  // Generate 6-digit OTP code (Standard studio demo OTP: 123456 or generated)
  const otpCode = '123456';
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  const otpRecord = {
    id: `otp-${Date.now()}`,
    identifier: cleanIdentifier,
    otpCode,
    purpose: 'owner_login' as const,
    expiresAt,
    verified: false,
    createdAt: new Date().toISOString()
  };

  db.getOTPVerifications().push(otpRecord);
  db.saveDatabase();

  res.json({
    success: true,
    message: `Verification code sent to registered owner ${owner.name} (${cleanIdentifier}).`,
    demoHint: 'For quick studio demonstration, use code: 123456'
  });
});

// Verify Owner OTP & Issue Session
app.post('/api/auth/owner-verify-otp', (req: Request, res: Response) => {
  const { identifier, otpCode } = req.body;
  if (!identifier || !otpCode) {
    res.status(400).json({ error: 'Identifier and OTP code are required' });
    return;
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const digitsOnly = cleanIdentifier.replace(/\D/g, '');
  const owner = db.getOwners().find(o => {
    if (!o.isActive) return false;
    const ownerDigits = (o.phone || '').replace(/\D/g, '');
    const matchesPhone = digitsOnly.length >= 10 && (
      ownerDigits === digitsOnly ||
      ownerDigits.endsWith(digitsOnly) ||
      digitsOnly.endsWith(ownerDigits)
    );
    const matchesEmail = (o.email || '').toLowerCase() === cleanIdentifier;
    return matchesPhone || matchesEmail;
  });

  if (!owner) {
    res.status(403).json({ error: 'Unauthorized owner account' });
    return;
  }

  // Verify OTP
  if (otpCode !== '123456') {
    const validOTP = db.getOTPVerifications().find(
      o => o.identifier === cleanIdentifier && o.otpCode === otpCode && o.expiresAt > Date.now() && !o.verified
    );
    if (!validOTP) {
      res.status(400).json({ error: 'Invalid or expired verification code' });
      return;
    }
    validOTP.verified = true;
    db.saveDatabase();
  }

  const tokenPayload = {
    id: owner.id,
    name: owner.name,
    phone: owner.phone,
    email: owner.email,
    role: owner.role,
    permissions: owner.permissions
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  db.addAuditLog({
    actorRole: owner.role,
    actorName: owner.name,
    actorIdentifier: owner.phone,
    action: 'OWNER_AUTHENTICATED',
    details: `Owner ${owner.name} logged in to Owner Space.`
  });

  res.json({
    success: true,
    token,
    owner: tokenPayload
  });
});

// Request Client Service Tracking OTP (Booking Ref + Phone/Email)
app.post('/api/auth/client-request-otp', (req: Request, res: Response) => {
  const { bookingRef, identifier } = req.body;
  if (!bookingRef || !identifier) {
    res.status(400).json({ error: 'Booking Reference and registered Phone/Email are required' });
    return;
  }

  const cleanRef = bookingRef.trim().toUpperCase();
  const cleanId = identifier.trim().toLowerCase();

  const booking = db.getBookingRequests().find(b => b.bookingRef === cleanRef);
  if (!booking) {
    res.status(404).json({ error: 'No booking found with this Reference Code' });
    return;
  }

  // Verify that the identifier matches this booking
  const matches =
    booking.clientPhone.toLowerCase() === cleanId ||
    booking.clientEmail.toLowerCase() === cleanId ||
    matchesPhoneIdentifier(booking.clientPhone, cleanId) ||
    matchesPhoneIdentifier(cleanId, booking.clientPhone);

  if (!matches) {
    res.status(403).json({
      error: 'The provided phone/email does not match the registered client on this booking.'
    });
    return;
  }

  const otpCode = '123456';
  const expiresAt = Date.now() + 15 * 60 * 1000;

  db.getOTPVerifications().push({
    id: `otp-${Date.now()}`,
    identifier: cleanId,
    otpCode,
    purpose: 'client_tracking',
    bookingRef: cleanRef,
    expiresAt,
    verified: false,
    createdAt: new Date().toISOString()
  });
  db.saveDatabase();

  res.json({
    success: true,
    message: `Verification code sent to client for booking ${cleanRef}.`,
    demoHint: 'For quick demonstration, use code: 123456'
  });
});

// Verify Client OTP & Return Private Service Tracking Token
app.post('/api/auth/client-verify-otp', (req: Request, res: Response) => {
  const { bookingRef, identifier, otpCode } = req.body;
  if (!bookingRef || !identifier || !otpCode) {
    res.status(400).json({ error: 'Booking Reference, Identifier, and OTP are required' });
    return;
  }

  const cleanRef = bookingRef.trim().toUpperCase();
  const cleanId = identifier.trim().toLowerCase();

  const booking = db.getBookingRequests().find(b => b.bookingRef === cleanRef);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  const phoneMatches = matchesPhoneIdentifier(booking.clientPhone, cleanId) || matchesPhoneIdentifier(cleanId, booking.clientPhone);
  const emailMatches = booking.clientEmail.toLowerCase() === cleanId;
  if (!phoneMatches && !emailMatches) {
    res.status(403).json({ error: 'The provided phone/email does not match the registered client on this booking.' });
    return;
  }

  if (otpCode !== '123456') {
    const validOTP = db.getOTPVerifications().find(
      o => o.bookingRef === cleanRef && o.identifier === cleanId && o.otpCode === otpCode && o.expiresAt > Date.now()
    );
    if (!validOTP) {
      res.status(400).json({ error: 'Invalid or expired OTP code' });
      return;
    }
    validOTP.verified = true;
    db.saveDatabase();
  }

  // Issue Client Token valid for this specific booking reference ONLY
  const clientToken = jwt.sign(
    {
      bookingRef: cleanRef,
      clientId: booking.clientId,
      clientName: booking.clientName,
      role: 'client'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    clientToken,
    bookingRef: cleanRef,
    clientName: booking.clientName
  });
});

// Client requests OTP to retrieve forgotten Booking References
app.post('/api/auth/client-forgot-reference', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    res.status(400).json({ error: 'Registered Phone/Email is required to search booking references' });
    return;
  }

  const cleanId = identifier.trim().toLowerCase();
  const bookings = db.getBookingRequests().filter(
    b => b.clientPhone === cleanId || b.clientEmail.toLowerCase() === cleanId
  );

  if (bookings.length === 0) {
    res.status(404).json({ error: 'No bookings found associated with this Phone or Email' });
    return;
  }

  const otpCode = '123456';
  const expiresAt = Date.now() + 15 * 60 * 1000;

  db.getOTPVerifications().push({
    id: `otp-${Date.now()}`,
    identifier: cleanId,
    otpCode,
    purpose: 'forgot_reference',
    bookingRef: 'FORGOT-REF',
    expiresAt,
    verified: false,
    createdAt: new Date().toISOString()
  });
  db.saveDatabase();

  res.json({
    success: true,
    message: `Verification code sent to retrieve booking references.`,
    demoHint: 'For quick demonstration, use code: 123456'
  });
});

// Verify OTP and return all matched booking references
app.post('/api/auth/client-verify-forgot-reference', (req: Request, res: Response) => {
  const { identifier, otpCode } = req.body;
  if (!identifier || !otpCode) {
    res.status(400).json({ error: 'Identifier and OTP code are required' });
    return;
  }

  const cleanId = identifier.trim().toLowerCase();

  if (otpCode !== '123456') {
    const validOTP = db.getOTPVerifications().find(
      o => o.identifier === cleanId && o.otpCode === otpCode && o.expiresAt > Date.now() && o.purpose === 'forgot_reference'
    );
    if (!validOTP) {
      res.status(400).json({ error: 'Invalid or expired OTP verification code' });
      return;
    }
    validOTP.verified = true;
    db.saveDatabase();
  }

  const bookings = db.getBookingRequests().filter(
    b => b.clientPhone === cleanId || b.clientEmail.toLowerCase() === cleanId
  );

  const referenceResults = bookings.map(b => ({
    bookingRef: b.bookingRef,
    serviceTitle: b.serviceTitle,
    clientName: b.clientName,
    createdAt: b.createdAt,
    status: b.status
  }));

  res.json({
    success: true,
    bookings: referenceResults
  });
});

// ----------------------------------------------------
// 3. CLIENT SPACE & DATA ISOLATION ENDPOINTS
// ----------------------------------------------------

// Get Client Active Service with strict Data Isolation
app.get('/api/client/track', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required to track service' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== 'client' || !decoded.bookingRef) {
      res.status(403).json({ error: 'Invalid client access credentials' });
      return;
    }

    const booking = db.getBookingRequests().find(b => b.bookingRef === decoded.bookingRef);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const project = db.getServiceProjects().find(p => p.bookingRef === decoded.bookingRef);
    const secureDeliveries = db.getPrivateDeliveries().filter(d => d.bookingRef === decoded.bookingRef);
    const ownerDeliveries = db.getClientVideoDeliveries()
      .filter(d => d.bookingRef === decoded.bookingRef && d.isActive !== false)
      .map(d => ({
        id: d.id,
        projectId: d.projectId || d.bookingRef,
        bookingRef: d.bookingRef,
        title: d.title || `${d.bookingRef} Private Delivery`,
        fileName: d.fileName || `${d.bookingRef}_private_video.mp4`,
        fileSizeBytes: d.fileSizeBytes || 0,
        fileSizeFormatted: d.fileSizeFormatted || 'Unknown size',
        mimeType: d.mimeType || 'video/mp4',
        fileCategory: d.fileCategory || 'master_video',
        storagePath: d.storagePath || `private_deliveries/${d.bookingRef}`,
        downloadToken: d.downloadToken,
        expiryDate: d.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString(),
        downloadCount: d.downloadCount || 0,
        maxDownloads: d.maxDownloads || 50,
        isStreamable: d.isStreamable !== false,
        streamUrl: d.streamUrl || `/api/client/stream-delivery/${d.downloadToken}`,
        createdAt: d.createdAt || new Date().toISOString(),
      }));

    const deliveries = [...secureDeliveries, ...ownerDeliveries].filter((d, index, arr) => {
      const key = `${d.bookingRef}-${d.downloadToken || d.id}`;
      return arr.findIndex(item => `${item.bookingRef}-${item.downloadToken || item.id}` === key) === index;
    });

    res.json({
      booking,
      project: project || null,
      deliveries
    });
  } catch (err) {
    res.status(401).json({ error: 'Session expired. Please verify with OTP again.' });
  }
});

// Securely stream client video file (Verifies token)
app.get('/api/client/stream/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const delivery = findDeliveryByToken(token);

  if (!delivery) {
    res.status(404).json({ error: 'Secure media file not found or invalid token' });
    return;
  }

  if (new Date(delivery.expiryDate).getTime() < Date.now()) {
    res.status(410).json({ error: 'This secure streaming link has expired.' });
    return;
  }

  const actualFilePath = path.resolve(process.cwd(), 'storage', 'private_deliveries', String(delivery.projectId || 'unknown'), delivery.fileName);
  const sampleVideoPath = path.resolve(process.cwd(), '..', 'client', 'public', 'assets', 'hero-reel.mp4');
  const fileToStream = fs.existsSync(actualFilePath) ? actualFilePath : sampleVideoPath;

  if (fs.existsSync(fileToStream)) {
    const stat = fs.statSync(fileToStream);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(fileToStream, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(fileToStream).pipe(res);
    }
  } else {
    res.status(404).send('Media file stream not available on server storage');
  }
});

// Securely download client file
app.get('/api/client/download/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const delivery = findDeliveryByToken(token);

  if (!delivery) {
    res.status(404).json({ error: 'Download token is invalid' });
    return;
  }

  if (new Date(delivery.expiryDate).getTime() < Date.now()) {
    res.status(410).json({ error: 'This download link has expired' });
    return;
  }

  if (delivery.downloadCount >= delivery.maxDownloads) {
    res.status(429).json({ error: 'Maximum download limit reached for this file package.' });
    return;
  }

  // Increment download count
  delivery.downloadCount += 1;
  if (delivery.projectId) {
    const privateDelivery = db.getPrivateDeliveries().find(d => d.downloadToken === token);
    if (privateDelivery) {
      privateDelivery.downloadCount = delivery.downloadCount;
    }
    const clientDelivery = db.getClientVideoDeliveries().find(d => d.downloadToken === token);
    if (clientDelivery) {
      clientDelivery.downloadCount = delivery.downloadCount;
    }
  }
  db.saveDatabase();

  db.addAuditLog({
    actorRole: 'client',
    actorName: delivery.bookingRef,
    actorIdentifier: delivery.downloadToken,
    action: 'PRIVATE_FILE_DOWNLOADED',
    details: `Downloaded ${delivery.fileName} (${delivery.fileSizeFormatted}). Total downloads: ${delivery.downloadCount}/${delivery.maxDownloads}.`
  });

  const actualFilePath = path.resolve(process.cwd(), 'storage', 'private_deliveries', String(delivery.projectId || 'unknown'), delivery.fileName);
  const sampleVideoPath = path.resolve(process.cwd(), '..', 'client', 'public', 'assets', 'hero-reel.mp4');
  const fileToDownload = fs.existsSync(actualFilePath) ? actualFilePath : sampleVideoPath;

  if (fs.existsSync(fileToDownload)) {
    res.download(fileToDownload, delivery.fileName);
  } else {
    res.status(404).send('File not found in storage');
  }
});

// Client submits testimonial
app.post('/api/client/testimonial', (req: Request, res: Response) => {
  const { bookingRef, clientName, location, rating, reviewText, videoUrl } = req.body;
  if (!bookingRef || !rating || !reviewText) {
    res.status(400).json({ error: 'Booking reference, rating, and review text are required' });
    return;
  }

  const booking = db.getBookingRequests().find(b => b.bookingRef === bookingRef);
  const testimonial: Testimonial = {
    id: `test-${Date.now()}`,
    clientName: clientName || (booking ? booking.clientName : 'Happy Client'),
    serviceTitle: booking ? booking.serviceTitle : 'Cinematic Video Editing',
    eventDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    location: location || (booking ? booking.clientCity : 'Hindupur, AP'),
    rating: Number(rating),
    reviewText,
    videoUrl: videoUrl || '',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    isVerified: true,
    isPublished: true,
    bookingRef,
    createdAt: new Date().toISOString()
  };

  db.getTestimonials().unshift(testimonial);

  // Update project status to testimonial_received if active
  const project = db.getServiceProjects().find(p => p.bookingRef === bookingRef);
  if (project) {
    project.currentStage = 'testimonial_received';
    project.statusHistory.push({
      id: `stat-${Date.now()}`,
      stage: 'testimonial_received',
      stageLabel: 'Testimonial Received',
      message: `Client submitted a 5-star review: "${reviewText.substring(0, 60)}..."`,
      updatedBy: 'Client Portal',
      timestamp: new Date().toISOString()
    });
  }

  db.saveDatabase();

  db.addAuditLog({
    actorRole: 'client',
    actorName: clientName || bookingRef,
    actorIdentifier: bookingRef,
    action: 'TESTIMONIAL_SUBMITTED',
    details: `Client submitted a ${rating}-star testimonial for ${bookingRef}.`
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your testimonial has been submitted and published.',
    testimonial
  });
});

// Client sends message to studio editor
app.post('/api/client/message', (req: Request, res: Response) => {
  const { bookingRef, text } = req.body;
  if (!bookingRef || !text) {
    res.status(400).json({ error: 'Booking reference and message text are required' });
    return;
  }

  const project = db.getServiceProjects().find(p => p.bookingRef === bookingRef);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: 'client' as const,
    senderName: project.clientName,
    text,
    timestamp: new Date().toISOString()
  };

  project.clientMessages.push(newMsg);
  db.saveDatabase();

  res.json({ success: true, message: newMsg });
});

// ----------------------------------------------------
// 4. OWNER SPACE PROTECTED API ENDPOINTS
// ----------------------------------------------------

// Get Dashboard KPIs and Quick Stats
app.get('/api/owner/dashboard-metrics', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const bookings = db.getBookingRequests();
  const projects = db.getServiceProjects();
  const deliveries = db.getPrivateDeliveries();
  const services = db.getServices();
  const cms = db.getStudioCMS();

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeProjects = projects.filter(p => p.currentStage !== 'testimonial_received' && p.currentStage !== 'service_completed');
  const completedProjects = projects.filter(p => p.currentStage === 'testimonial_received' || p.currentStage === 'service_completed');

  res.json({
    totalBookings: bookings.length,
    pendingBookingsCount: pendingBookings.length,
    activeProjectsCount: activeProjects.length,
    completedProjectsCount: completedProjects.length,
    totalDeliveriesCount: deliveries.length,
    activeServicesCount: services.filter(s => s.isActive).length,
    happyClientsCount: cms.happyClientsCount,
    recentBookings: bookings.slice(0, 5),
    recentAuditLogs: db.getAuditLogs().slice(0, 8)
  });
});

// Manage Bookings
app.get('/api/owner/bookings', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  res.json(db.getBookingRequests());
});

// Update Booking Status (Accept / Reject)
app.patch('/api/owner/bookings/:id/status', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason, quotedAmount, scheduledDate, notes } = req.body;

  const booking = db.getBookingRequests().find(b => b.id === id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  booking.status = status;
  if (rejectionReason) booking.rejectionReason = rejectionReason;
  if (quotedAmount) booking.finalAmount = Number(quotedAmount);

  // If accepted, auto-create or update ServiceProject
  if (status === 'accepted') {
    let project = db.getServiceProjects().find(p => p.bookingRef === booking.bookingRef);
    if (!project) {
      project = {
        id: `proj-${Date.now()}`,
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        clientId: booking.clientId,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        clientEmail: booking.clientEmail,
        serviceId: booking.serviceId,
        serviceTitle: booking.serviceTitle,
        trackingToken: `TRK-${booking.bookingRef.replace('KBK-', '')}-SECURE`,
        currentStage: 'accepted_scheduled',
        stageProgressPercent: 20,
        startDate: new Date().toISOString().split('T')[0],
        estimatedDeliveryDate: scheduledDate || booking.preferredDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        statusHistory: [
          {
            id: `stat-${Date.now()}`,
            stage: 'booking_requested',
            stageLabel: 'Booking Requested',
            message: 'Booking submitted and received by KBK Film Studios.',
            updatedBy: 'Client',
            timestamp: booking.createdAt
          },
          {
            id: `stat-${Date.now() + 1}`,
            stage: 'accepted_scheduled',
            stageLabel: 'Accepted & Scheduled',
            message: notes || `Booking accepted by Kurudi Bharath Kumar. Final quote: ₹${(booking.finalAmount || booking.quotedAmount).toLocaleString('en-IN')}.`,
            updatedBy: req.owner?.name || 'Kurudi Bharath Kumar',
            timestamp: new Date().toISOString()
          }
        ],
        internalNotes: notes || '',
        clientMessages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'owner',
            senderName: req.owner?.name || 'Kurudi Bharath Kumar',
            text: `Welcome to KBK Films! We have accepted your booking for ${booking.serviceTitle}. We will begin processing upon raw footage receipt.`,
            timestamp: new Date().toISOString()
          }
        ],
        deliveries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.getServiceProjects().unshift(project);
    }
  }

  db.saveDatabase();

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: `BOOKING_${status.toUpperCase()}`,
    details: `Booking ${booking.bookingRef} marked as ${status} by ${req.owner?.name}.`
  });

  res.json({ success: true, booking });
});

// Update Booking Price with Price Change History
app.post('/api/owner/bookings/:id/price-revision', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { newPrice, reason } = req.body;

  const booking = db.getBookingRequests().find(b => b.id === id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  const previousPrice = booking.finalAmount || booking.quotedAmount;
  booking.finalAmount = Number(newPrice);

  const historyEntry = {
    id: `ph-${Date.now()}`,
    bookingId: booking.id,
    previousPrice,
    newPrice: Number(newPrice),
    currency: 'INR',
    reason: reason || 'Custom quotation revision by studio',
    updatedBy: req.owner?.name || 'Owner',
    timestamp: new Date().toISOString()
  };

  db.getBookingPriceHistories().push(historyEntry);
  db.saveDatabase();

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'PRICE_REVISED',
    details: `Revised price for booking ${booking.bookingRef} from ₹${previousPrice.toLocaleString('en-IN')} to ₹${Number(newPrice).toLocaleString('en-IN')}. Reason: ${reason}`
  });

  res.json({ success: true, booking, history: historyEntry });
});

// Delete Booking Request
app.delete('/api/owner/bookings/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await db.deleteBooking(id);

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'BOOKING_DELETED',
    details: `Booking ${id} was deleted by ${req.owner?.name}.`
  });

  res.json({ success: true, message: `Booking ${id} deleted successfully.` });
});

// Delete Service Project Lifecycle
app.delete('/api/owner/projects/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await db.deleteProject(id);

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'PROJECT_DELETED',
    details: `Lifecycle Project ${id} was deleted by ${req.owner?.name}.`
  });

  res.json({ success: true, message: `Project ${id} deleted successfully.` });
});

// Manage Service Projects Lifecycle (9 Stages)
app.get('/api/owner/projects', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  res.json(db.getServiceProjects());
});

app.patch('/api/owner/projects/:id/stage', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { stage, message } = req.body;

  try {
    const project = db.getServiceProjects().find(p => p.id === id || p.bookingRef === id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const updated = await automationEngine.handleProjectStatusChanged(
      db,
      project,
      stage,
      req.owner?.name || 'Kurudi Bharath Kumar',
      message
    );
    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update project stage' });
  }
});

// Upload / Attach Private Delivery File for Client Locker
app.post('/api/owner/projects/:id/delivery', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, fileName, fileSizeBytes, fileCategory, expiryDays, maxDownloads } = req.body;

  const project = db.getServiceProjects().find(p => p.id === id || p.bookingRef === id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const token = `dl_token_${project.bookingRef.replace('KBK-', '')}_${Math.random().toString(36).substring(2, 8)}`;
  const days = Number(expiryDays) || 90;
  const expiryDate = new Date(Date.now() + days * 86400000).toISOString();

  const newDelivery: PrivateDeliveryFile = {
    id: `del-${Date.now()}`,
    projectId: project.id,
    bookingRef: project.bookingRef,
    title: title || `${project.clientName} Master Video Package`,
    fileName: fileName || `${project.bookingRef}_Master_4K.mp4`,
    fileSizeBytes: Number(fileSizeBytes) || 4886163,
    fileSizeFormatted: `${((Number(fileSizeBytes) || 4886163) / (1024 * 1024)).toFixed(2)} MB`,
    mimeType: 'video/mp4',
    fileCategory: fileCategory || 'master_video',
    storagePath: `private_deliveries/${project.id}/${fileName || 'master.mp4'}`,
    downloadToken: token,
    expiryDate,
    downloadCount: 0,
    maxDownloads: Number(maxDownloads) || 50,
    isStreamable: true,
    streamUrl: `/api/client/stream/${token}`,
    createdAt: new Date().toISOString()
  };

  project.deliveries.push(newDelivery);
  await db.saveProject(project);

  const clientDeliveryRecord = {
    id: `cvd-${Date.now()}`,
    bookingRef: project.bookingRef,
    clientId: project.clientId,
    clientName: project.clientName,
    projectId: project.id,
    title: newDelivery.title,
    description: `Private deliverable for ${project.serviceTitle}`,
    videoUrl: newDelivery.streamUrl || '/assets/hero-reel.mp4',
    videoSourceType: 'direct_mp4',
    thumbnailUrl: '/assets/kbk-logo.jpg',
    fileName: newDelivery.fileName,
    fileSizeBytes: newDelivery.fileSizeBytes,
    fileSizeFormatted: newDelivery.fileSizeFormatted,
    mimeType: newDelivery.mimeType,
    fileCategory: newDelivery.fileCategory,
    downloadToken: newDelivery.downloadToken,
    expiryDate: newDelivery.expiryDate,
    downloadCount: 0,
    maxDownloads: newDelivery.maxDownloads,
    isStreamable: true,
    isActive: true,
    ownerNotes: `Attached by ${req.owner?.name || 'Owner'}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.addClientVideoDelivery(clientDeliveryRecord);
  await automationEngine.handleVideoDeliveryAdded(db, clientDeliveryRecord);

  res.status(201).json({ success: true, delivery: newDelivery, clientDelivery: clientDeliveryRecord });
});

// Manage Services Pricing & Catalog CRUD
app.post('/api/owner/services', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { title, tagline, shortDescription, detailedDescription, priceType, basePrice, inclusions, exclusions, turnaroundDays, badge } = req.body;

  if (!title || !basePrice) {
    res.status(400).json({ error: 'Title and base price are required' });
    return;
  }

  const newService: ServiceItem = {
    id: `srv-${Date.now()}`,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    tagline: tagline || 'Cinematic video editing service',
    shortDescription: shortDescription || '',
    detailedDescription: detailedDescription || '',
    priceType: priceType || 'starting_from',
    basePrice: Number(basePrice),
    currency: 'INR',
    priceLabel: priceType === 'starting_from' ? `Starting from ₹${Number(basePrice).toLocaleString('en-IN')}` : `₹${Number(basePrice).toLocaleString('en-IN')}`,
    inclusions: Array.isArray(inclusions) ? inclusions : [inclusions],
    exclusions: Array.isArray(exclusions) ? exclusions : [exclusions],
    turnaroundDays: Number(turnaroundDays) || 5,
    featured: false,
    isUpcoming: false,
    isActive: true,
    sortOrder: db.getServices().length + 1,
    badge: badge || ''
  };

  db.getServices().push(newService);
  db.saveDatabase();

  res.status(201).json({ success: true, service: newService });
});

app.put('/api/owner/services/:id', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const service = db.getServices().find(s => s.id === id);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }

  Object.assign(service, req.body);
  if (req.body.basePrice || req.body.priceType) {
    service.priceLabel = service.priceType === 'starting_from'
      ? `Starting from ₹${Number(service.basePrice).toLocaleString('en-IN')}`
      : (service.priceType === 'custom_quote' ? 'Custom Quote' : `₹${Number(service.basePrice).toLocaleString('en-IN')}`);
  }

  db.saveDatabase();

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'SERVICE_CATALOG_UPDATED',
    details: `Updated service ${service.title} (Base Price: ₹${service.basePrice.toLocaleString('en-IN')}).`
  });

  res.json({ success: true, service });
});

app.post('/api/owner/works', async (req: Request, res: Response) => {
  const { id, title, category, eventLocation, eventYear, thumbnailUrl, videoUrl, videoSourceType, externalDestUrl, description, softwareUsed } = req.body;
  const validId = (id && isValidUUID(id)) ? id : crypto.randomUUID();

  const newWork: PublicWork = {
    id: validId,
    title: title || 'New Film Showcase',
    category: category || 'Wedding Highlights',
    eventLocation: eventLocation || 'Hindupur, AP',
    eventYear: eventYear || '2026',
    thumbnailUrl: thumbnailUrl || '/assets/kbk-logo.jpg',
    videoUrl: videoUrl || '/assets/hero-reel.mp4',
    videoSourceType: videoSourceType || (videoUrl?.includes('drive.google.com') ? 'google_drive' : 'direct_mp4'),
    externalDestUrl: externalDestUrl || '',
    description: description || '',
    softwareUsed: Array.isArray(softwareUsed) ? softwareUsed : ['Premiere Pro', 'DaVinci Resolve'],
    isFeatured: true,
    isPublished: true,
    sortOrder: db.getPublicWorks().length + 1,
    createdAt: new Date().toISOString()
  };

  await db.saveWork(newWork);

  res.status(201).json({ success: true, work: newWork });
});

app.put('/api/owner/works/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const work = db.getPublicWorks().find(w => w.id === id);
  if (!work) {
    res.status(404).json({ error: 'Work not found' });
    return;
  }

  Object.assign(work, req.body);
  await db.saveWork(work);
  res.json({ success: true, work });
});

app.delete('/api/owner/works/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const cleanId = decodeURIComponent(req.params.id || '').trim();
  await db.deleteWork(cleanId);

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'SHOWCASE_WORK_DELETED',
    details: `Deleted showcase work (${cleanId})`
  });

  res.json({ success: true, message: 'Work deleted successfully' });
});

// Manage Testimonials CRUD
app.post('/api/owner/testimonials', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const newTestimonial: Testimonial = {
    id: `test-${Date.now()}`,
    clientName: req.body.clientName,
    serviceTitle: req.body.serviceTitle || 'Wedding Video Highlights',
    eventDate: req.body.eventDate || '2026',
    location: req.body.location || 'Hindupur, AP',
    rating: Number(req.body.rating) || 5,
    reviewText: req.body.reviewText,
    videoUrl: req.body.videoUrl || '',
    thumbnailUrl: req.body.thumbnailUrl || '/assets/kbk-logo.jpg',
    isVerified: true,
    isPublished: req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true,
    createdAt: new Date().toISOString()
  };

  await db.saveTestimonial(newTestimonial);
  await automationEngine.runWorkflow('TESTIMONIAL_CREATED', { testimonial: newTestimonial }, db);
  res.status(201).json({ success: true, testimonial: newTestimonial });
});

app.put('/api/owner/testimonials/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const testimonial = db.getTestimonials().find(t => t.id === id);
  if (!testimonial) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }

  Object.assign(testimonial, req.body);
  await db.saveTestimonial(testimonial);
  res.json({ success: true, testimonial });
});

app.delete('/api/owner/testimonials/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await db.deleteTestimonial(id);
  res.json({ success: true, message: 'Testimonial deleted' });
});

// Update Studio CMS & Bio
app.put('/api/owner/cms', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const currentCMS = db.getStudioCMS();
  const updated = { ...currentCMS, ...req.body };
  await db.updateCMS(updated);

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'STUDIO_CMS_UPDATED',
    details: `Updated studio profile settings, bio, education, or counters.`
  });

  res.json({ success: true, studioCMS: updated });
});

// ----------------------------------------------------
// AUTOMATION WORKFLOW ENGINE & n8n WEBHOOK ENDPOINTS
// ----------------------------------------------------
app.get('/api/owner/workflows', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const executions = workflowEngine.getExecutions();
  const completed = executions.filter(e => e.status === 'completed').length;
  const failed = executions.filter(e => e.status === 'failed').length;
  const pending = executions.filter(e => e.status === 'pending').length;
  const overdueProjects = db.getServiceProjects().filter(p => p.isOverdue);

  res.json({
    executions,
    stats: {
      total: executions.length,
      completed,
      failed,
      pending,
      overdueCount: overdueProjects.length,
      n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL)
    },
    overdueProjects
  });
});

app.post('/api/owner/workflows/overdue-check', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const flagged = await workflowEngine.checkOverdueProjects(db);
  res.json({ success: true, count: flagged.length, flagged });
});

app.post('/api/owner/workflows/test-n8n', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const testPayload = {
    test: true,
    triggeredBy: req.owner?.name || 'Kurudi Bharath Kumar',
    timestamp: new Date().toISOString(),
    message: 'Hello from KBK Film Studios Automation Engine to n8n Cloud!'
  };
  await workflowEngine.dispatchToN8n('TEST_PING', testPayload);
  res.json({ success: true, message: 'Test ping dispatched to n8n Cloud webhook.', n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL) });
});

// Manage Co-Owners Team
app.get('/api/owner/owners', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const activeOwners = db.getOwners().filter(o => o.isActive !== false);
  res.json(activeOwners);
});

// Check if an identifier is authorized as owner / staff
app.post('/api/owner/check-access', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    res.status(400).json({ error: 'Phone number or email is required' });
    return;
  }
  const raw = identifier.trim().toLowerCase();
  const digitsOnly = raw.replace(/\D/g, '');

  const owner = db.getOwners().find(o => {
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
    res.json({
      authorized: true,
      owner: {
        id: owner.id,
        name: owner.name,
        phone: owner.phone,
        email: owner.email,
        role: owner.role
      }
    });
  } else {
    res.json({
      authorized: false,
      message: 'Access denied. This identifier is not registered as an authorized studio administrator.'
    });
  }
});

app.post('/api/owner/owners', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { name, phone, email, role, permissions } = req.body;
  if (!name || !phone || !email) {
    res.status(400).json({ error: 'Name, phone, and email are required to invite an owner' });
    return;
  }

  const cleanPhone = phone.trim();
  const cleanEmail = email.trim().toLowerCase();

  const existingIndex = db.getOwners().findIndex(
    o => o.phone === cleanPhone || o.email.toLowerCase() === cleanEmail
  );

  if (existingIndex !== -1) {
    const existing = db.getOwners()[existingIndex];
    existing.name = name;
    existing.phone = cleanPhone;
    existing.email = cleanEmail;
    existing.role = role || existing.role || 'co_owner';
    existing.permissions = Array.isArray(permissions) ? permissions : (existing.permissions || ['manage_bookings', 'manage_lifecycle', 'manage_deliveries', 'manage_works', 'manage_pricing', 'manage_cms']);
    existing.isActive = true;
    db.saveDatabase();

    db.addAuditLog({
      actorRole: req.owner?.role as any || 'primary_owner',
      actorName: req.owner?.name || 'Primary Owner',
      actorIdentifier: req.owner?.phone || 'owner',
      action: 'CO_OWNER_UPDATED',
      details: `Reactivated/updated co-owner ${name} (${cleanPhone}, ${cleanEmail}).`
    });

    res.status(200).json({ success: true, owner: existing, message: 'Co-owner updated and activated successfully' });
    return;
  }

  const newOwner: Owner = {
    id: `owner-${Date.now()}`,
    name,
    phone: cleanPhone,
    email: cleanEmail,
    role: role || 'co_owner',
    permissions: Array.isArray(permissions) ? permissions : ['manage_bookings', 'manage_lifecycle', 'manage_deliveries', 'manage_works', 'manage_pricing', 'manage_cms'],
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.getOwners().push(newOwner);
  db.saveDatabase();

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Primary Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'CO_OWNER_INVITED',
    details: `Added new co-owner ${name} (${cleanPhone}, ${cleanEmail}).`
  });

  res.status(201).json({ success: true, owner: newOwner });
});

app.delete('/api/owner/owners/:id', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const owner = db.getOwners().find(o => o.id === id || o.phone === id || o.email.toLowerCase() === id.toLowerCase());
  if (!owner) {
    res.status(404).json({ error: 'Owner not found' });
    return;
  }

  if (owner.role === 'primary_owner' || owner.phone === '9346476951' || owner.email.toLowerCase() === 'ik9893344@gmail.com') {
    res.status(403).json({ error: 'Primary Owner account cannot be removed under any circumstances.' });
    return;
  }

  const index = db.getOwners().findIndex(o => o.id === owner.id);
  if (index !== -1) {
    db.getOwners().splice(index, 1);
  }
  db.saveDatabase();

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'primary_owner',
    actorName: req.owner?.name || 'Primary Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'CO_OWNER_REMOVED',
    details: `Revoked ownership access for ${owner.name} (${owner.phone}).`
  });

  res.json({ success: true, message: `Access revoked for ${owner.name}` });
});

// Audit Logs
app.get('/api/owner/audit-logs', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  res.json(db.getAuditLogs());
});

// ----------------------------------------------------
// CLIENT VIDEO DELIVERIES (OWNER CRUD)
// ----------------------------------------------------

// GET all client video deliveries
app.get('/api/owner/client-video-deliveries', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  res.json(db.getClientVideoDeliveries());
});

// GET deliveries for a specific booking ref (owner)
app.get('/api/owner/client-video-deliveries/booking/:ref', requireOwnerAuth, (req: AuthRequest, res: Response) => {
  const { ref } = req.params;
  const deliveries = db.getClientVideoDeliveries().filter(d => d.bookingRef === ref);
  res.json(deliveries);
});

// POST create a new client video delivery
app.post('/api/owner/client-video-deliveries', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const {
    bookingRef, clientId, clientName, projectId,
    title, description, videoUrl, videoSourceType, thumbnailUrl,
    fileName, fileSizeBytes, fileSizeFormatted, mimeType, fileCategory,
    expiryDays, maxDownloads, isStreamable, ownerNotes
  } = req.body;

  if (!bookingRef || !title || !videoUrl) {
    res.status(400).json({ error: 'bookingRef, title, and videoUrl are required' });
    return;
  }

  const uniqueToken = `cvd_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + (expiryDays || 90));

  // Detect video source type from URL
  let detectedSourceType = videoSourceType || 'direct_mp4';
  if (!videoSourceType) {
    if (videoUrl.includes('drive.google.com') || videoUrl.includes('docs.google.com')) {
      detectedSourceType = 'google_drive';
    } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      detectedSourceType = 'youtube';
    }
  }

  const newDelivery = {
    id: `cvd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    bookingRef,
    clientId: clientId || 'client-unknown',
    clientName: clientName || 'Client',
    projectId: projectId || null,
    title,
    description: description || '',
    videoUrl,
    videoSourceType: detectedSourceType,
    thumbnailUrl: thumbnailUrl || '/assets/kbk-logo.jpg',
    fileName: fileName || `${bookingRef}_video.mp4`,
    fileSizeBytes: fileSizeBytes || 0,
    fileSizeFormatted: fileSizeFormatted || 'Unknown size',
    mimeType: mimeType || 'video/mp4',
    fileCategory: fileCategory || 'master_video',
    downloadToken: uniqueToken,
    expiryDate: expiryDate.toISOString(),
    downloadCount: 0,
    maxDownloads: maxDownloads || 50,
    isStreamable: isStreamable !== false,
    isActive: true,
    ownerNotes: ownerNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = await db.addClientVideoDelivery(newDelivery);

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'co_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'CLIENT_VIDEO_DELIVERY_ADDED',
    details: `Video delivery "${title}" added for booking ${bookingRef}. Drive URL: ${videoUrl.substring(0, 60)}...`
  });

  res.status(201).json({ success: true, delivery: saved });
});

// PUT update a client video delivery
app.put('/api/owner/client-video-deliveries/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await db.updateClientVideoDelivery(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Client video delivery not found' });
    return;
  }

  res.json({ success: true, delivery: updated });
});

// DELETE a client video delivery
app.delete('/api/owner/client-video-deliveries/:id', requireOwnerAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = await db.removeClientVideoDelivery(id);
  if (!success) {
    res.status(404).json({ error: 'Client video delivery not found' });
    return;
  }

  db.addAuditLog({
    actorRole: req.owner?.role as any || 'co_owner',
    actorName: req.owner?.name || 'Owner',
    actorIdentifier: req.owner?.phone || 'owner',
    action: 'CLIENT_VIDEO_DELIVERY_DELETED',
    details: `Video delivery ${id} deleted.`
  });

  res.json({ success: true, message: 'Delivery removed' });
});

// PUBLIC: Get client video deliveries by booking ref + download token (client access)
app.get('/api/client/video-deliveries', async (req: Request, res: Response) => {
  const { bookingRef, token } = req.query as { bookingRef: string; token: string };

  if (!bookingRef) {
    res.status(400).json({ error: 'bookingRef is required' });
    return;
  }

  let deliveries = db.getClientVideoDeliveries().filter(
    d => d.bookingRef === bookingRef && d.isActive
  );

  // If token provided, verify it (for single delivery access)
  if (token) {
    deliveries = deliveries.filter(d => d.downloadToken === token);
  }

  // Check expiry
  const now = new Date();
  deliveries = deliveries.filter(d => {
    if (!d.expiryDate) return true;
    return new Date(d.expiryDate) > now;
  });

  res.json(deliveries);
});

// Stream proxy for client video deliveries (Drive videos via server proxy)
app.get('/api/client/stream-delivery/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  const delivery = db.getClientVideoDeliveries().find(d => d.downloadToken === token && d.isActive);

  if (!delivery) {
    res.status(404).json({ error: 'Delivery not found or expired' });
    return;
  }

  // Check expiry
  if (delivery.expiryDate && new Date(delivery.expiryDate) < new Date()) {
    res.status(410).json({ error: 'Delivery link has expired' });
    return;
  }

  // Redirect to appropriate source
  const url = delivery.videoUrl;
  if (delivery.videoSourceType === 'google_drive' || url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : '';
    if (fileId) {
      // Increment download count
      await db.updateClientVideoDelivery(delivery.id, { downloadCount: delivery.downloadCount + 1 });
      // Stream via existing Google Drive proxy
      res.redirect(`/api/public/stream-drive/${fileId}`);
      return;
    }
  }

  // For direct URLs, redirect
  await db.updateClientVideoDelivery(delivery.id, { downloadCount: delivery.downloadCount + 1 });
  res.redirect(url);
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------

// Start a listener only for local development. Vercel invokes the exported app.
export default app;

if (process.env.VERCEL !== '1') app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎬 KBK Films Backend API Running on Port ${PORT}`);
  console.log(`🚀 Primary Owner: K S Indra Kumar (9346476951)`);
  console.log(`🔒 Client Isolation & Passwordless OTP Service Active`);
  console.log(`📦 Client Video Deliveries API Active`);
  console.log(`====================================================`);
});
