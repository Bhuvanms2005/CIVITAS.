import React from 'react';
import './Terms.css'; 

const TermsAndConditions = () => {
  return (
    <div className="box">
      <h2>Terms and Conditions – Civitas</h2>
      <p><strong>Effective Date:</strong> June 4, 2025</p>

      <p>
        Welcome to <strong>Civitas</strong>, a civic engagement platform developed to empower citizens to report
        public issues like garbage, drainage problems, damaged roads, and non-functional streetlights.
        Before using our services, please read the following Terms and Conditions carefully.
      </p>

      <h3>1. Acceptance of Terms</h3>
      <p>
        By accessing or using Civitas, you agree to be bound by these Terms and Conditions. If you do not
        agree with any part of the terms, please do not use this website.
      </p>

      <h3>2. Use of the Platform</h3>
      <ul>
        <li>Civitas is intended to collect civic complaints for resolution.</li>
        <li>Users may report genuine civic issues by filling out forms and submitting relevant photos and location details.</li>
        <li>The platform is for lawful and constructive purposes only. Misuse or abuse of the service is prohibited.</li>
      </ul>

      <h3>3. User Responsibilities</h3>
      <ul>
        <li>You agree to provide accurate and truthful information while submitting complaints.</li>
        <li>Uploaded images and complaint descriptions must not contain offensive, false, or misleading content.</li>
        <li>Do not upload copyrighted or illegal material without proper rights or consent.</li>
      </ul>

      <h3>4. Privacy</h3>
      <p>
        Your personal information (e.g., name, email, phone number) is collected only to contact you if necessary
        for clarification. We do not sell or share your personal information with third parties unless required by law.
      </p>

      <h3>5. Content Ownership</h3>
      <p>
        By submitting content (photos, descriptions), you grant Civitas the right to use, display, and process
        that content solely for the purpose of issue resolution. Civitas does not claim ownership of the user-submitted content.
      </p>

      <h3>6. Limitation of Liability</h3>
      <p>
        Civitas is a student-developed prototype platform and does not guarantee that every reported issue will
        be resolved. The team is not responsible for delays, missed complaints, or external dependencies.
      </p>

      <h3>7. Changes to Terms</h3>
      <p>
        We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page,
        and continued use of the service implies acceptance of those changes.
      </p>

      <h3>8. Contact</h3>
      <p>
        If you have any questions about these Terms, please reach out via the{' '}
        <a href="/contact">Contact Us</a> page.
      </p>

      <div className="home-link-wrapper">
        <a href="/home" className="home-link"><b>← Back to Home</b></a>
      </div>
    </div>
  );
};

export default TermsAndConditions;