// src/components/AnnouncementManagementView.jsx
import React, { useState, useEffect } from 'react';
import AnnouncementEditModal from './AnnouncementEditModal'; // We'll create this next
import styles from './AnnouncementManagementView.module.css'; // You'll create this CSS file

const AnnouncementManagementView = ({ user: adminUser }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required to view announcements.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/announcements?limit=50`, { // Fetch up to 50 for admin view
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setAnnouncements(data.announcements || []);
      } else {
        setError(data.message || 'Failed to fetch announcements.');
        console.error('Backend error fetching announcements:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching announcements:', err);
      setError('Network error fetching announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [API_BASE_URL]);

  const handleOpenModal = (announcementId = null) => {
    setSelectedAnnouncementId(announcementId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncementId(null);
    fetchAnnouncements(); // Refresh list after modal is closed
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this announcement?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required to delete announcements.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Announcement deleted successfully!');
        fetchAnnouncements(); // Refresh list after deletion
      } else {
        const data = await res.json();
        alert(`Failed to delete announcement: ${data.message || 'Server error.'}`);
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Network error deleting announcement.');
    }
  };

  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading announcements...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Announcement Management</h1>
      <p className={styles.subHeading}>Create, edit, and delete public announcements.</p>
      
      <button className={styles.createButton} onClick={() => handleOpenModal(null)}>+ Create New Announcement</button>

      {announcements.length === 0 ? (
        <p className={styles.noAnnouncementsMessage}>No announcements have been made yet.</p>
      ) : (
        <ul className={styles.announcementList}>
          {announcements.map(announcement => (
            <li key={announcement._id} className={styles.announcementItem}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{announcement.title}</h3>
                <span className={styles.itemType}>{announcement.type.toUpperCase()}</span>
              </div>
              <p className={styles.itemContent}>{announcement.content}</p>
              <p className={styles.itemMeta}>Published: {new Date(announcement.publishedAt).toLocaleString()} by {announcement.publishedBy?.firstName || 'Admin'}</p>
              <p className={styles.itemMeta}>Locality: {announcement.locality || 'City-wide'}</p>
              <div className={styles.itemActions}>
                <button className={styles.actionButton} onClick={() => handleOpenModal(announcement._id)}>Edit</button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteAnnouncement(announcement._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <AnnouncementEditModal
          announcementId={selectedAnnouncementId}
          onClose={handleCloseModal}
          API_BASE_URL={API_BASE_URL}
        />
      )}
    </div>
  );
};

export default AnnouncementManagementView;