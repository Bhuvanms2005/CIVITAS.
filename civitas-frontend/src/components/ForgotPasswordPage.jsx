import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'If an account with that email exists, a password reset link has been sent to your inbox.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h2 className={styles.heading}>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label><br />
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          {message && <div className={styles.successMsg}>{message}</div>}
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formGroup}>
            <button type="submit" className={styles.button}>Send Reset Link</button>
          </div>
        </form>

        <div className={styles.links}>
          <Link to="/signin" className={styles.linkText}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;