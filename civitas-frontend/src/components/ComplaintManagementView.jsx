import React, { useState, useEffect } from 'react';
import ComplaintDetailModal from './ComplaintDetailModal';
import styles from './ComplaintManagementView.module.css';

const ComplaintManagementView = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const fetchAllComplaints = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required to view complaints.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/complaints`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setComplaints(data.complaints || []);
      } else {
        setError(data.message || 'Failed to fetch complaints for admin view.');
        console.error('Backend error fetching admin complaints:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching admin complaints:', err);
      setError('Network error fetching complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, [API_BASE_URL]);

  const handleOpenModal = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaintId(null);
    // Optionally re-fetch complaints if changes made in modal
    // fetchAllComplaints(); 
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading all complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Complaint Management</h1>
      <p className={styles.subHeading}>Overview of all reported civic complaints.</p>

      {complaints.length === 0 ? (
        <p className={styles.noComplaintsMessage}>No complaints found in the system yet.</p>
      ) : (
        <ul className={styles.complaintsList}>
          {complaints.map((complaint) => (
            <li
              key={complaint._id}
              className={styles.complaintItem}
              onClick={() => handleOpenModal(complaint._id)}
            >
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>
                  {complaint.subType} ({complaint.category})
                </h3>
                <span
                  className={`${styles.status} ${
                    styles[complaint.status.toLowerCase().replace(' ', '')]
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
              <p className={styles.description}>{complaint.description}</p>
              <p className={styles.location}>📍 {complaint.address}</p>
              <p className={styles.submittedBy}>
                Submitted by: {complaint.submittedBy?.firstName}{' '}
                {complaint.submittedBy?.lastName} (
                {new Date(complaint.submittedAt).toLocaleString()})
              </p>
              {complaint.assignedTo && (
                <p className={styles.assignedTo}>
                  Assigned to: {complaint.assignedTo.firstName}{' '}
                  {complaint.assignedTo.lastName}
                </p>
              )}
              {complaint.photo && (
                <div className={styles.photoContainer}>
                  <img
                    src={`${API_BASE_URL.replace('/api', '')}${complaint.photo}`}
                    alt="Complaint"
                    className={styles.complaintPhoto}
                  />
                </div>
              )}
              <div className={styles.itemActions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(complaint._id);
                  }}
                >
                  View Details
                </button>
                <button
  className={`${styles.actionButton} ${styles.deleteButton}`}
  onClick={async (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this complaint?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaint._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        alert('Complaint deleted successfully.');
        // Update UI
        setComplaints((prev) => prev.filter((c) => c._id !== complaint._id));
      } else {
        console.error('Delete failed:', data.message);
        alert(`Failed to delete complaint: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('An error occurred while deleting the complaint.');
    }
  }}
>
  Delete
</button>

              </div>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={handleCloseModal}
          API_BASE_URL={API_BASE_URL}
          onComplaintUpdated={fetchAllComplaints} // ✅ Correct: Modal will trigger refresh if complaint is updated
        />
      )}
    </div>
  );
};

export default ComplaintManagementView;
