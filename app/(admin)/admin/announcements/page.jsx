'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, timeAgo } from '@/lib/utils';
import ErrorState from '@/components/ui/ErrorState';
import styles from './page.module.css';

const PRIORITY_STYLES = {
  NORMAL: { label: 'Normal', className: styles.priorityNormal },
  IMPORTANT: { label: 'Important', className: styles.priorityImportant },
  URGENT: { label: 'Urgent', className: styles.priorityUrgent },
};

const INITIAL_FORM = {
  title: '',
  content: '',
  priority: 'NORMAL',
  targetRole: 'ALL',
  publishDate: '',
  expiryDate: '',
};

function Skeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.skeletonLine} style={{ width: 280, height: 32 }} />
        <div className={styles.skeletonLine} style={{ width: 160, height: 40 }} />
      </div>
      <div className={styles.annList}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <h3>Confirm Delete</h3>
        <p>{message}</p>
        <div className={styles.dialogActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.deleteBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementModal({ announcement, onClose, onSave }) {
  const [form, setForm] = useState(
    announcement ? {
      title: announcement.title || '',
      content: announcement.content || '',
      priority: announcement.priority || 'NORMAL',
      targetRole: announcement.targetRole || 'ALL',
      publishDate: (announcement.publishedAt || announcement.publishDate || '').slice(0, 10),
      expiryDate: (announcement.expiresAt || announcement.expiryDate || '').slice(0, 10),
    } : INITIAL_FORM
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        priority: form.priority,
        targetRole: form.targetRole === 'ALL' ? null : form.targetRole,
        publishedAt: form.publishDate || new Date().toISOString(),
        expiresAt: form.expiryDate || undefined,
      };
      if (announcement?.id || announcement?._id) {
        await api.patch(`/announcements/${announcement.id || announcement._id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }
      onSave();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{announcement ? 'Edit Announcement' : 'Create Announcement'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Announcement title"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Content</label>
            <textarea
              value={form.content}
              onChange={handleChange('content')}
              placeholder="Write your announcement..."
              rows={5}
              required
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Priority</label>
              <select value={form.priority} onChange={handleChange('priority')}>
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Target Role</label>
              <select value={form.targetRole} onChange={handleChange('targetRole')}>
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Publish Date</label>
              <input type="date" value={form.publishDate} onChange={handleChange('publishDate')} />
            </div>
            <div className={styles.formGroup}>
              <label>Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={handleChange('expiryDate')} />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : announcement ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data?.announcements || res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/announcements/${deleting.id || deleting._id}`);
      setAnnouncements(prev => prev.filter(a => (a.id || a._id) !== (deleting.id || deleting._id)));
      setDeleting(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchAnnouncements} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Announcement Management</h1>
        <button className={styles.createBtn} onClick={() => { setEditing(null); setShowModal(true); }}>
          + New Announcement
        </button>
      </div>

      <div className={styles.annList}>
        {announcements.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📢</span>
            <p>No announcements yet. Create one to get started.</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const id = ann.id || ann._id;
            const priority = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.NORMAL;
            return (
              <div key={id} className={styles.annCard}>
                <div className={styles.annHeader}>
                  <h3 className={styles.annTitle}>{ann.title}</h3>
                  <span className={cn(styles.priorityBadge, priority.className)}>
                    {priority.label}
                  </span>
                </div>
                <p className={styles.annContent}>{ann.content}</p>
                <div className={styles.annMeta}>
                  <span>🎯 {ann.targetRole || 'All'}</span>
                  <span>📅 {ann.publishDate ? new Date(ann.publishDate).toLocaleDateString() : 'N/A'}</span>
                  {ann.expiryDate && (
                    <span>⏰ Expires: {new Date(ann.expiryDate).toLocaleDateString()}</span>
                  )}
                  <span>👁 {ann.readCount || 0} reads</span>
                </div>
                <div className={styles.annActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => { setEditing(ann); setShowModal(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtnSmall}
                    onClick={() => setDeleting(ann)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <AnnouncementModal
          announcement={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={() => { setShowModal(false); setEditing(null); fetchAnnouncements(); }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleting.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
