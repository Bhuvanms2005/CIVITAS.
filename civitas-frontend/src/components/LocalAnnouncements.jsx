import React, { useState, useEffect } from 'react';
import styles from './LocalAnnouncements.module.css';

export default function LocalAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // fallback if no context

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required to fetch announcements.');
        setLoading(false);
        return;
      }

      const localityParam = user?.locality ? `&locality=${user.locality}` : '';

      try {
        const res = await fetch(`${API_BASE_URL}/announcements?${localityParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setAnnouncements(data.announcements || []);
        else setError(data.message || 'Failed to fetch announcements.');
      } catch (err) {
        setError('Network error fetching announcements.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [API_BASE_URL, user?.locality]);

  return (
    <div className={styles.announcementsPage}>
      <h2>📢 Local Announcements</h2>
      {loading && <p>Loading announcements...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && announcements.length === 0 && <p>No announcements found in your locality.</p>}

      {!loading && !error && announcements.length > 0 && (
        <ul className={styles.announcementList}>
          {announcements.map(a => (
            <li key={a._id} className={styles.announcementItem}>
              <strong>{a.title}</strong>
              <p>{a.content}</p>
              <small>{a.type} • {new Date(a.publishedAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
