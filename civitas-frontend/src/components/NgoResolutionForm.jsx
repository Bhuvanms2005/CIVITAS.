// src/components/NgoComplaintResolutionForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from './NgoComplaintResolutionForm.module.css'; // You'll create this CSS file

const NgoComplaintResolutionForm = ({ API_BASE_URL }) => {
  const { id } = useParams(); // Get complaint ID from URL
  const [complaint, setComplaint] = useState(null); // Full complaint object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for NGO resolution
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPhotoPreview, setResolutionPhotoPreview] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // You will need a way to authenticate the NGO for this public-facing form.
  // This could be via a temporary token in the URL or a simple login.
  // For this version, we will assume a simple JWT is passed in the URL or from a session.
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token'); // Get token from URL query string

  // We need to fetch the complaint details to display them
  useEffect(() => {
    const fetchComplaintDetails = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("Complaint ID is missing from the URL.");
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/complaints/${id}`, { // Assuming you have a public GET /complaints/:id API
        headers: {
          'Authorization': `Bearer ${token}`, // Use token from URL for auth
        },
      });

      const data = await res.json();
      if (res.ok) {
        setComplaint(data.complaint);
      } else {
        setError(data.message || 'Failed to fetch complaint details.');
      }
      setLoading(false);
    };

    fetchComplaintDetails();
  }, [id, token, API_BASE_URL]);


  const handlePhotoChange = (e) => {
    setSubmissionMessage(null);
    setSubmissionError(null);
    const file = e.target.files[0];
    if (file) {
      setResolutionPhoto(file);
      setResolutionPhotoPreview(URL.createObjectURL(file));
    } else {
      setResolutionPhoto(null);
      setResolutionPhotoPreview(null);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setSubmissionError(null);
    setIsSubmitting(true);

    if (!resolutionPhoto && !resolutionNote.trim()) {
      setSubmissionError('Please provide either a photo or a resolution note.');
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      setSubmissionError('Authentication token is missing. Please use the link from your email.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    if (resolutionPhoto) {
        formData.append('resolutionPhoto', resolutionPhoto);
    }
    if (resolutionNote) {
        formData.append('resolutionNote', resolutionNote);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${id}/ngo-resolution`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Use token from URL for auth
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'Resolution update submitted successfully!');
        setResolutionPhoto(null);
        setResolutionPhotoPreview(null);
        setResolutionNote('');
        // Optional: you can navigate away after successful submission
        // setTimeout(() => navigate('/home'), 3000);
      } else {
        setSubmissionError(data.message || 'Failed to submit resolution update.');
      }
    } catch (err) {
      console.error('Network error submitting resolution update:', err);
      setSubmissionError('Network error submitting resolution update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading complaint details...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  if (!complaint) {
      return <div className={styles.container}><p className={styles.error}>Complaint not found or invalid link.</p></div>;
  }

  // Display form for NGO resolution
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Resolution for Complaint #{complaint._id.substring(0,8)}</h1>
      <p className={styles.subHeading}>Please submit your final resolution details and an "after" photo.</p>

      <div className={styles.complaintSummary}>
        <h3>Summary:</h3>
        <p><strong>Issue:</strong> {complaint.subType} in {complaint.category}</p>
        <p><strong>Description:</strong> {complaint.description}</p>
        <p><strong>Address:</strong> {complaint.address}</p>
        {complaint.photo && (
            <div className={styles.photoContainer}>
                <img src={`${API_BASE_URL.replace('/api', '')}${complaint.photo}`} alt="Original Complaint" className={styles.complaintPhoto} />
                <small>Original Photo submitted by Volunteer</small>
            </div>
        )}
      </div>

      {submissionMessage && <p className={styles.successMessage}>{submissionMessage}</p>}
      {submissionError && <p className={styles.errorMessage}>{submissionError}</p>}
      
      <form onSubmit={handleSubmit} className={styles.resolutionForm}>
        {/* After Photo Upload */}
        <div className={styles.formGroup}>
          <label htmlFor="resolutionPhoto">Upload "After" Photo</label>
          <input type="file" id="resolutionPhoto" accept="image/*" onChange={handlePhotoChange} />
          {resolutionPhotoPreview && <img src={resolutionPhotoPreview} alt="Resolution Preview" className={styles.photoPreview} />}
        </div>
        
        {/* Resolution Notes */}
        <div className={styles.formGroup}>
          <label htmlFor="resolutionNote">Resolution Notes (Optional)</label>
          <textarea
            id="resolutionNote"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe the resolution steps taken..."
          ></textarea>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting || (!resolutionPhoto && !resolutionNote.trim())}>
          {isSubmitting ? 'Submitting...' : 'Submit Resolution Update'}
        </button>
      </form>
    </div>
  );
};

export default NgoComplaintResolutionForm;