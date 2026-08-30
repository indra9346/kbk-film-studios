import React from 'react';
import { Image as ImageIcon, Film, MessageSquare, MapPin, Play } from 'lucide-react';
import { PublicWork } from '../../types';
import { CinematicVideoPlayer } from './CinematicVideoPlayer';

interface VideoCardProps {
  work: PublicWork;
  onSelect: (work: PublicWork) => void;
}

export const extractDriveFileId = (url: string): string | null => {
  if (!url) return null;
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/file\/u\/\d+\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

export const isImageMedia = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  if (lower.startsWith('data:image/')) return true;
  return (
    lower.includes('.jpg') ||
    lower.includes('.jpeg') ||
    lower.includes('.png') ||
    lower.includes('.webp') ||
    lower.includes('.avif') ||
    lower.includes('.gif') ||
    lower.includes('images.unsplash.com') ||
    lower.includes('/assets/kbk-logo')
  );
};

export const getVideoType = (url: string) => {
  if (!url) return { type: 'unknown', id: '' };
  let trimmed = url.trim();

  // Extract src if user pasted a raw <iframe> tag
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    trimmed = iframeSrcMatch[1];
  }

  if (isImageMedia(trimmed)) {
    return { type: 'image', id: trimmed };
  }

  // YouTube / YouTube Shorts / youtu.be
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return { type: 'youtube', id: shortsMatch[1] };
    }
    const standardMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
    if (standardMatch && standardMatch[1]) {
      return { type: 'youtube', id: standardMatch[1] };
    }
  }

  // Google Drive
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const driveId = extractDriveFileId(trimmed);
    return { type: 'google-drive', id: driveId || '' };
  }

  return { type: 'direct', id: trimmed };
};

export const getCleanVideoUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  const media = getVideoType(trimmed);
  if (media.type === 'google-drive' && media.id) {
    return `https://drive.google.com/file/d/${media.id}/preview`;
  }
  return trimmed;
};

export const VideoCard: React.FC<VideoCardProps> = ({ work, onSelect }) => {
  const isPic = isImageMedia(work.videoUrl) || (!work.videoUrl && Boolean(work.thumbnailUrl));

  const whatsappMessage = encodeURIComponent(
    `Hello Bharath Kumar, I saw the "${work.title}" showcase on KBK Films website and would like to inquire about similar wedding video editing services.`
  );

  return (
    <div
      onClick={() => onSelect(work)}
      className="group relative rounded-3xl overflow-hidden glass-panel glass-panel-hover cursor-pointer border border-gold/20 flex flex-col transition-all duration-300 hover:border-gold/60 shadow-lg hover:shadow-gold-sm"
    >
      {/* Reusable Cinematic Video Container with 2x Autoplay */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <CinematicVideoPlayer
          url={work.videoUrl}
          poster={work.thumbnailUrl || undefined}
          title={work.title}
          category={work.category}
          aspectRatio="16/9"
          autoPlayOnScroll={true}
          showControls={true}
          defaultSpeed={2}
          onExpand={() => onSelect(work)}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-gold/30 text-[10px] font-semibold text-gold uppercase tracking-wider">
            {work.category}
          </span>
          <span className="px-2 py-0.5 rounded bg-gold/90 text-black text-[9px] font-extrabold tracking-wider flex items-center gap-1 shadow-sm">
            {isPic ? (
              <>
                <ImageIcon className="w-2.5 h-2.5 fill-black" />
                PHOTO STILL
              </>
            ) : (
              <>
                <Film className="w-2.5 h-2.5 fill-black" />
                CINEMA
              </>
            )}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-surface-200/50">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-gold transition-colors duration-300 line-clamp-1">
              {work.title}
            </h3>
            <span className="text-[10px] text-ivory-400 shrink-0 font-mono">
              {work.eventYear || '2026'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2 text-[11px] text-gold/90">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gold/70" />
              {work.eventLocation || 'Hindupur, AP'}
            </span>
          </div>

          <p className="text-xs text-ivory-300 font-light line-clamp-2 leading-relaxed">
            {work.description || 'Master color graded and cinematic pace edited wedding showcase.'}
          </p>
        </div>

        {/* Tools Badges & Quick Action */}
        <div className="pt-3 border-t border-surface-50 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {work.softwareUsed && work.softwareUsed.length > 0 ? (
              work.softwareUsed.slice(0, 2).map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-surface-100 text-[9px] text-ivory-400 border border-gold/15 font-mono"
                >
                  {tool}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-surface-100 text-[9px] text-gold/80 border border-gold/15 font-mono">
                DaVinci Resolve Studio
              </span>
            )}
          </div>

          <a
            href={`https://wa.me/919346227894?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-gold hover:text-white font-bold flex items-center gap-1 bg-gold/10 hover:bg-gold/20 px-2 py-1 rounded-lg border border-gold/30 transition-colors shrink-0"
            title="Inquire about this style via WhatsApp"
          >
            <MessageSquare className="w-3 h-3" />
            <span className="hidden xs:inline">Inquire</span>
          </a>
        </div>
      </div>
    </div>
  );
};
