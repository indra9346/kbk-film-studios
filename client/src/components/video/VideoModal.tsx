import React, { useRef, useEffect } from 'react';
import { X, ExternalLink, Calendar, MapPin, Layers, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { PublicWork } from '../../types';
import { getVideoType, getCleanVideoUrl } from './VideoCard';

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-50 bg-surface-100/90">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-gold/15 text-gold text-xs font-bold uppercase tracking-wider border border-gold/30">
              {work.category}
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">
              {work.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface-200 hover:bg-gold hover:text-black text-ivory-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Section */}
        <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center">
          {(() => {
            const media = getVideoType(work.videoUrl);
            if (media.type === 'youtube' && media.id) {
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
            return (
              <video
                ref={videoRef}
                src={getCleanVideoUrl(work.videoUrl)}
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
