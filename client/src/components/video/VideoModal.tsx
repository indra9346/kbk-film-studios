import React from 'react';
import { X, Calendar, MapPin, Layers, ExternalLink, Download } from 'lucide-react';
import { PublicWork } from '../../types';
import { extractDriveFileId, isImageMedia } from './VideoCard';
import { CinematicVideoPlayer } from './CinematicVideoPlayer';

interface VideoModalProps {
  work: PublicWork | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ work, onClose }) => {
  if (!work) return null;

  const isPic = isImageMedia(work.videoUrl) || (!work.videoUrl && Boolean(work.thumbnailUrl));
  const driveId = extractDriveFileId(work.videoUrl);
  const isGoogleDrive = Boolean(driveId || work.videoSourceType === 'google_drive' || work.videoUrl?.includes('drive.google.com'));
  const activeMediaUrl = work.videoUrl || work.thumbnailUrl || '/assets/kbk-logo.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-surface-200 border border-gold/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-surface-50 bg-surface-100/95 z-20">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 pr-2">
            <span className="px-2 py-0.5 rounded-md bg-gold/15 text-gold text-[9px] sm:text-xs font-bold uppercase tracking-wider border border-gold/30 shrink-0">
              {work.category}
            </span>
            <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-white truncate">
              {work.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

        {/* Unified Reusable Cinematic Video & Photo Player */}
        <div className="relative aspect-video max-h-[55vh] sm:max-h-[70vh] w-full bg-black flex items-center justify-center overflow-hidden">
          <CinematicVideoPlayer
            url={work.videoUrl}
            poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
            title={work.title}
            category={work.category}
            aspectRatio="16/9"
            autoPlayOnScroll={false}
            isModal={true}
            showControls={true}
          />
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
