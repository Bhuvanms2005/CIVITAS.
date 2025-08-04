import React, { useState, useEffect } from 'react';
import styles from './NgoEditModal.module.css'; // You'll create this CSS file

const NgoEditModal = ({ ngoId, onClose, API_BASE_URL, onNgoUpdated }) => {
  const [ngo, setNgo] = useState(null); // Stores the NGO user being edited
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Note: Role is not editable via this form, it's fixed as 'ngo'
  // Add other NGO-specific fields here if you extend the User model for NGOs

  // Submission feedback states
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    const fetchNgoDetails = async () => {
      setLoading(true);
      setError(null);
      setSubmissionMessage(null);
      setSubmissionError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required to fetch NGO details.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/ngos/${ngoId}`, { // Fetch specific NGO details
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setNgo(data.ngo); // Assuming backend returns { success, ngo: {...} }
          setFirstName(data.ngo.firstName || '');
          setLastName(data.ngo.lastName || '');
          setEmail(data.ngo.email || '');
          setPhone(data.ngo.phone || '');
          // Set other NGO-specific fields here
        } else {
          setError(data.message || 'Failed to fetch NGO details.');
          console.error('Backend error fetching NGO details:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching NGO details:', err);
        setError('Network error fetching NGO details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (ngoId) { // Only fetch if ngoId is provided
      fetchNgoDetails();
    }
  }, [ngoId, API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setSubmissionError(null);
    setLoading(true); // Set loading for submission

    // Basic validation (can be expanded)
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSubmissionError('First name, last name, and email are required.');
      setLoading(false);
      return;
    }
    // Add email/phone regex validation if desired

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('Authentication required to update NGO details.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ngos/${ngoId}`, {
        method: 'PUT', // Use PUT method for updating details
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, phone /*, other NGO fields*/ }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'NGO details updated successfully!');
        setNgo(data.ngo); // Update local NGO state
        if (onNgoUpdated) {
          onNgoUpdated(data.ngo); // Notify parent to refresh list
        }
        setLoading(false);
      } else {
        setSubmissionError(data.message || 'Failed to update NGO details.');
        console.error('Backend error updating NGO details:', data.message || 'Unknown error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Network error updating NGO details:', error);
      setSubmissionError('Network error updating NGO details. Please try again.');
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p className={styles.loading}>Loading NGO details...</p>
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

  if (!ngo) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <p className={styles.noData}>No NGO data found.</p>
          <button onClick={onClose} className={styles.actionButton}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.modalHeading}>Edit NGO - #{ngo._id.substring(0, 8)}</h2>
        <p className={styles.subHeading}>Role: <strong>{ngo.role.toUpperCase()}</strong></p> {/* Display fixed role */}

        {submissionMessage && <p className={styles.successMessage}>{submissionMessage}</p>}
        {submissionError && <p className={styles.errorMessage}>{submissionError}</p>}

        <form onSubmit={handleSubmit} className={styles.ngoEditForm}>
          <div className={styles.formGroup}>
            <label htmlFor="editFirstName">First Name</label>
            <input type="text" id="editFirstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editLastName">Last Name</label>
            <input type="text" id="editLastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editEmail">Email</label>
            <input type="email" id="editEmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editPhone">Phone Number</label>
            <input type="tel" id="editPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 9876543210" />
          </div>

          {/* Add other NGO-specific fields here (e.g., area of operation) */}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Updating...' : 'Update NGO Details'}
          </button>
        </form>
        
        {/* Optional: Add Change Password here later if desired as a dedicated action */}
        {/* This modal focuses on details, not role changes as role is fixed 'ngo' */}
        
        <button className={`${styles.actionButton} ${styles.closeModalButton}`} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NgoEditModal;
