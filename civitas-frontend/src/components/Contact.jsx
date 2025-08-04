import React, { useState } from 'react';
import styles from './Contact.module.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/contact/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } else {
      alert(data.error || 'Failed to send message.');
    }
  } catch (err) {
    alert('Something went wrong. Please try again.');
    console.error(err);
  }
};


  return (
    <div className={styles.contactContainer}>
      <h2>Contact Us</h2>
      <form id="contact-form" onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name:</label><br />
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label><br />
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number:</label><br />
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message:</label><br />
          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <button type="submit">Send Message</button>
        </div>
      </form>

      <div className={styles.contactDetails}>
        <h3>Our Contact Information</h3>
        <p><strong>Phone:</strong> +91-123-456-7890</p>
        <p><strong>Email:</strong> civitas935@gmail.com</p>
        <p><strong>Follow Us:</strong> <a href="https://www.facebook.com/profile.php?id=61578707147553">Facebook</a> | <a href="https://x.com/_CIVITAS__">Twitter</a> | <a href="https://www.instagram.com/_civitas._/">Instagram</a></p>
      </div>

      <div className={styles.mapSection}>
        <h3>Our Location</h3>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5632557750682!2d76.09234697484186!3d12.999762487318257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba548177b7c2b31%3A0x3ed879cf0c80a1a0!2sX3XV%2BWX3%2C%20Ammeer%20Mohalla%2C%20Hassan%2C%20Karnataka%20573201!5e0!3m2!1sen!2sin!4v1754236592692!5m2!1sen!2sin"
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Civitas Location"
        ></iframe>
      </div>

      <div className={styles.homeLinkWrapper}>
        <a href="/home" className={styles.homeLink}><b>← Back to Home</b></a>
      </div>
    </div>
  );
}

export default Contact;