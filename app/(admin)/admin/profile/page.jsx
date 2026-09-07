'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import ErrorState from '@/components/ui/ErrorState';
import styles from './page.module.css';

const PERMISSIONS = [
  { icon: '🔓', title: 'Full System Access', desc: 'Unrestricted access to all system features and modules.' },
  { icon: '👥', title: 'User Management', desc: 'Create, edit, deactivate users and manage roles.' },
  { icon: '📁', title: 'Project Management', desc: 'Full control over projects, tasks, and assignments.' },
  { icon: '💰', title: 'Financial Operations', desc: 'Access to budgets, transactions, and financial reports.' },
  { icon: '🔒', title: 'Security Management', desc: 'Configure security policies, audit logs, and access controls.' },
  { icon: '⚙️', title: 'System Administration', desc: 'Manage system settings, backups, and configurations.' },
];

const QUICK_LINKS = [
  { icon: '🛡️', title: 'Security Center', href: '/admin/security' },
  { icon: '📜', title: 'Audit Logs', href: '/admin/activity' },
  { icon: '💓', title: 'System Health', href: '/admin/system-health' },
  { icon: '⚙️', title: 'Settings', href: '/admin/settings' },
];

function Skeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.skeletonLine} style={{ width: 200, height: 32 }} />
        <div className={styles.skeletonLine} style={{ width: 160, height: 16, marginTop: 8 }} />
      </div>
      <div className={styles.skeletonProfile}>
        <div className={styles.skeletonCircle} />
        <div className={styles.skeletonLines}>
          <div className={styles.skeletonLine} style={{ width: 180, height: 24 }} />
          <div className={styles.skeletonLine} style={{ width: 240, height: 16 }} />
          <div className={styles.skeletonLine} style={{ width: 120, height: 16 }} />
        </div>
      </div>
      <div className={styles.skeletonGrid}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
      const res = await api.get('/auth/me');
      setProfile(res.data?.user || res.data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const name = profile?.name || profile?.user?.name || 'Admin User';
  const email = profile?.email || profile?.user?.email || 'admin@ideons.com';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const lastLogin = profile?.lastLogin || profile?.user?.lastLogin || new Date().toISOString();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Profile</h1>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{name}</h2>
          <p className={styles.profileEmail}>{email}</p>
          <div className={styles.profileMeta}>
            <span className={styles.roleBadge}>ADMIN</span>
            <span className={styles.metaItem}>🏢 {profile?.department || 'Administration'}</span>
            <span className={styles.metaItem}>✅ Active Account</span>
            <span className={styles.metaItem}>🕐 Last login: {new Date(lastLogin).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Permissions</h2>
        <div className={styles.permGrid}>
          {PERMISSIONS.map((perm, i) => (
            <div key={i} className={styles.permCard}>
              <span className={styles.permIcon}>{perm.icon}</span>
              <div>
                <h4 className={styles.permTitle}>{perm.title}</h4>
                <p className={styles.permDesc}>{perm.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Activity Summary</h2>
        <div className={styles.activityStats}>
          <div className={styles.activityStat}>
            <span className={styles.activityValue}>{profile?.totalActions || 1247}</span>
            <span className={styles.activityLabel}>Total Actions Logged</span>
          </div>
          <div className={styles.activityStat}>
            <span className={styles.activityValue}>{profile?.recentActions || 89}</span>
            <span className={styles.activityLabel}>Last 7 Days Activity</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Links</h2>
        <div className={styles.linksGrid}>
          {QUICK_LINKS.map((link, i) => (
            <a key={i} href={link.href} className={styles.linkCard}>
              <span className={styles.linkIcon}>{link.icon}</span>
              <span className={styles.linkTitle}>{link.title}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
