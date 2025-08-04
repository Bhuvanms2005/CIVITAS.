// src/components/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './UserEditModal.module.css'; // You'll create this CSS file

const UserEditModal = ({ userId, onClose, API_BASE_URL, onUserUpdated }) => {
  const [user, setUser] = useState(null); // Stores the user being edited
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(''); // User's role
  // Submission feedback states
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const roles = ['volunteer', 'ngo', 'admin']; // Available roles

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      setSubmissionMessage(null); // Clear previous messages
      setSubmissionError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required to fetch user details.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, { // Fetch specific user details
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          setFirstName(data.user.firstName || '');
          setLastName(data.user.lastName || '');
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
          setRole(data.user.role || 'volunteer'); // Set current role
        } else {
          setError(data.message || 'Failed to fetch user details.');
          console.error('Backend error fetching user details:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching user details:', err);
        setError('Network error fetching user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) { // Only fetch if userId is provided
      fetchUserDetails();
    }
  }, [userId, API_BASE_URL]);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setSubmissionError(null);

    // Basic validation (can be expanded)
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSubmissionError('First name, last name, and email are required.');
      return;
    }
    // Add email/phone regex validation if desired

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('Authentication required to update user details.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT', // Use PUT method for updating details
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'User details updated successfully!');
        // Update local user state
        setUser(data.user);
        if (onUserUpdated) {
          onUserUpdated(data.user); // Notify parent to refresh list
        }
      } else {
        setSubmissionError(data.message || 'Failed to update user details.');
        console.error('Backend error updating user details:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error updating user details:', err);
      setSubmissionError('Network error updating user details. Please try again.');
    }
  };

  const handleChangeRole = async () => {
    setSubmissionMessage(null);
    setSubmissionError(null);

    if (!role) {
      setSubmissionError('Please select a valid role.');
      return;
    }

    // ADD THESE DEBUG LOGS:
    console.log('--- Inside handleChangeRole FE ---');
    console.log('Selected User ID for role change (userId prop):', userId); // This is the prop passed to modal
    console.log('New Role selected in dropdown:', role);


    // Prevent changing admin's own role (if logged-in admin is editing their own account)
    // This check is duplicated here, the backend check is authoritative.
   /* if (user && user._id === userId && role !== 'admin') { // 'user' here is the *fetched* user for the modal
      setSubmissionError('You cannot downgrade your own role to non-admin.');
      return;
    }*/


    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('Authentication required to change user role.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRole: role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'User role updated successfully!');
        setUser(data.user); // Update local user state
        if (onUserUpdated) {
          onUserUpdated(data.user); // Notify parent
        }
      } else {
        setSubmissionError(data.message || 'Failed to change user role.');
        console.error('Backend error changing user role:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error changing user role:', err);
      setSubmissionError('Network error changing user role. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p className={styles.loading}>Loading user details...</p>
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

  if (!user) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <p className={styles.noData}>No user data found.</p>
          <button onClick={onClose} className={styles.actionButton}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.modalHeading}>Edit User - #{user._id.substring(0, 8)}</h2>

        {submissionMessage && <p className={styles.successMessage}>{submissionMessage}</p>}
        {submissionError && <p className={styles.errorMessage}>{submissionError}</p>}

        <form onSubmit={handleUpdateDetails} className={styles.userEditForm}>
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

          <button type="submit" className={styles.submitButton}>Update Details</button>
        </form>

        <div className={styles.roleChangeSection}>
          <h3>Change Role:</h3>
          <div className={styles.formGroup}>
            <label htmlFor="roleSelect">Select New Role</label>
            <select id="roleSelect" className={styles.actionSelect} value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map(r => (
                <option key={r} value={r}>{r.toUpperCase()}</option>
              ))}
            </select>
            <button className={styles.actionButton} onClick={handleChangeRole} disabled={role === user.role}>Change Role</button>
          </div>
        </div>

        {/* Optional: Add Change Password here later if desired as a dedicated action */}
        {/* <div className={styles.actionGroup}>
            <h4>Change Password:</h4>
            <button className={styles.actionButton}>Change Password</button>
        </div> */}
        
        <button className={`${styles.actionButton} ${styles.closeModalButton}`} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default UserEditModal;