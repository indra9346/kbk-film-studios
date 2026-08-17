import React, { useState } from 'react';
import { Download, Film, Lock, ShieldCheck, Play, CheckCircle2, Clock, AlertTriangle, FileText, Sparkles, X, ExternalLink } from 'lucide-react';
import { PrivateDeliveryFile } from '../../types';
import { getVideoType, extractDriveFileId, getCleanVideoUrl } from '../video/VideoCard';
import { CinematicVideoPlayer } from '../video/CinematicVideoPlayer';

interface PrivateMediaLockerProps {
  deliveries: PrivateDeliveryFile[];
  clientName: string;
  bookingRef: string;
}

export const PrivateMediaLocker: React.FC<PrivateMediaLockerProps> = ({ deliveries, clientName, bookingRef }) => {
  const [activeDelivery, setActiveDelivery] = useState<PrivateDeliveryFile | null>(null);

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-surface-200 border border-gold/20 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-surface-100 border border-gold/30 flex items-center justify-center text-gold">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-bold text-ivory-100">
            Private Client Delivery Locker
          </h4>
          <p className="text-xs text-ivory-300 max-w-md mx-auto">
            Your master deliverables are currently being color graded and rendered. Once Kurudi Bharath Kumar completes the final export, your private download packages will appear here.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-100 text-[11px] text-gold border border-gold/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Data Isolation Active • No Public Google Drive Exposure</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Locker Header */}
      <div className="p-5 rounded-2xl bg-surface-100/90 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-ivory-100">
              Authenticated Private Delivery Locker
            </h4>
            <p className="text-xs text-ivory-300">
              Assigned to: <span className="text-gold font-semibold">{clientName}</span> ({bookingRef})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200 border border-surface-50 text-xs text-ivory-300">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>{deliveries.length} File Package{deliveries.length > 1 ? 's' : ''} Ready</span>
        </div>
      </div>

      {/* Embedded Stream Player if Active */}
      {activeDelivery && (
        <div className="rounded-2xl overflow-hidden border border-gold/40 bg-black shadow-2xl space-y-3 p-3 sm:p-4 animate-fadeIn">
          <div className="flex items-center justify-between px-1 text-xs text-ivory-300 border-b border-surface-50 pb-2">
            <span className="flex items-center gap-1.5 text-gold font-medium">
              <Film className="w-4 h-4" />
              <span>Streaming: {activeDelivery.title}</span>
            </span>
            <button
              onClick={() => setActiveDelivery(null)}
              className="p-1 rounded-lg bg-surface-100 hover:bg-gold hover:text-black text-ivory-300 transition-colors"
              title="Close Stream"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
            <CinematicVideoPlayer
              url={(activeDelivery as any).videoUrl || activeDelivery.streamUrl || '/assets/hero-reel.mp4'}
              poster="/assets/kbk-logo.jpg"
              title={activeDelivery.title}
              aspectRatio="16/9"
              autoPlayOnScroll={false}
              isModal={true}
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* Deliveries List */}
      <div className="grid grid-cols-1 gap-4">
        {deliveries.map((file) => {
          const isExpired = file.expiryDate ? new Date(file.expiryDate).getTime() < Date.now() : false;
          const streamSrc = (file as any).videoUrl || file.streamUrl || '/assets/hero-reel.mp4';
          const media = getVideoType(streamSrc);
          const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(streamSrc);

          const formattedSize = file.fileSizeFormatted && file.fileSizeFormatted !== '0 MB' && file.fileSizeFormatted !== '0 B'
            ? file.fileSizeFormatted
            : (file.fileSizeBytes && file.fileSizeBytes > 0
                ? `${(file.fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
                : '4.85 GB Master 4K');

          return (
            <div
              key={file.id}
              className="p-5 rounded-2xl glass-panel border border-gold/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-gold/40 transition-all shadow-md"
            >
              {/* File Info */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gold/15 text-gold border border-gold/30 shrink-0 mt-0.5">
                  <Film className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-serif text-sm sm:text-base font-bold text-ivory-100">
                      {file.title}
                    </h5>
                    <span className="px-2 py-0.5 rounded bg-surface-100 text-gold text-[10px] uppercase font-bold border border-gold/30">
                      {file.fileCategory?.replace(/_/g, ' ') || 'MASTER VIDEO'}
                    </span>
                  </div>
                  <p className="text-xs text-ivory-400 font-mono">
                    {file.fileName || 'Master_4K_ProRes.mp4'} • {formattedSize}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-ivory-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold" />
                      Expires: {file.expiryDate ? new Date(file.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '90 Days Active'}
                    </span>
                    <span>
                      Downloads: {file.downloadCount || 0} / {file.maxDownloads || 50}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveDelivery(file)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-gold/20 text-gold border border-gold/40 text-xs font-semibold transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-gold" />
                  <span>Stream Preview</span>
                </button>

                {driveId ? (
                  <a
                    href={`https://drive.google.com/file/d/${driveId}/view`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gold hover:bg-gold-light text-black transition-all shadow-gold-sm hover:shadow-gold-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master (Full 4K)</span>
                  </a>
                ) : (
                  <a
                    href={isExpired ? '#' : (streamSrc.startsWith('http') ? streamSrc : `/assets/hero-reel.mp4`)}
                    download={file.fileName || 'Master_4K.mp4'}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-gold-sm ${
                      isExpired
                        ? 'bg-surface-100 text-ivory-400 cursor-not-allowed border border-surface-50'
                        : 'bg-gold hover:bg-gold-light text-black hover:shadow-gold-md'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master (Full 4K)</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
