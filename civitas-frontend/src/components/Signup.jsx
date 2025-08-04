import React, { useState } from 'react';
import styles from './Signup.module.css';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const [errorMsg, setErrorMsg] = useState('');

  const showError = (msg) => setErrorMsg(`❌ ${msg}`);
  const showSuccess = (msg) => setErrorMsg(`✅ ${msg}`);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const validate = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;
    const namePattern = /^[A-Za-z\s-]{2,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[6-9]\d{9}$/;
    const passwordPattern = /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

    if (!namePattern.test(firstName)) return showError("First name must be at least 2 letters and contain only alphabets."), false;
    if (!namePattern.test(lastName)) return showError("Last name must be at least 2 letters and contain only alphabets."), false;
    if (!emailPattern.test(email)) return showError("Please enter a valid email address."), false;
    if (!phonePattern.test(phone)) return showError("Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits."), false;
    if (!passwordPattern.test(password)) return showError("Password must be at least 8 characters and include at least 1 special character."), false;
    if (password !== confirmPassword) return showError("Confirm password does not match."), false;

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) return showError("You must accept the Terms and Conditions.");
    if (!validate()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showSuccess(data.message || 'Signup successful!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        showError(data.message || data.error || "Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      showError("Server error. Please try again.");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className={styles.formBox}>
      <div className={styles.signupContainer}>
        <h2 className={styles.heading}>SIGN UP</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.onerow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name:</label><br />
            <input type="text" id="firstname" name="firstName" required value={formData.firstName} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label><br />
            <input type="text" id="lastname" name="lastName" required value={formData.lastName} onChange={handleChange} className={styles.input} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Phone Number</label><br />
          <input type="tel" id="phone" name="phone" required placeholder="Enter 10 digits number" value={formData.phone} onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label><br />
          <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label><br />
          <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label><br />
          <input type="password" id="confirmPassword" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className={styles.input} />
        </div>

        <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
          <input type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange} />
          <label htmlFor="terms">I accept the <a href="/Terms">Terms and Conditions</a></label>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.error} style={{ color: errorMsg.startsWith('✅') ? 'green' : 'red' }}>{errorMsg}</div>
          <button type="submit" className={styles.button}>Sign Up</button>
        </div>

        <div className={styles.orDivider}>
          <span>OR</span>
        </div>

        <div className={styles.formGroup} style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={handleGoogleSignup} className={`${styles.button} ${styles.googleButton}`}>
            <span className={styles.googleIcon}>G</span>
            Sign Up with Google
          </button>
        </div>
      </form>

      <div className={styles.homeLinkWrapper}>
        <a href="/home" className={styles.homeLink}><b>← Back to Home</b></a>
      </div>
    </div>
  );
}

export default Signup;