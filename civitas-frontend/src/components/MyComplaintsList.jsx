import React, { useState, useEffect } from 'react';
import styles from './MyComplaintsList.module.css';

const MyComplaintsList = ({ user }) => {
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reraiseMessage, setReraiseMessage] = useState(null); // New state for reraise success message
  const [reraiseError, setReraiseError] = useState(null);     // New state for reraise error message


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const fetchMyComplaints = async () => { // Moved function outside useEffect for re-use
    setLoading(true);
    setError(null);
    setReraiseMessage(null); // Clear messages on re-fetch
    setReraiseError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in to view your complaints.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/complaints/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMyComplaints(data.complaints || []);
      } else {
        setError(data.message || 'Failed to fetch your complaints.');
        console.error('Backend error fetching complaints:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching complaints:', err);
      setError('Failed to load your complaints due to a network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [user, API_BASE_URL]); // Rerun if user or API_BASE_URL changes


  const handleReraiseComplaint = async (complaintId) => {
    setReraiseMessage(null); // Clear previous messages
    setReraiseError(null);

    const confirmed = window.confirm(`Are you sure you want to reraise complaint ${complaintId}? This will notify the admin.`);
    if (!confirmed) return;

    const token = localStorage.getItem('token');
    if (!token) {
        setReraiseError('You must be logged in to reraise a complaint.');
        return;
    }

    try {
      console.log(`Sending reraise request for complaint: ${complaintId}`);

      // --- CRITICAL CHANGE: Replace simulation with actual fetch ---
      const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}/reraise`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', // Backend expects JSON body, though body is empty here
        },
        body: JSON.stringify({}), // Send an empty object as body might be required by Express
      });

      const data = await res.json();

      if (res.ok) {
        setReraiseMessage(data.message || `Complaint ${complaintId} reraised successfully!`);
        // Re-fetch complaints to update the list, which will show updated reraiseCount/updates
        fetchMyComplaints();
      } else {
        setReraiseError(data.message || `Failed to reraise complaint ${complaintId}.`);
        console.error('Backend error reraising complaint:', data.message || 'Unknown error');
      }
      // --- END CRITICAL CHANGE ---

    } catch (err) {
      console.error('Network error reraising complaint:', err);
      setReraiseError('Network error during reraise. Please try again.');
    }
  };

  const canReraise = (complaint) => {
    if (complaint.status === 'Pending') {
      const submittedDate = new Date(complaint.submittedAt);
      const now = new Date();
      const diffHours = (now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60);
      return diffHours > 48;
    }
    return false;
  };

  if (loading) {
    return (
      <div className={styles.myComplaintsContainer}>
        <p className={styles.loading}>Loading your complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.myComplaintsContainer}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.myComplaintsContainer}>
      <h2 className={styles.heading}>My Complaints</h2>
      
      {/* Display reraise messages */}
      {reraiseMessage && <p className={styles.reraiseSuccessMessage}>{reraiseMessage}</p>}
      {reraiseError && <p className={styles.reraiseErrorMessage}>{reraiseError}</p>}

      {myComplaints.length === 0 ? (
        <p className={styles.noComplaintsMessage}>You haven't submitted any complaints yet. Go to "Report a New Complaint" to get started!</p>
      ) : (
        <ul className={styles.complaintsList}>
          {myComplaints.map(complaint => (
            <li key={complaint._id} className={styles.complaintItem}>
              <div className={styles.complaintHeader}>
                <h3>{complaint.subType} ({complaint.category})</h3>
                <span className={`${styles.status} ${styles[complaint.status.toLowerCase().replace(' ', '')]}`}>{complaint.status}</span>
              </div>
              <p className={styles.description}>{complaint.description}</p>
              <p className={styles.location}>Location: {complaint.address}</p>
              {complaint.photo && (
                <div className={styles.photoContainer}>
<img 
src={`https://civitas-37g6.onrender.com/uploads/${complaint.photo}`}      alt="Complaint" 
      className={styles.complaintPhoto} 
    />                </div>
              )}
              <p className={styles.submittedAt}>Submitted: {new Date(complaint.submittedAt).toLocaleString()}</p>
              {complaint.updates && complaint.updates.length > 0 && (
                <div className={styles.updates}>
                  <h4>Latest Update:</h4>
                  <p>{complaint.updates[complaint.updates.length - 1].text} ({new Date(complaint.updates[complaint.updates.length - 1].date).toLocaleString()})</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyComplaintsList;