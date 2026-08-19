import React, { useEffect, useState } from 'react';
import { AnalyticsOverview, AuditLog } from '../types';
import { AnalyticsAPI } from '../services/api';
import { UserCheck, RefreshCw, Terminal } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadData = async () => {
    try {
      const [overview, logs] = await Promise.all([
        AnalyticsAPI.getOverview(),
        AnalyticsAPI.getAuditLogs()
      ]);
      setAnalytics(overview);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading admin overview', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between panel-card p-6 bg-surface">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-warning/10 text-warning border border-warning/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">System Oversight & Audit Center</h2>
            <p className="text-xs text-text-muted">Platform analytics, dataset controls, and immutable action trail</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-subtle border border-border text-text-main hover:bg-surface text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-text-muted" />
          Refresh Stats
        </button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="panel-card p-4 bg-surface space-y-1">
          <p className="font-semibold text-text-muted">Total Active Cases</p>
          <p className="text-2xl font-black text-text-main font-mono">{analytics?.active_missing_count || 0}</p>
        </div>

        <div className="panel-card p-4 bg-surface space-y-1">
          <p className="font-semibold text-text-muted">Unidentified Records</p>
          <p className="text-2xl font-black text-accent font-mono">{analytics?.unidentified_count || 0}</p>
        </div>

        <div className="panel-card p-4 bg-surface space-y-1">
          <p className="font-semibold text-text-muted">Pending Matches</p>
          <p className="text-2xl font-black text-warning font-mono">{analytics?.potential_matches_count || 0}</p>
        </div>

        <div className="panel-card p-4 bg-surface space-y-1">
          <p className="font-semibold text-text-muted">Resolved Cases</p>
          <p className="text-2xl font-black text-accent font-mono">{analytics?.resolved_count || 0}</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="panel-card p-6 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-text-main flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            Human-in-the-Loop Audit Trail ({auditLogs.length})
          </h3>
          <span className="text-xs text-text-muted font-mono">Immutable Action Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-main">
            <thead className="bg-surface-subtle text-text-muted font-semibold border-b border-border">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">User / Email</th>
                <th className="p-3">Action Executed</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Details</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-3 text-text-muted">#{log.id}</td>
                  <td className="p-3 font-semibold text-text-main">{log.user_email || 'System'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-text-muted">{log.entity_type}</td>
                  <td className="p-3 text-text-main font-sans">{log.details}</td>
                  <td className="p-3 text-text-muted">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
