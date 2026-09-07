'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { cn, timeAgo } from '@/lib/utils';
import ErrorState from '@/components/ui/ErrorState';
import styles from './page.module.css';

const TYPE_ICONS = {
  TASK: '✅',
  TRANSACTION: '💰',
  ATTENDANCE: '📍',
  ANNOUNCEMENT: '📢',
  SYSTEM: '⚙️',
  default: '🔔',
};

const FILTERS = ['ALL', 'TASK', 'TRANSACTION', 'ATTENDANCE', 'ANNOUNCEMENT', 'SYSTEM'];

function Skeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.skeletonLine} style={{ width: 220, height: 32 }} />
      </div>
      <div className={styles.statsRow}>
        {[1, 2, 3].map(i => <div key={i} className={styles.skeletonStat} />)}
      </div>
      <div className={styles.filterBar}>
        {FILTERS.map(f => <div key={f} className={styles.skeletonPill} />)}
      </div>
      <div className={styles.notifList}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonNotif} />
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  const filtered = filter === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const normalize = (n) => (n.isRead !== undefined ? n.isRead : n.read);

  const total = notifications.length;
  const unread = notifications.filter(n => !normalize(n)).length;
  const read = total - unread;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notification Center</h1>
        {unread > 0 && (
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            ✓ Mark All as Read
          </button>
        )}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={cn(styles.statCard, styles.statUnread)}>
          <span className={styles.statValue}>{unread}</span>
          <span className={styles.statLabel}>Unread</span>
        </div>
        <div className={cn(styles.statCard, styles.statRead)}>
          <span className={styles.statValue}>{read}</span>
          <span className={styles.statLabel}>Read</span>
        </div>
      </div>

      <div className={styles.filterBar}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={cn(styles.filterBtn, filter === f && styles.filterBtnActive)}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.notifList}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <p>No notifications found.</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const id = notif.id || notif._id;
            const icon = TYPE_ICONS[notif.type] || TYPE_ICONS.default;
            return (
              <div
                key={id}
                className={cn(styles.notifItem, !normalize(notif) && styles.notifUnread)}
              >
                <div className={styles.notifIcon}>{icon}</div>
                <div className={styles.notifContent}>
                  <h4 className={styles.notifTitle}>{notif.title}</h4>
                  <p className={styles.notifMessage}>{notif.message || notif.body}</p>
                  <span className={styles.notifTime}>{timeAgo(notif.createdAt || notif.timestamp)}</span>
                </div>
                <div className={styles.notifActions}>
                  {!normalize(notif) && (
                    <button className={styles.readBtn} onClick={() => markAsRead(id)}>
                      Mark Read
                    </button>
                  )}
                  <div className={cn(styles.unreadDot, normalize(notif) && styles.readDot)} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
