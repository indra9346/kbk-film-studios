import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const TermsModal: React.FC = () => {
  const { isTermsModalOpen, setIsTermsModalOpen, cms } = useStudio();

  if (!isTermsModalOpen) return null;

  const terms = cms?.termsAndConditions || [
    'The displayed service fee applies only to the selected service and agreed deliverables.',
    'Accommodation, food, travel, local transport, venue charges, permits, courier charges, and third-party expenses are excluded unless separately confirmed in writing.',
    'The client is responsible for arranging and paying all excluded expenses.',
    'Final scope, delivery date, and any custom quotation are confirmed after the owner reviews the service request.',
    'Delivery timelines depend on project complexity, timely submission of required footage/materials, and client feedback.',
    'Revisions are handled according to the agreed service scope. Additional revisions or changes outside the agreed scope may require an additional charge.',
    'The client confirms they have permission to provide all photos, videos, music references, logos, and other materials submitted for the project.',
    'Private delivered files are available through the client portal for the selected access period. Clients should download and safely back up their files.',
    'KBK Films may display completed work publicly only after receiving client approval.',
    'By submitting this request, the client agrees to these terms.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface-200 border border-gold/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-surface-100/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/15 text-gold border border-gold/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory-100">
                Terms & Conditions of Service
              </h3>
              <p className="text-xs text-ivory-400">
                KBK Films • Standard Post-Production Agreement
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTermsModalOpen(false)}
            className="p-2 text-ivory-400 hover:text-white rounded-full bg-surface-50 border border-gold/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-ivory-200 leading-relaxed">
          <p className="text-ivory-400 italic">
            Please read these terms carefully before submitting your booking request. Submitting a project request constitutes full agreement with these standards.
          </p>

          <ol className="space-y-3.5 list-none">
            {terms.map((term, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-surface-100/50 border border-surface-50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold font-bold text-xs shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-ivory-200">{term}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-50 bg-surface-100/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-accent-emerald font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure & Isolated Client Handover</span>
          </div>
          <button
            onClick={() => setIsTermsModalOpen(false)}
            className="px-5 py-2 rounded-lg bg-gold text-black font-semibold text-xs hover:bg-gold-light transition-all shadow-gold-sm"
          >
            I Agree & Close
          </button>
        </div>
      </div>
    </div>
  );
};
