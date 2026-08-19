import React, { useState, useEffect } from 'react';
import { User, NotificationItem, AgentQueryResponse, MissingPerson } from './types';
import { AuthAPI, NotificationsAPI } from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { NotificationsDrawer } from './components/NotificationsDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PoliceDashboard } from './pages/PoliceDashboard';
import { NgoPortal } from './pages/NgoPortal';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  
  // Drawers state
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // AI Agent Action Map Override State
  const [aiMapAction, setAiMapAction] = useState<any>(null);
  const [aiFilteredCases, setAiFilteredCases] = useState<MissingPerson[] | undefined>(undefined);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const list = await NotificationsAPI.list(currentUser.role);
      setNotifications(list);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    // Attempt restoring saved session
    AuthAPI.getMe()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('OVERVIEW');
  };

  const handleLogout = () => {
    AuthAPI.logout();
    setCurrentUser(null);
  };

  const handleApplyAgentResult = (result: AgentQueryResponse) => {
    if (result.map_action) {
      setAiMapAction(result.map_action);
    }
    if (result.filtered_missing_cases && result.filtered_missing_cases.length > 0) {
      setAiFilteredCases(result.filtered_missing_cases);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      
      {/* Top Header Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={tab => setActiveTab(tab)}
        onOpenAIAssistant={() => setIsAIOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {!currentUser ? (
          /* Unauthenticated Experience: Welcome & Sign In */
          <LandingPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* Authenticated Role-Based Dashboard View */
          <>
            {currentUser.role === 'POLICE' && (
              <PoliceDashboard
                mapActionState={aiMapAction}
                filteredCasesOverride={aiFilteredCases}
                onOpenAIAssistant={() => setIsAIOpen(true)}
              />
            )}

            {currentUser.role === 'NGO' && (
              <NgoPortal />
            )}

            {currentUser.role === 'ADMIN' && (
              <AdminDashboard />
            )}

            {currentUser.role === 'CITIZEN' && (
              <NgoPortal />
            )}
          </>
        )}
      </main>

      {/* Drawers & Modals */}
      {currentUser && (
        <>
          <AIAssistantDrawer
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            onApplyQueryResult={handleApplyAgentResult}
          />

          <NotificationsDrawer
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onRefresh={loadNotifications}
          />
        </>
      )}

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-4 px-4 text-center text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FIND-BACK AI &copy; 2026. Missing Persons Discovery & Intelligence Platform.</span>
          <span className="font-mono text-text-muted">Confidential Agency Access & Official Protocol</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
