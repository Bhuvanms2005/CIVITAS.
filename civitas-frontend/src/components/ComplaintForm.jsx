import React, { useState, useEffect } from 'react';
import styles from './ComplaintForm.module.css';
import InteractiveMap from '../components/InteractiveMap';

const ComplaintForm = ({ user, category, subType }) => {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [mapPinLocation, setMapPinLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [locationError, setLocationError] = useState(null);
  const [similarComplaints, setSimilarComplaints] = useState([]);
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setSubmissionMessage(null);
    setSubmissionError(null);
    if (category && subType) {
      setDescription(`Complaint: ${subType} in ${category} category.`);
    } else if (category) {
      setDescription(`Complaint in ${category} category.`);
    } else {
      setDescription("Please describe the issue.");
    }
  }, [category, subType]);

  const getCurrentLocation = () => {
    setSubmissionMessage(null);
    setSubmissionError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lon: longitude };
          setLocation(newLocation);
          setMapPinLocation(newLocation);
          setLocationError(null);
          setAddress(`Auto-filled: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          setLocationError("Failed to get current location. Please enter manually.");
          console.error("Geolocation Error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation not supported by this browser.");
    }
  };
const handleMapLocationChange = (latlng) => {
    // latlng from Leaflet is { lat, lng }
    const newPinLocation = { lat: latlng.lat, lon: latlng.lng };
    setMapPinLocation(newPinLocation);
    
    // Optionally update the address field as well
    setAddress(`Pinned Location: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  // 🔁 Fetch real similar complaints from backend
  useEffect(() => {
    const fetchSimilarComplaints = async () => {
      setSimilarComplaints([]);
      if (mapPinLocation && description.length > 10) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(
            `${API_BASE_URL}/complaints/similar?lat=${mapPinLocation.lat}&lon=${mapPinLocation.lon}&desc=${encodeURIComponent(description)}&category=${encodeURIComponent(category || '')}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok) {
            setSimilarComplaints(data.similar || []);
          } else {
            console.warn('Could not fetch similar complaints:', data.message);
          }
        } catch (err) {
          console.error('Error fetching similar complaints:', err);
        }
      }
    };

    fetchSimilarComplaints();
  }, [mapPinLocation, description, category]);

  const handleSupportIssue = async (complaintId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('You must be logged in to support a complaint.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}/support`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'Complaint supported successfully!');
        setSimilarComplaints((prev) =>
          prev.map((comp) =>
            comp._id === complaintId ? { ...comp, supportedCount: data.supportedCount, userSupported: true } : comp
          )
        );
      } else {
        setSubmissionError(data.message || 'Failed to support complaint. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setSubmissionError('Network error supporting complaint. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setSubmissionError(null);

    if (!photo || !address || !description || !mapPinLocation) {
      setSubmissionError('Please fill all required fields and pinpoint location on map.');
      return;
    }

    const formData = new FormData();
    formData.append('category', category || '');
    formData.append('subType', subType || '');
    formData.append('description', description);
    formData.append('address', address);
    formData.append('latitude', mapPinLocation.lat);
    formData.append('longitude', mapPinLocation.lon);
    formData.append('severity', severity);
    if (photo) formData.append('photo', photo);

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmissionError('You must be logged in to submit a complaint.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionMessage(data.message || 'Complaint submitted successfully!');
        setPhoto(null);
        setPhotoPreview(null);
        setAddress('');
        setLocation(null);
        setMapPinLocation(null);
        setDescription(category && subType ? `Complaint: ${subType} in ${category} category.` : '');
        setSeverity('moderate');
        setSimilarComplaints([]);
      } else {
        setSubmissionError(data.message || 'Failed to submit complaint. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setSubmissionError('Network error. Please try again.');
    }
  };

  return (
    <div className={styles.complaintFormContainer}>
      <h2 className={styles.heading}>Report a New Complaint</h2>
      {category && subType && (
        <p className={styles.selectedCategory}>
          Category: <strong>{category}</strong> | Issue: <strong>{subType}</strong>
        </p>
      )}
      {!category && <p className={styles.warningMessage}>Please select a complaint category from the sidebar first.</p>}

      <form onSubmit={handleSubmit} className={styles.complaintForm}>
        <div className={styles.formGroup}>
          <label htmlFor="photoUpload">Upload Photo (Required)</label>
          <input type="file" id="photoUpload" accept="image/*,video/*" onChange={handlePhotoChange} required />
          {photoPreview && <img src={photoPreview} alt="Complaint Preview" className={styles.photoPreview} />}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Address (Required)</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address manually or use current location"
            required
          />
          <button type="button" onClick={getCurrentLocation} className={styles.locationButton}>
            Use Current Location 📍
          </button>
          {locationError && <p className={styles.errorMessage}>{locationError}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Pin Location on Map (Required)</label>
          
          {/* The InteractiveMap component is placed here */}
          <InteractiveMap 
            onLocationChange={handleMapLocationChange}
            position={mapPinLocation} // Pass the state to control the map's pin
          />

          {mapPinLocation ? (
            <p style={{ marginTop: '8px' }}>
              Pinned: {mapPinLocation.lat.toFixed(4)}, {mapPinLocation.lon.toFixed(4)}
            </p>
          ) : (
            <p style={{ marginTop: '8px' }}>
              Click the map or use the location button to set a location.
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description (Required)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            required
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="severity">Severity/Urgency</label>
          <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="low">Low (Minor Inconvenience)</option>
            <option value="moderate">Moderate (Standard Problem)</option>
            <option value="high">High (Major Concern)</option>
            <option value="urgent">Urgent (Safety Hazard)</option>
          </select>
        </div>

        {similarComplaints.length > 0 && (
          <div className={styles.similarComplaintsAlert}>
            <h3>⚠️ Similar Complaints Nearby!</h3>
            <ul className={styles.similarList}>
              {similarComplaints.map((comp) => (
                <li key={comp._id}>
                  <strong>{comp.category}:</strong> {comp.description} (Status: {comp.status}){' '}
                  <button
                    type="button"
                    className={styles.supportButton}
                    onClick={() => handleSupportIssue(comp._id)}
                    disabled={comp.userSupported}
                  >
                    {comp.userSupported ? 'Supported ✅' : `Support This Issue (${comp.supportedCount})`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {submissionMessage && <p className={styles.successMessage}>{submissionMessage}</p>}
        {submissionError && <p className={styles.errorMessage}>{submissionError}</p>}

        <button type="submit" className={styles.submitButton}>
          Submit Complaint
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;



