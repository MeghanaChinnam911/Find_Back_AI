import React from 'react';
import { Search, Bell, LogOut, Shield, Building2, UserCheck, Bot } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAIAssistant: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAIAssistant,
  onOpenNotifications,
  onLogout,
  unreadCount
}) => {
  return (
    <header className="bg-primary text-white border-b border-primary-hover px-4 lg:px-8 py-3 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none text-white">
              FIND-BACK <span className="text-emerald-400">AI</span>
            </h1>
            <p className="text-[11px] text-slate-300 font-medium tracking-wide">
              Missing Persons Discovery & Intelligence Platform
            </p>
          </div>
        </div>

        {/* User Actions & Role Indicator */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            
            {/* Find-Back AI Assistant Launch Button */}
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Find-Back Assistant</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center border border-primary">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile info */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/20">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-300">
                  {currentUser.role === 'POLICE' && <Shield className="w-3 h-3 text-sky-400" />}
                  {currentUser.role === 'NGO' && <Building2 className="w-3 h-3 text-emerald-400" />}
                  {currentUser.role === 'ADMIN' && <UserCheck className="w-3 h-3 text-amber-400" />}
                  <span>{currentUser.organization || currentUser.role}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-white/10 hover:bg-rose-600/80 text-slate-200 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="text-xs text-slate-300 font-medium">
            Authorized Personnel Access Only
          </div>
        )}

      </div>
    </header>
  );
};
