/*import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileDropdown.module.css';

const ProfileDropdown = ({ user, onLogout, onClose }) => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in.');
        onLogout();
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          alert('Your account has been successfully deleted.');
          onLogout();
        } else {
          const data = await res.json();
          alert('Failed to delete account: ' + (data.message || 'Server error.'));
        }
      } catch (err) {
        console.error('Error deleting profile:', err);
        alert('Server error during profile deletion. Please try again.');
      }
    }
    onClose();
  };

  const handleEditProfile = () => {
    navigate('/dashboard/edit-profile');
    onClose();
  };

  return (
    <div className={styles.dropdownMenu}>
      <div className={styles.profileInfo}>
        <p><strong>{user.firstName} {user.lastName}</strong></p>
        <p>{user.email}</p>
        {user.phone && <p>{user.phone}</p>}
      </div>
      <button className={styles.dropdownButton} onClick={handleEditProfile}>Edit Profile</button>
      <button className={styles.dropdownButton} onClick={onLogout}>Logout</button>
      <button className={`${styles.dropdownButton} ${styles.deleteButton}`} onClick={handleDeleteProfile}>Delete Profile</button>
    </div>
  );
};

export default ProfileDropdown;*/

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep navigate for logout if needed, otherwise could remove
import styles from './ProfileDropdown.module.css';

// CORRECTED: ProfileDropdown now accepts all necessary props
const ProfileDropdown = ({ user, onLogout, onClose, onProfileUpdateSuccess, onNavigateToContent, onProfileDeleteResult }) => {
  const navigate = useNavigate(); // Keep for logout/delete profile redirection
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleDeleteProfile = async () => {
    // Keep window.confirm for initial "Are you sure?" prompt
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmDelete) {
      onClose(); // Close dropdown if user cancels
      return;
    }

    onClose(); // Close dropdown immediately after confirmation (before API call)

    const token = localStorage.getItem('token');
    if (!token) {
        // Use callback for message display
        onProfileDeleteResult('error', 'You are not logged in. Please log in.');
        onLogout(); // Force logout
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Use callback for success message display
        onProfileDeleteResult('success', 'Your account has been successfully deleted. Redirecting to home...');
        onLogout(); // Log out and redirect after deletion
      } else {
        const data = await res.json();
        // Use callback for error message display
        onProfileDeleteResult('error', data.message || 'Failed to delete account. Please try again.');
        console.error('Failed to delete profile:', data.message);
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      onProfileDeleteResult('error', 'Network error during profile deletion. Please try again.');
    }
  };

  const handleEditProfile = () => {
    // CORRECTED: Use onNavigateToContent to update activeContent in parent
    onNavigateToContent('editProfile');
    onClose(); // Close dropdown
  };

  return (
    <div className={styles.dropdownMenu}>
      <div className={styles.profileInfo}>
        <p><strong>{user.firstName} {user.lastName}</strong></p>
        <p>{user.email}</p>
        {user.phone && <p>{user.phone}</p>}
      </div>
      <button className={styles.dropdownButton} onClick={handleEditProfile}>Edit Profile</button>
      <button className={styles.dropdownButton} onClick={onLogout}>Logout</button>
      <button className={`${styles.dropdownButton} ${styles.deleteButton}`} onClick={handleDeleteProfile}>Delete Profile</button>
    </div>
  );
};

export default ProfileDropdown;