import React from 'react';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.homeWrapper}>
      <nav className={styles.navbar}>
        <h1 className={styles.welcome}>CIVITAS</h1>
        <ul className={styles.navLinks}>
          <li><a href="/about">About</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/help">Help</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/signup">Sign Up</a></li>
          <li><a href="/signin">Sign In</a></li>
        </ul>
      </nav>

      <div className={styles.slideshowContainer}>
        <div className={styles.slides}>
          <img src="/images/home-image3.jpg" alt="Garbage cleaning" className={styles.slideImage} id={styles.garbageCleaning} />
          <img src="/images/home-image2.jpeg" alt="Perfect road" className={styles.slideImage} id={styles.perfectRoad} />
          <img src="/images/home-image5.jpeg" alt="Drainage cleaning" className={styles.slideImage} id={styles.drainageCleaning} />
          <img src="/images/home-image6.webp" alt="Technology image" className={styles.slideImage} id={styles.cleaning} />
        </div>
      </div>

      <div className={styles.messageSection}>
        <h2 className={styles.message}>
          Civitas is a platform designed to help citizens navigate their civic responsibilities and rights. <br />
          Whether you need information on local government services, community events, or civic engagement opportunities, Civitas has you covered. <br />
          Our mission is to empower citizens with the knowledge they need to actively participate in their communities and make informed decisions.
        </h2>
      </div>
    </div>
  );
}

export default Home;