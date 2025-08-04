/*import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Signin.module.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userJson = urlParams.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setErrorMsg('✅ Logged in successfully via Google!');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } catch (e) {
        console.error('Error parsing user data from URL:', e);
        setErrorMsg('❌ Failed to parse Google login data.');
      }
    } else if (urlParams.has('error')) {
      const errorMessage = urlParams.get('message') || 'Google sign-in failed.';
      setErrorMsg(`❌ ${errorMessage}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9@_]{8,}$/;

    if (!emailRegex.test(email)) {
      setErrorMsg("❌ Invalid email format.");
      return false;
    }

    if (!passwordRegex.test(password)) {
      setErrorMsg("❌ Password must be at least 8 characters, alphanumeric, and only @ and _ are allowed.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setErrorMsg('✅ ' + data.message);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setErrorMsg('❌ ' + (data.message || data.error || 'Login failed.'));
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setErrorMsg('❌ Server error. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className={styles.formBox}>
      <div className={styles.signinContainer}>
        <h2 id={styles.heading}>SIGN IN</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" id={styles.label1}>Email</label><br />
          <input
            type="email"
            id={styles.email}
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" id={styles.label2}>Password</label><br />
          <input
            type="password"
            id={styles.password}
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.forgotPasswordLink}>
            <Link to="/forgot-password" className={styles.linkText}>Forgot Password?</Link>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div id={styles.errorMsg} style={{ marginTop: '10px', color: errorMsg.includes('✅') ? 'green' : 'red' }}>
            {errorMsg}
          </div>
        </div>

        <div className={styles.formGroup}>
          <button type="submit" className={styles.button}>Sign In</button>
        </div>

        <div className={styles.orDivider}>
          <span>OR</span>
        </div>

        <div className={styles.formGroup} style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={handleGoogleSignIn} className={`${styles.button} ${styles.googleButton}`}>
            <span className={styles.googleIcon}>G</span>
            Sign In with Google
          </button>
        </div>
      </form>

      <div className={styles.homeLinkWrapper}>
        <a href="/home" className={styles.homeLink}><b>← Back to Home</b></a>
      </div>
    </div>
  );
};

export default SignIn;*/
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Signin.module.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userJson = urlParams.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setErrorMsg('✅ Logged in successfully via Google!');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user.role === 'volunteer') {
            navigate('/dashboard');
          } else {
            navigate('/home');
          }
        }, 500);
      } catch (e) {
        console.error('Error parsing user data from URL:', e);
        setErrorMsg('❌ Failed to parse Google login data.');
      }
    } else if (urlParams.has('error')) {
      const errorMessage = urlParams.get('message') || 'Google sign-in failed.';
      setErrorMsg(`❌ ${errorMessage}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9@_]{8,}$/;

    if (!emailRegex.test(email)) {
      setErrorMsg("❌ Invalid email format.");
      return false;
    }

    if (!passwordRegex.test(password)) {
      setErrorMsg("❌ Password must be at least 8 characters, alphanumeric, and only @ and _ are allowed.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
       localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

const role = data.user.role;
setErrorMsg('✅ ' + data.message);

// Delay just a bit to ensure localStorage writes complete
if (role === 'admin') {
  navigate('/admin/dashboard');
} else if (role === 'volunteer') {
  navigate('/dashboard');
} else {
  navigate('/home');
}


      } else {
        setErrorMsg('❌ ' + (data.message || data.error || 'Login failed.'));
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setErrorMsg('❌ Server error. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className={styles.formBox}>
      <div className={styles.signinContainer}>
        <h2 id={styles.heading}>SIGN IN</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" id={styles.label1}>Email</label><br />
          <input
            type="email"
            id={styles.email}
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" id={styles.label2}>Password</label><br />
          <input
            type="password"
            id={styles.password}
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.forgotPasswordLink}>
            <Link to="/forgot-password" className={styles.linkText}>Forgot Password?</Link>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div id={styles.errorMsg} style={{ marginTop: '10px', color: errorMsg.includes('✅') ? 'green' : 'red' }}>
            {errorMsg}
          </div>
        </div>

        <div className={styles.formGroup}>
          <button type="submit" className={styles.button}>Sign In</button>
        </div>

        <div className={styles.orDivider}>
          <span>OR</span>
        </div>

        <div className={styles.formGroup} style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={handleGoogleSignIn} className={`${styles.button} ${styles.googleButton}`}>
            <span className={styles.googleIcon}>G</span>
            Sign In with Google
          </button>
        </div>
      </form>

      <div className={styles.homeLinkWrapper}>
        <a href="/home" className={styles.homeLink}><b>← Back to Home</b></a>
      </div>
    </div>
  );
};

export default SignIn;

