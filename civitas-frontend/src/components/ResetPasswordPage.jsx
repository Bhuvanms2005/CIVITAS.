import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css'; 

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenParam = urlParams.get('token');
    const idParam = urlParams.get('id'); 

    if (tokenParam && idParam) {
      setToken(tokenParam);
      setUserId(idParam);
      setLoading(false);
    } else {
      setError('Invalid or missing password reset link. Please request a new one.');
      setLoading(false);
    }
  }, [location.search]);

  const validatePassword = (pwd) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9@_]{8,}$/;
    return passwordRegex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters, alphanumeric, and only @ and _ are allowed.');
      return;
    }

    if (loading || !token || !userId) {
      setError('Cannot reset password. Invalid link or still loading.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Your password has been reset successfully!');
        setTimeout(() => {
          navigate('/signin'); 
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Link might be invalid or expired.');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Server error. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  if (error && !token) { 
    return (
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h2 className={styles.heading}>Password Reset</h2>
          <div className={styles.errorMsg}>{error}</div>
          <div className={styles.links}>
            <Link to="/forgot-password" className={styles.linkText}>Request a new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h2 className={styles.heading}>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>New Password</label><br />
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label><br />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          {message && <div className={styles.successMsg}>{message}</div>}
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formGroup}>
            <button type="submit" className={styles.button}>Reset Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;