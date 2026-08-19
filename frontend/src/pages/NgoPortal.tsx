import React, { useState, useEffect } from 'react';
import { UnidentifiedPerson, PotentialMatch } from '../types';
import { UnidentifiedPersonsAPI, MatchingAPI } from '../services/api';
import { NewUnidentifiedPersonModal } from '../components/NewUnidentifiedPersonModal';
import { Building2, Upload, CheckCircle2, ShieldAlert, MapPin, FileText, ArrowRight } from 'lucide-react';

export const NgoPortal: React.FC = () => {
  const [unidentifiedList, setUnidentifiedList] = useState<UnidentifiedPerson[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recentlyUploadedMatchResult, setRecentlyUploadedMatchResult] = useState<PotentialMatch[] | null>(null);

  const loadData = async () => {
    try {
      const [uList, matches] = await Promise.all([
        UnidentifiedPersonsAPI.list(),
        MatchingAPI.getMatches()
      ]);
      setUnidentifiedList(uList);
      setPotentialMatches(matches);
    } catch (err) {
      console.error('Error loading NGO shelter data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSuccess = (newRecord: UnidentifiedPerson) => {
    loadData();
    const matchesForRecord = potentialMatches.filter(m => m.unidentified_person_id === newRecord.id);
    setRecentlyUploadedMatchResult(matchesForRecord);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-6 bg-surface">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">NGO & Shelter Intake Portal</h2>
            <p className="text-xs text-text-muted">
              Submit unidentified found person records for automated multi-signal matching
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Found / Unidentified Person
        </button>
      </div>

      {/* Instant Post-Upload Candidate Match Alert Box */}
      {recentlyUploadedMatchResult && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-Signal Matching Run Completed</span>
            </div>
            <button
              onClick={() => setRecentlyUploadedMatchResult(null)}
              className="text-xs text-text-muted hover:text-text-main"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-text-muted">
            The system processed your upload and evaluated vector embeddings against active police records.
          </p>

          {recentlyUploadedMatchResult.length === 0 ? (
            <div className="p-2.5 rounded-lg bg-surface text-xs text-text-muted border border-border">
              No potential candidate matches detected above the confidence threshold for this record.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {recentlyUploadedMatchResult.map(m => (
                <div key={m.id} className="p-3 rounded-lg bg-surface border border-border flex items-center gap-3">
                  <img src={m.missing_person.photo_url} alt="Candidate Match" className="w-10 h-10 rounded object-cover border border-border" />
                  <div className="text-xs">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning/10 text-warning">
                      Potential Match ({Math.round(m.overall_score * 100)}%)
                    </span>
                    <h5 className="font-bold text-text-main mt-0.5">{m.missing_person.name}</h5>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Potential Candidate Matches Queue */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-text-main flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-warning" />
          Potential Match Candidates Detected Across Intake Records
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potentialMatches.map((m) => (
            <div key={m.id} className="panel-card p-4 bg-surface space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-[11px] font-bold text-primary">
                  Similarity Rating: {Math.round(m.overall_score * 100)}%
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-warning/10 text-warning rounded border border-warning/20">
                  Pending Police Verification
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-text-muted">Shelter Record</p>
                  <img
                    src={m.unidentified_person.photo_url}
                    alt="Found"
                    className="w-full h-24 rounded-lg object-cover border border-border bg-surface-subtle"
                  />
                  <p className="text-xs font-bold text-text-main truncate">{m.unidentified_person.name || 'Unidentified'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-text-muted">Missing Candidate</p>
                  <img
                    src={m.missing_person.photo_url}
                    alt="Missing Candidate"
                    className="w-full h-24 rounded-lg object-cover border border-border bg-surface-subtle"
                  />
                  <p className="text-xs font-bold text-text-main truncate">{m.missing_person.name}</p>
                </div>
              </div>

              <div className="text-[11px] text-text-muted space-y-1 border-t border-border pt-2">
                <p>Missing Location: <strong className="text-text-main">{m.missing_person.missing_location}</strong></p>
                <p>Found Location: <strong className="text-text-main">{m.unidentified_person.location}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shelter Intake Submissions Table */}
      <div className="panel-card p-5 bg-surface space-y-4">
        <h3 className="text-base font-bold text-text-main">Shelter Intake Submissions ({unidentifiedList.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-main">
            <thead className="bg-surface-subtle text-text-muted font-semibold border-b border-border">
              <tr>
                <th className="p-3">Photo</th>
                <th className="p-3">Found Location</th>
                <th className="p-3">Uploader Phone</th>
                <th className="p-3">Approx Age</th>
                <th className="p-3">Native Location</th>
                <th className="p-3">Date Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {unidentifiedList.map((u) => (
                <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-3">
                    <img src={u.photo_url} alt="Intake" className="w-9 h-9 rounded-lg object-cover border border-border bg-surface-subtle" />
                  </td>
                  <td className="p-3 font-semibold text-text-main">{u.location}</td>
                  <td className="p-3 font-mono text-text-muted">{u.uploader_phone}</td>
                  <td className="p-3">{u.approximate_age ? `${u.approximate_age} yrs` : 'Not provided'}</td>
                  <td className="p-3">{u.native_location || 'Not provided'}</td>
                  <td className="p-3 text-text-muted font-mono">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <NewUnidentifiedPersonModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

    </div>
  );
};
