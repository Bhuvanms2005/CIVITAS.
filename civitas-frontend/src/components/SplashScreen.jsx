import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashScreen.module.css';

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.splashWrapper}>
      <div className={styles.splashContainer}>
        <img src={`${process.env.PUBLIC_URL}/images/logo2.PNG`} alt="CIVITAS Logo" className={styles.logo} />

        <h1 className={styles.title}>CIVITAS</h1>
        <p className={styles.tagline}>Empowering Citizens, Building Communities</p>
      </div>
    </div>
  );
}

export default SplashScreen;