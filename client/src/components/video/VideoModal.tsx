import React, { useState } from 'react';
import { X, Calendar, MapPin, Layers, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Download, Image as ImageIcon, Film } from 'lucide-react';
import { PublicWork } from '../../types';
import { getVideoType, getCleanVideoUrl, extractDriveFileId, isImageMedia } from './VideoCard';

interface VideoModalProps {
  work: PublicWork | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ work, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!work) return null;

  const isPic = isImageMedia(work.videoUrl) || (!work.videoUrl && Boolean(work.thumbnailUrl));
  const media = getVideoType(work.videoUrl || work.thumbnailUrl);
  const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(work.videoUrl);
  const isGoogleDrive = Boolean(driveId || work.videoSourceType === 'google_drive' || work.videoUrl?.includes('drive.google.com'));
  const activeMediaUrl = work.videoUrl || work.thumbnailUrl || '/assets/kbk-logo.jpg';

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-surface-200 border border-gold/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-surface-50 bg-surface-100/95 z-20">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 pr-2">
            <span className="px-2 py-0.5 rounded-md bg-gold/15 text-gold text-[9px] sm:text-xs font-bold uppercase tracking-wider border border-gold/30 shrink-0 flex items-center gap-1">
              {isPic ? <ImageIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              <span>{work.category}</span>
            </span>
            <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-white truncate">
              {work.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isPic ? (
              <div className="flex items-center gap-1 bg-surface-200 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border border-gold/20">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 text-ivory-300 hover:text-gold transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 text-ivory-300 hover:text-gold transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="p-1 text-ivory-300 hover:text-gold transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ) : null}

            {isGoogleDrive && driveId && (
              <a
                href={`https://drive.google.com/file/d/${driveId}/view`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-200 hover:bg-gold hover:text-black text-ivory-300 text-[11px] font-semibold transition-colors"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Drive</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-surface-200 hover:bg-gold hover:text-black text-ivory-300 transition-colors"
              title="Close Cinema View"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Media Stream Section (Video or High-Res Photo Still) */}
        <div className="relative aspect-video max-h-[55vh] sm:max-h-[70vh] w-full bg-black flex items-center justify-center overflow-hidden">
          {isPic ? (
            <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
              <img
                src={activeMediaUrl}
                alt={work.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-w-full max-h-full object-contain transition-transform duration-200 rounded-lg shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/kbk-logo.jpg';
                }}
              />
            </div>
          ) : media.type === 'youtube' && media.id ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1`}
              title={work.title}
              className="w-full h-full object-contain border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isGoogleDrive && driveId ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <iframe
                src={`https://drive.google.com/file/d/${driveId}/preview?autoplay=1`}
                title={work.title}
                className="w-full h-full object-contain border-0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={getCleanVideoUrl(work.videoUrl)}
              poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
              autoPlay
              controls
              controlsList="nodownload noplaybackrate"
              playsInline
              className="w-full h-full object-contain cinematic-native-video"
              onError={(e) => {
                const el = e.target as HTMLVideoElement;
                if (el.src !== window.location.origin + '/assets/hero-reel.mp4') {
                  el.src = '/assets/hero-reel.mp4';
                }
              }}
            />
          )}
        </div>

        {/* Details & Creative Breakdown */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-surface-200/95 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-ivory-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                {work.eventLocation || 'Hindupur, AP'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" />
                {work.eventYear || '2026'}
              </span>
            </div>

            {isPic && (
              <a
                href={activeMediaUrl}
                download={work.title.replace(/\s+/g, '_') + '.jpg'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-gold text-xs hover:underline font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open High-Resolution Photo</span>
              </a>
            )}
          </div>

          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-gold uppercase tracking-wider mb-1">
              {isPic ? 'Photo Capture & Color Grading Treatment' : 'Film Narrative & Post-Production Treatment'}
            </h4>
            <p className="text-ivory-200 leading-relaxed font-light text-xs sm:text-sm">
              {work.description || 'Master color graded and cinematic pace edited luxury wedding production.'}
            </p>
          </div>

          {/* Software & Grading Suites */}
          <div className="pt-2 border-t border-surface-50 flex flex-wrap items-center gap-2">
            <span className="text-[11px] sm:text-xs text-ivory-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gold" /> Production Stack:
            </span>
            {work.softwareUsed && work.softwareUsed.length > 0 ? (
              work.softwareUsed.map((item, idx) => (
                <span key={idx} className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-surface-100 text-ivory-300 border border-gold/20 text-[10px] sm:text-xs font-mono">
                  {item}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-surface-100 text-gold/80 border border-gold/20 text-[10px] sm:text-xs font-mono">
                DaVinci Resolve Studio • Adobe Lightroom
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
