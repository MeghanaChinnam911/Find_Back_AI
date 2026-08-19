import React from 'react';
import { NotificationItem } from '../types';
import { Bell, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { NotificationsAPI } from '../services/api';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onRefresh: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh
}) => {
  if (!isOpen) return null;

  const handleMarkRead = async (id: number) => {
    await NotificationsAPI.markRead(id);
    onRefresh();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] bg-surface border-l border-border shadow-modal flex flex-col transition-all">
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-subtle">
        <div className="flex items-center gap-2 text-text-main font-bold text-sm">
          <Bell className="w-4 h-4 text-primary" />
          <span>System Notifications</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-text-main">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center text-text-muted py-12 text-xs">
            No system notifications currently pending.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                notif.is_read
                  ? 'bg-surface-subtle/50 border-border text-text-muted'
                  : 'bg-surface border-primary/30 text-text-main shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {notif.type === 'MATCH_ALERT' ? (
                  <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-text-main">{notif.title}</h5>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-text-muted">{notif.message}</p>
                  
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="mt-1.5 text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark as acknowledged
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
