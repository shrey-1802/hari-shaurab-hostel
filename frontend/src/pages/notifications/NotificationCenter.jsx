import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, Cake, Info, CheckCheck, Sparkles, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A4A4A]">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-xs font-bold shadow-gold-glow">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time birthday reminders, wing alerts, and system broadcasts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#4A4A4A]">All Caught Up!</h4>
            <p className="text-xs text-gray-500 mt-1">No pending notifications at this time.</p>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              hover={true}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`transition-all duration-200 cursor-pointer ${
                !notif.is_read
                  ? 'border-l-4 border-l-gold-500 bg-gold-50/20 shadow-soft-sm'
                  : 'opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon based on notification type */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    notif.notification_type?.includes('BIRTHDAY')
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {notif.notification_type?.includes('BIRTHDAY') ? (
                    <Cake className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[#4A4A4A] flex items-center gap-2">
                      <span>{notif.title}</span>
                      {!notif.is_read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-gold-glow shrink-0" title="Unread" />
                      )}
                    </h4>
                    <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
