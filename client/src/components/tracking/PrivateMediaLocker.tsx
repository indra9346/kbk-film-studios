import React, { useState } from 'react';
import { Download, Film, Lock, ShieldCheck, Play, CheckCircle2, Clock, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import { PrivateDeliveryFile } from '../../types';

interface PrivateMediaLockerProps {
  deliveries: PrivateDeliveryFile[];
  clientName: string;
  bookingRef: string;
}

export const PrivateMediaLocker: React.FC<PrivateMediaLockerProps> = ({ deliveries, clientName, bookingRef }) => {
  const [activeStreamToken, setActiveStreamToken] = useState<string | null>(null);

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
      {activeStreamToken && (
        <div className="rounded-2xl overflow-hidden border border-gold/40 bg-black shadow-2xl space-y-2 p-2">
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            <video
              src={`/api/client/stream/${activeStreamToken}`}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-xs text-ivory-300">
            <span className="flex items-center gap-1.5 text-gold font-medium">
              <Film className="w-4 h-4" />
              Secure Private Stream Player
            </span>
            <button
              onClick={() => setActiveStreamToken(null)}
              className="text-ivory-400 hover:text-white underline"
            >
              Close Stream
            </button>
          </div>
        </div>
      )}

      {/* Deliveries List */}
      <div className="grid grid-cols-1 gap-4">
        {deliveries.map((file) => {
          const isExpired = new Date(file.expiryDate).getTime() < Date.now();

          return (
            <div
              key={file.id}
              className="p-5 rounded-2xl glass-panel border border-gold/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-gold/40 transition-all"
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
                      {file.fileCategory.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-ivory-400 font-mono">
                    {file.fileName} • {file.fileSizeFormatted}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-ivory-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold" />
                      Expires: {new Date(file.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>
                      Downloads: {file.downloadCount} / {file.maxDownloads}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {file.isStreamable && (
                  <button
                    onClick={() => setActiveStreamToken(file.downloadToken)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-100 border border-gold/30 text-xs font-semibold transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-gold fill-gold" />
                    <span>Stream Preview</span>
                  </button>
                )}

                <a
                  href={isExpired ? '#' : `/api/client/download/${file.downloadToken}`}
                  download={file.fileName}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-gold-sm ${
                    isExpired
                      ? 'bg-surface-100 text-ivory-400 cursor-not-allowed border border-surface-50'
                      : 'bg-gold hover:bg-gold-light text-black hover:shadow-gold-md'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Master (Full 4K)</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
