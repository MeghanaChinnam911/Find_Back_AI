import React, { useState, useEffect } from 'react';
import { MissingPerson, UnidentifiedPerson, PotentialMatch, AnalyticsOverview } from '../types';
import { MissingPersonsAPI, MatchingAPI, AnalyticsAPI, UnidentifiedPersonsAPI } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';
import { NewMissingPersonModal } from '../components/NewMissingPersonModal';
import { MatchVerificationModal } from '../components/MatchVerificationModal';
import { 
  Shield, Plus, Search, Filter, AlertCircle, CheckCircle2, 
  MapPin, Activity, Bot, LayoutDashboard, Users, BarChart3, Bell, Settings, ArrowUpRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PoliceDashboardProps {
  mapActionState?: any;
  filteredCasesOverride?: MissingPerson[];
  onOpenAIAssistant: () => void;
}

export const PoliceDashboard: React.FC<PoliceDashboardProps> = ({
  mapActionState,
  filteredCasesOverride,
  onOpenAIAssistant
}) => {
  const [missingCases, setMissingCases] = useState<MissingPerson[]>([]);
  const [unidentifiedRecords, setUnidentifiedRecords] = useState<UnidentifiedPerson[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  
  const [activeNav, setActiveNav] = useState<'OVERVIEW' | 'MISSING' | 'MATCHES' | 'MAP' | 'ANALYTICS'>('OVERVIEW');
  const [selectedMatchToVerify, setSelectedMatchToVerify] = useState<PotentialMatch | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('ALL');

  const mapCenter: [number, number] = mapActionState?.center || [16.5062, 80.6480];
  const mapZoom: number = mapActionState?.zoom || 9;

  const loadData = async () => {
    try {
      const [cases, unidentified, matches, overview] = await Promise.all([
        MissingPersonsAPI.list(),
        UnidentifiedPersonsAPI.list(),
        MatchingAPI.getMatches('PENDING_VERIFICATION'),
        AnalyticsAPI.getOverview()
      ]);
      setMissingCases(cases);
      setUnidentifiedRecords(unidentified);
      setPotentialMatches(matches);
      setAnalytics(overview);
    } catch (err) {
      console.error('Error loading police intelligence data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayCases = filteredCasesOverride || missingCases.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.missing_location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedLocation !== 'ALL' && !c.missing_location.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    if (selectedAgeGroup === 'CHILDREN' && c.age >= 18) return false;
    if (selectedAgeGroup === 'ADULTS' && (c.age < 18 || c.age >= 60)) return false;
    if (selectedAgeGroup === 'ELDERLY' && c.age < 60) return false;
    return true;
  });

  const ageData = analytics ? [
    { name: 'Children (<18)', count: analytics.cases_by_age_group.children, color: '#17324D' },
    { name: 'Adults (18-59)', count: analytics.cases_by_age_group.adults, color: '#2F6B57' },
    { name: 'Elderly (60+)', count: analytics.cases_by_age_group.elderly, color: '#B7791F' }
  ] : [];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background flex flex-col md:flex-row">
      
      {/* Left Sidebar Operational Navigation */}
      <aside className="w-full md:w-64 bg-surface border-r border-border p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Police Operations
            </div>
            <nav className="space-y-1 text-xs">
              <button
                onClick={() => setActiveNav('OVERVIEW')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
                  activeNav === 'OVERVIEW'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveNav('MISSING')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
                  activeNav === 'MISSING'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Missing Persons</span>
              </button>

              <button
                onClick={() => setActiveNav('MATCHES')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors ${
                  activeNav === 'MATCHES'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span>Potential Matches</span>
                </div>
                {potentialMatches.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-warning text-white font-bold">
                    {potentialMatches.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNav('MAP')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
                  activeNav === 'MAP'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Map Intelligence</span>
              </button>

              <button
                onClick={() => setActiveNav('ANALYTICS')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
                  activeNav === 'ANALYTICS'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </nav>
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-xs">
            <button
              onClick={onOpenAIAssistant}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-subtle border border-border text-text-main hover:border-primary font-semibold transition-colors"
            >
              <Bot className="w-4 h-4 text-primary" />
              <span>Find-Back Assistant</span>
            </button>
          </div>

        </div>

        <div className="border-t border-border pt-3 text-[11px] text-text-muted">
          Police Intelligence Unit #402
        </div>
      </aside>

      {/* Main Operational View */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 panel-card p-5 bg-surface">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-text-main">Police Intelligence Dashboard</h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">Real-time geospatial intelligence & identity resolution matrix</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewCaseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register Missing Case
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="panel-card p-4 bg-surface space-y-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Active Missing Cases</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-text-main font-mono">{analytics?.active_missing_count || displayCases.length}</span>
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="panel-card p-4 bg-surface border-warning/30 space-y-1">
            <p className="text-[11px] font-semibold text-warning uppercase tracking-wider">Pending Matches</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-warning font-mono">{potentialMatches.length}</span>
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
          </div>

          <div className="panel-card p-4 bg-surface border-accent/30 space-y-1">
            <p className="text-[11px] font-semibold text-accent uppercase tracking-wider">Resolved Cases</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-accent font-mono">{analytics?.resolved_count || 8}</span>
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
          </div>

          <div className="panel-card p-4 bg-surface border-danger/30 space-y-1">
            <p className="text-[11px] font-semibold text-danger uppercase tracking-wider">High Risk Priority Zones</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-danger font-mono">{analytics?.high_risk_zones.length || 2}</span>
              <MapPin className="w-5 h-5 text-danger" />
            </div>
          </div>
        </div>

        {/* Main Map & Verification Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Geospatial Map */}
          <div className="lg:col-span-2 h-[460px] panel-card p-2 bg-surface flex flex-col">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between text-xs">
              <span className="font-bold text-text-main flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Geospatial Density Intelligence Map
              </span>
              <span className="text-[10px] text-text-muted font-mono">Live Sync</span>
            </div>
            <div className="flex-1 w-full mt-2">
              <InteractiveMap
                missingCases={displayCases}
                unidentifiedRecords={unidentifiedRecords}
                center={mapCenter}
                zoom={mapZoom}
                areaRiskStats={analytics?.cases_by_area}
              />
            </div>
          </div>

          {/* Pending Match Verification Side List */}
          <div className="space-y-4 flex flex-col">
            
            <div className="panel-card p-4 bg-surface border-warning/30 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  Match Verification Queue ({potentialMatches.length})
                </span>
              </div>

              <div className="max-h-[160px] overflow-y-auto space-y-2">
                {potentialMatches.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No pending matches requiring verification.</p>
                ) : (
                  potentialMatches.slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatchToVerify(m)}
                      className="p-2.5 rounded-lg bg-surface-subtle border border-border hover:border-primary cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <img src={m.missing_person.photo_url} alt="Candidate" className="w-8 h-8 rounded object-cover border border-border" />
                        <div className="text-xs">
                          <p className="font-bold text-text-main group-hover:text-primary">{m.missing_person.name}</p>
                          <p className="text-[10px] text-text-muted">Similarity: {Math.round(m.overall_score * 100)}%</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Demographic Breakdown Chart */}
            <div className="panel-card p-4 bg-surface flex-1 flex flex-col justify-center space-y-2">
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                Demographic Distribution
              </h4>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData}>
                    <XAxis dataKey="name" stroke="#667085" fontSize={10} tickLine={false} />
                    <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e7ec', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

        {/* Filter Controls & Case Records List */}
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 panel-card p-3 bg-surface text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by case name or location..."
                className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-primary w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-text-muted font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>

              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border text-text-main focus:outline-none"
              >
                <option value="ALL">All Regions</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Guntur">Guntur</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>

              <select
                value={selectedAgeGroup}
                onChange={e => setSelectedAgeGroup(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border text-text-main focus:outline-none"
              >
                <option value="ALL">All Ages</option>
                <option value="CHILDREN">Children (&lt;18)</option>
                <option value="ADULTS">Adults (18-59)</option>
                <option value="ELDERLY">Elderly (60+)</option>
              </select>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayCases.slice(0, 12).map((c) => (
              <div
                key={c.id}
                className="panel-card p-3.5 bg-surface space-y-2.5 hover:border-primary transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={c.photo_url}
                    alt={c.name}
                    className="w-full h-36 rounded-lg object-cover border border-border bg-surface-subtle"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                    {c.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-text-main">{c.name}</h4>
                  <p className="text-[11px] text-primary font-medium">Age: {c.age} years</p>
                  <p className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-danger" />
                    {c.missing_location}
                  </p>
                </div>

                <div className="text-[10px] text-text-muted border-t border-border pt-2 flex items-center justify-between">
                  <span>Missing: {c.missing_date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modals */}
        <NewMissingPersonModal
          isOpen={isNewCaseModalOpen}
          onClose={() => setIsNewCaseModalOpen(false)}
          onSuccess={loadData}
        />

        <MatchVerificationModal
          matchItem={selectedMatchToVerify}
          onClose={() => setSelectedMatchToVerify(null)}
          onMatchUpdated={loadData}
        />

      </main>

    </div>
  );
};
