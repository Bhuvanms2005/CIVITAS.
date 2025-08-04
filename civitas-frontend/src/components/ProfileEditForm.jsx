import React, { useState, useEffect } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import styles from './ProfileEditForm.module.css'; 

const ProfileEditForm = ({ user, onProfileUpdateSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]); 

  const validateForm = () => {
    setSubmissionError(null);
    const errors = [];
    if (!firstName.trim() || firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters.');
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters.');
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address.');
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phone && !phoneRegex.test(phone)) { 
      errors.push('Phone number must be 10 digits and start with 6, 7, 8, or 9.');
    }
    if (user && user.googleId && !phone) {
    } else if (!user || !user.googleId) {
        if (!phone || phone.trim() === '') {
        }
    }


    if (errors.length > 0) {
      setSubmissionError(errors.join(' '));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setSubmissionError(null);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('You must be logged in to update your profile.');
      setLoading(false);
      navigate('/signin');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.user)); 
        if (onProfileUpdateSuccess) {
            onProfileUpdateSuccess(data.user); 
        }
        setLoading(false);
      } else {
        setSubmissionError(data.message || 'Failed to update profile.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmissionError('Network error or server unreachable. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileEditContainer}>
      <h2 className={styles.heading}>Edit Your Profile</h2>
      <p className={styles.subHeading}>Update your personal details below.</p>
      
      <form onSubmit={handleSubmit} className={styles.profileEditForm}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 9876543210" />
        </div>
        {submissionMessage && <p className={styles.successMessage}>{submissionMessage}</p>}
        {submissionError && <p className={styles.errorMessage}>{submissionError}</p>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEditForm;