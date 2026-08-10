import React, { useRef, useEffect } from 'react';
import { X, ExternalLink, Calendar, MapPin, Layers, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { PublicWork } from '../../types';
import { getVideoType } from './VideoCard';

interface VideoModalProps {
  work: PublicWork | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ work, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (work && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [work]);

  if (!work) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-surface-200 border border-gold/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-gold/20 flex items-center justify-between bg-surface-100/90">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider">
              {work.category}
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-ivory-100 line-clamp-1">
              {work.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ivory-400 hover:text-white rounded-full bg-surface-50 border border-gold/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Section */}
        <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center">
          {(() => {
            const media = getVideoType(work.videoUrl);
            if (media.type === 'youtube') {
              return (
                <iframe
                  src={`https://www.youtube.com/embed/${media.id}?autoplay=1&rel=0`}
                  title={work.title}
                  className="w-full h-full object-contain border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                />
              );
            }
            if (media.type === 'google-drive') {
              return (
                <iframe
                  src={`https://drive.google.com/file/d/${media.id}/preview`}
                  title={work.title}
                  className="w-full h-full object-contain border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  frameBorder="0"
                />
              );
            }
            return (
              <video
                ref={videoRef}
                src={work.videoUrl || '/assets/hero-reel.mp4'}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            );
          })()}
        </div>

        {/* Details & Creative Breakdown */}
        <div className="p-6 overflow-y-auto space-y-5 bg-surface-200/95 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-ivory-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                {work.eventLocation}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" />
                {work.eventYear}
              </span>
            </div>

            {/* External Full YouTube / Drive Link */}
            {work.externalDestUrl && (
              <a
                href={work.externalDestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-crimson/15 hover:bg-accent-crimson/25 border border-accent-crimson/40 text-white font-semibold text-xs transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {work.externalDestUrl.includes('drive.google.com')
                    ? 'Watch on Google Drive'
                    : 'Watch Full Master on YouTube'}
                </span>
              </a>
            )}
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-gold uppercase tracking-wider mb-1.5">
              Film Narrative & Post-Production Treatment
            </h4>
            <p className="text-ivory-200 leading-relaxed">
              {work.description}
            </p>
          </div>

          {/* Software & Grading Suites */}
          <div className="pt-2 border-t border-surface-50 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ivory-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gold" /> Post-Production Stack:
            </span>
            {work.softwareUsed?.map((item, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-surface-100 text-ivory-300 border border-gold/20 text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
