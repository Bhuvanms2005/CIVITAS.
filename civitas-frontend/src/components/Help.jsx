import React from 'react';
import styles from './Help.module.css';
import { Link } from 'react-router-dom';

function Help() {
  return (
    <div className={styles.helpContainer}>
      <h1>Help & Support</h1>

      <section className={styles.helpSection}>
        <h2>How to Raise a Complaint</h2>
        <p>
          To raise a complaint, click on the "Hamburger Menu" button after you sign in to your account. You will be directed to a form where you can:
        </p>
        <ul>
          <li>Select the category of the issue such as Garbage, Drainage, Road Damage, or Street Light,animal and public safety</li>
          <li>Upload a clear photo of the problem for our team to assess the issue effectively.</li>
          <li>Enter the exact address of the location where the issue exists, or allow GPS access to autofill your location.</li>
          <li>Click on the submit button to send your complaint to us. You will receive a confirmation message.</li>
        </ul>
      </section>

      <section className={styles.helpSection}>
        <h2>Frequently Asked Questions (FAQs)</h2>
        <ul>
          <li><strong>What types of complaints can I report?</strong><br />You can report garbage overflow, drainage blockage, road damage, street light failures, animal and public safety</li>
          <li><strong>Can I track my complaint?</strong><br />Yes! You can track the real-time status of your complaint directly on Civitas.
If your complaint remains pending for more than 48 hours, you can re-raise the complaint to alert the authorities again and ensure quicker action.</li>
          <li><strong>Will my complaint be public?</strong><br />Yes! Your complaint will be visible to everyone for awareness, helping other citizens stay informed about city issues.
However, your username and personal details will not be disclosed, ensuring your privacy and safety.</li>
          <li><strong>What if I enter a wrong address?</strong><br />Please ensure the address is correct before submitting. You can 'Use Current Location' button to autofill the address.</li>
          <li><strong>How long will it take to resolve?</strong><br />We aim to resolve issues within 48–72 hours depending on severity and locality.</li>
        </ul>
      </section>

      <section className={styles.helpSection}>
        <h2>Photo Upload Guidelines</h2>
        <p>To help us resolve your issue quickly, please follow these photo guidelines:</p>
        <ul>
          <li>Ensure the image is clear and in focus.</li>
          <li>Take a wide shot if possible, to give context of the issue.</li>
          <li>Do not upload unrelated or blurry images.</li>
          <li>Limit image size to under 5MB for faster upload.</li>
        </ul>
      </section>

      <Link to="/home" className={styles.homeLink}>&larr; Back to Home</Link>
    </div>
  );
}

export default Help;