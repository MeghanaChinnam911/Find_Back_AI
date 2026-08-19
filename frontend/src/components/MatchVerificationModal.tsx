import React, { useState } from 'react';
import { PotentialMatch } from '../types';
import { MatchingAPI } from '../services/api';
import { X, CheckCircle2, XCircle, AlertCircle, MapPin, Calendar, Phone, Check } from 'lucide-react';

interface MatchVerificationModalProps {
  matchItem: PotentialMatch | null;
  onClose: () => void;
  onMatchUpdated: () => void;
}

export const MatchVerificationModal: React.FC<MatchVerificationModalProps> = ({
  matchItem,
  onClose,
  onMatchUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  if (!matchItem) return null;

  const { missing_person, unidentified_person, overall_score, visual_score, metadata_score } = matchItem;
  const overallPercent = Math.round(overall_score * 100);
  const visualPercent = Math.round(visual_score * 100);
  const metadataPercent = Math.round(metadata_score * 100);

  const handleAction = async (status: 'VERIFIED_MATCH' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      await MatchingAPI.verifyMatch(matchItem.id, status, notes);
      onMatchUpdated();
      onClose();
    } catch (err) {
      alert('Failed to update match verification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-surface border border-border rounded-xl p-6 shadow-modal space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-warning/10 text-warning border border-warning/20 rounded">
                POTENTIAL MATCH
              </span>
              <span className="text-xs text-text-muted">Requires Authorized Human Verification</span>
            </div>
            <h3 className="text-lg font-bold text-text-main mt-1">
              Candidate Match Verification Record #{matchItem.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-subtle border border-border text-text-muted hover:text-text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Similarity Score Rating Box */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-main">Similarity Confidence Rating</span>
            <span className="text-xl font-bold text-primary font-mono">{overallPercent}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${overallPercent}%` }}
            ></div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-text-muted pt-1">
            <div className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Visual Similarity: <strong className="text-text-main">{visualPercent}%</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Metadata & Geo: <strong className="text-text-main">{metadataPercent}%</strong></span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Missing Person Record */}
          <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[11px] font-bold text-primary">POLICE MISSING CASE</span>
              <span className="text-[10px] text-text-muted font-mono">#{missing_person.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={missing_person.photo_url}
                alt={missing_person.name}
                className="w-20 h-20 rounded-lg object-cover border border-border bg-surface-subtle"
              />
              <div>
                <h4 className="font-bold text-sm text-text-main">{missing_person.name}</h4>
                <p className="text-xs text-primary font-medium">Age: {missing_person.age} years</p>
                <p className="text-[11px] text-text-muted mt-1">DOB: {missing_person.date_of_birth || 'N/A'}</p>
              </div>
            </div>

            <div className="text-xs space-y-1 text-text-muted border-t border-border pt-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-danger shrink-0" />
                <span>Missing Location: <strong>{missing_person.missing_location}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-warning shrink-0" />
                <span>Missing Date: <strong>{missing_person.missing_date}</strong></span>
              </div>
            </div>
          </div>

          {/* Unidentified Person Intake */}
          <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[11px] font-bold text-accent">NGO / SHELTER RECORD</span>
              <span className="text-[10px] text-text-muted font-mono">#{unidentified_person.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={unidentified_person.photo_url}
                alt="Unidentified"
                className="w-20 h-20 rounded-lg object-cover border border-border bg-surface-subtle"
              />
              <div>
                <h4 className="font-bold text-sm text-text-main">
                  {unidentified_person.name || 'Unidentified Individual'}
                </h4>
                <p className="text-xs text-accent font-medium">
                  Approx Age: {unidentified_person.approximate_age ? `${unidentified_person.approximate_age} yrs` : 'Not provided'}
                </p>
                <p className="text-[11px] text-text-muted mt-1">Native: {unidentified_person.native_location || 'Not provided'}</p>
              </div>
            </div>

            <div className="text-xs space-y-1 text-text-muted border-t border-border pt-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Found Location: <strong>{unidentified_person.location}</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Verification Action Bar */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3">
          <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 p-2.5 rounded-lg border border-warning/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Authorized Verification Protocol:</strong> AI candidate scores are decision-support indicators. Human police verification is required to confirm identity resolution.
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add officer verification notes or reference numbers (optional)..."
            className="w-full p-2.5 rounded-lg bg-surface border border-border text-text-main placeholder-text-muted text-xs focus:outline-none focus:border-primary"
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => handleAction('REJECTED')}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-danger hover:bg-danger/10 text-xs font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject Match Candidate
            </button>

            <button
              onClick={() => handleAction('VERIFIED_MATCH')}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Verify Match
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
