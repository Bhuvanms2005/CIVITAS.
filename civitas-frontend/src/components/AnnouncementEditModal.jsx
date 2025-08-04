// src/components/AnnouncementEditModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './AnnouncementEditModal.module.css'; // You'll create this CSS file

const AnnouncementEditModal = ({ announcementId, onClose, API_BASE_URL }) => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('general'); // Default type
  const [locality, setLocality] = useState('');
  const [region, setRegion] = useState('Bengaluru'); // Default region
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const isEditing = announcementId !== null;

  useEffect(() => {
    if (isEditing) {
      const fetchAnnouncementDetails = async () => {
        setLoading(true);
        setError(null);
        setSubmissionMessage(null);
        setSubmissionError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required to fetch announcement details.');
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/admin/announcements/${announcementId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setAnnouncement(data.announcement);
            setTitle(data.announcement.title || '');
            setContent(data.announcement.content || '');
            setType(data.announcement.type || 'general');
            setLocality(data.announcement.locality || '');
            setRegion(data.announcement.region || 'Bengaluru');
          } else {
            setError(data.message || 'Failed to fetch announcement details.');
          }
        } catch (err) {
          setError('Network error fetching announcement details.');
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncementDetails();
    } else {
      // Reset form for new announcement
      setLoading(false);
      setTitle('');
      setContent('');
      setType('general');
      setLocality('');
      setRegion('Bengaluru');
    }
  }, [announcementId, isEditing, API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setSubmissionError(null);
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      setSubmissionError('Title and Content cannot be empty.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('Authentication required to save announcement.');
      setLoading(false);
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_BASE_URL}/admin/announcements/${announcementId}` : `${API_BASE_URL}/admin/announcements`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, type, locality, region }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissionMessage(data.message || 'Announcement saved successfully!');
        // Update parent list via callback (passed as a prop, though not explicitly defined in this snippet)
        // if (onAnnouncementUpdated) onAnnouncementUpdated();
        // Close modal after successful submission for new announcements
        if (!isEditing) {
          setTimeout(() => onClose(), 1500);
        }
      } else {
        setSubmissionError(data.message || 'Failed to save announcement.');
        console.error('Backend error saving announcement:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error saving announcement:', err);
      setSubmissionError('Network error saving announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p className={styles.loading}>Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <p className={styles.error}>Error: {error}</p>
          <button onClick={onClose} className={styles.actionButton}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.modalHeading}>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h2>

        {submissionMessage && <p className={styles.successMessage}>{submissionMessage}</p>}
        {submissionError && <p className={styles.errorMessage}>{submissionError}</p>}

        <form onSubmit={handleSubmit} className={styles.announcementForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="general">General</option>
              <option value="alert">Alert</option>
              <option value="news">News</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="locality">Locality (Optional)</label>
            <input type="text" id="locality" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g., Koramangala" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="region">Region (Optional)</label>
            <input type="text" id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., Bengaluru" />
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update Announcement' : 'Create Announcement')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementEditModal;