import React, { useState, useEffect } from 'react';
import styles from './ComplaintDetailModal.module.css';

const ComplaintDetailModal = ({ complaintId, onClose, API_BASE_URL, onComplaintUpdated }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [assigneesLoading, setAssigneesLoading] = useState(true);
  const [assigneesError, setAssigneesError] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assignSubmissionMessage, setAssignSubmissionMessage] = useState(null);
  const [assignSubmissionError, setAssignSubmissionError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [beforeAfterPhotoFile, setBeforeAfterPhotoFile] = useState(null);
  const [beforeAfterPhotoPreview, setBeforeAfterPhotoPreview] = useState(null);
  const [photoUploadMessage, setPhotoUploadMessage] = useState(null);
  const [photoUploadError, setPhotoUploadError] = useState(null);
  // NEW STATES for Delete Complaint
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);


  useEffect(() => {
    const fetchComplaintDetails = async () => {
      setLoading(true);
      setError(null);
      // Clear all action-specific messages on complaint fetch
      setAssignSubmissionMessage(null);
      setAssignSubmissionError(null);
      setStatusUpdateMessage(null);
      setStatusUpdateError(null);
      setPhotoUploadMessage(null);
      setPhotoUploadError(null);
      setDeleteMessage(null); // Clear delete messages
      setDeleteError(null);


      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required to view complaint details.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setComplaint(data.complaint);
          if (data.complaint.assignedTo) {
              setSelectedAssignee(data.complaint.assignedTo._id);
          }
          setNewStatus(data.complaint.status);
        } else {
          setError(data.message || 'Failed to fetch complaint details.');
          console.error('Backend error fetching complaint details:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching complaint details:', err);
        setError('Network error fetching complaint details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (complaintId) {
      fetchComplaintDetails();
    }
  }, [complaintId, API_BASE_URL]);

  useEffect(() => {
    const fetchAssignees = async () => {
      setAssigneesLoading(true);
      setAssigneesError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setAssigneesError('Authentication required to fetch assignees.');
        setAssigneesLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/assignees`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setAssignees(data.assignees || []);
        } else {
          setAssigneesError(data.message || 'Failed to fetch assignees.');
          console.error('Backend error fetching assignees:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching assignees:', err);
        setAssigneesError('Network error fetching assignees. Please try again.');
      } finally {
        setAssigneesLoading(false);
      }
    };

    fetchAssignees();
  }, [API_BASE_URL]);


  const handleAssignComplaint = async () => {
    setAssignSubmissionMessage(null);
    setAssignSubmissionError(null);
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
    setPhotoUploadMessage(null);
    setPhotoUploadError(null);
    setDeleteMessage(null); // Clear other messages before new action
    setDeleteError(null);

    if (!selectedAssignee) {
        setAssignSubmissionError('Please select an assignee.');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        setAssignSubmissionError('Authentication required to assign a complaint.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/assign`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ assignedToId: selectedAssignee }),
        });

        const data = await res.json();

        if (res.ok) {
            setAssignSubmissionMessage(data.message || 'Complaint assigned successfully!');
            setComplaint(data.complaint);
            if (onComplaintUpdated) {
                onComplaintUpdated();
            }
        } else {
            setAssignSubmissionError(data.message || 'Failed to assign complaint. Please try again.');
            console.error('Backend error assigning complaint:', data.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Network error assigning complaint:', err);
        setAssignSubmissionError('Network error assigning complaint. Please try again.');
    }
  };


  const handleUpdateStatusAndNotes = async () => {
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
    setAssignSubmissionMessage(null);
    setAssignSubmissionError(null);
    setPhotoUploadMessage(null);
    setPhotoUploadError(null);
    setDeleteMessage(null); // Clear other messages before new action
    setDeleteError(null);

    if (!newStatus) {
        setStatusUpdateError('Please select a status.');
        return;
    }

    if (newStatus === complaint.status && (!adminNote || adminNote.trim() === '')) {
        setStatusUpdateError('No changes detected. Select a new status or add a note.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setStatusUpdateError('Authentication required to update status.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus, note: adminNote }),
        });

        const data = await res.json();

        if (res.ok) {
            setStatusUpdateMessage(data.message || 'Status and notes updated successfully!');
            setComplaint(data.complaint);
            setAdminNote('');
            if (onComplaintUpdated) {
                onComplaintUpdated();
            }
        } else {
            setStatusUpdateError(data.message || 'Failed to update status and notes. Please try again.');
            console.error('Backend error updating status/notes:', data.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Network error updating status/notes:', err);
        setStatusUpdateError('Network error updating status/notes. Please try again.');
    }
  };

  const handleBeforeAfterPhotoChange = (e) => {
    setPhotoUploadMessage(null);
    setPhotoUploadError(null);
    setAssignSubmissionMessage(null);
    setAssignSubmissionError(null);
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
    setDeleteMessage(null); // Clear other messages before new action
    setDeleteError(null);

    const file = e.target.files[0];
    if (file) {
      setBeforeAfterPhotoFile(file);
      setBeforeAfterPhotoPreview(URL.createObjectURL(file));
    } else {
      setBeforeAfterPhotoFile(null);
      setBeforeAfterPhotoPreview(null);
    }
  };

  const handleUploadBeforeAfterPhoto = async () => {
    setPhotoUploadMessage(null);
    setPhotoUploadError(null);
    setAssignSubmissionMessage(null);
    setAssignSubmissionError(null);
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
    setDeleteMessage(null); // Clear other messages before new action
    setDeleteError(null);

    if (!beforeAfterPhotoFile) {
        setPhotoUploadError('Please select a photo to upload.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setPhotoUploadError('Authentication required to upload photos.');
        return;
    }

    const formData = new FormData();
    formData.append('beforeAfterPhoto', beforeAfterPhotoFile);

    try {
        const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            setPhotoUploadMessage(data.message || 'Photo uploaded successfully!');
            setComplaint(prevComplaint => ({
                ...prevComplaint,
                beforeAfterPhotos: [...(prevComplaint.beforeAfterPhotos || []), data.photo]
            }));
            setBeforeAfterPhotoFile(null);
            setBeforeAfterPhotoPreview(null);
            if (onComplaintUpdated) {
                onComplaintUpdated();
            }
        } else {
            setPhotoUploadError(data.message || 'Failed to upload photo. Please try again.');
            console.error('Backend error uploading photo:', data.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Network error uploading photo:', err);
        setPhotoUploadError('Network error uploading photo. Please try again.');
    }
  };

  // NEW: handleDeleteComplaint function
  const handleDeleteComplaint = async () => {
    setDeleteMessage(null); // Clear previous messages
    setDeleteError(null);
    // Clear all other action-specific messages
    setAssignSubmissionMessage(null);
    setAssignSubmissionError(null);
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
    setPhotoUploadMessage(null);
    setPhotoUploadError(null);

    const confirmDelete = window.confirm('Are you sure you want to permanently delete this complaint? This action cannot be undone.');
    if (!confirmDelete) {
      return; // Stop if user cancels
    }

    // IMPORTANT: Check if complaint is available and has an _id before proceeding
    if (!complaint || !complaint._id) {
        setDeleteError('Complaint data is missing. Please close and reopen the modal.');
        console.error('Attempted to delete complaint with missing ID:', complaint);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setDeleteError('Authentication required to delete complaints.');
        return;
    }

    try {
        // Use the API_BASE_URL and complaint._id directly from the component's state/props
        const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaint._id}`, { // Use complaint._id here
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.ok) {
            setDeleteMessage('Complaint deleted successfully! Closing modal...');
            if (onComplaintUpdated) {
                onComplaintUpdated();
            }
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            const data = await res.json();
            setDeleteError(data.message || 'Failed to delete complaint. Please try again.');
            console.error('Backend error deleting complaint:', data.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Network error deleting complaint:', err);
        setDeleteError('Network error deleting complaint. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p className={styles.loading}>Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <p className={styles.error}>Error: {error}</p>
          <button onClick={onClose} className={styles.actionButton}>Close</button>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <p className={styles.noData}>No complaint data found.</p>
          <button onClick={onClose} className={styles.actionButton}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.modalHeading}>Complaint Details - #{complaint._id.substring(0, 8)}</h2>

        <div className={styles.detailSection}>
          <p><strong>Category:</strong> {complaint.category}</p>
          <p><strong>Issue Type:</strong> {complaint.subType}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Address:</strong> {complaint.address}</p>
          <p><strong>Location:</strong> {
            complaint.location?.coordinates ?
            `${complaint.location.coordinates[1]?.toFixed(4)}, ${complaint.location.coordinates[0]?.toFixed(4)}` :
            'N/A (Location data missing)'
          }</p>
          <p><strong>Severity:</strong> {complaint.severity}</p>
          <p><strong>Current Status:</strong> <span className={`${styles.status} ${styles[complaint.status.toLowerCase().replace(' ', '')]}`}>{complaint.status}</span></p>
          <p><strong>Submitted By:</strong> {complaint.submittedBy?.firstName} {complaint.submittedBy?.lastName} ({complaint.submittedBy?.email})</p>
          <p><strong>Submitted At:</strong> {new Date(complaint.submittedAt).toLocaleString()}</p>
          <p><strong>Reraised Count:</strong> {complaint.reraisedCount}</p>
          {complaint.assignedTo && (
            <p><strong>Assigned To:</strong> {complaint.assignedTo.firstName} {complaint.assignedTo.lastName} ({complaint.assignedTo.email})</p>
          )}
        </div>

        {complaint.photo && (
          <div className={styles.photoContainer}>
            <img src={`${API_BASE_URL.replace('/api', '')}/${complaint.photo}`} alt="Complaint" className={styles.complaintPhoto} />
          </div>
        )}

        <div className={styles.updatesSection}>
          <h3>Updates & History:</h3>
          {complaint.updates && complaint.updates.length > 0 ? (
            <ul className={styles.updatesList}>
              {complaint.updates.map((update, index) => (
                <li key={index}>
                  <small>{new Date(update.date).toLocaleString()}:</small> {update.text}
                  {update.updatedBy && <span> by {update.updatedBy?.firstName || update.updatedBy?.email}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No updates yet.</p>
          )}
        </div>

        {/* Admin Actions Section */}
        <div className={styles.adminActions}>
          <h3>Admin Actions:</h3>
          {/* Display action-specific messages */}
          {assignSubmissionMessage && <p className={styles.successMessage}>{assignSubmissionMessage}</p>}
          {assignSubmissionError && <p className={styles.errorMessage}>{assignSubmissionError}</p>}
          {statusUpdateMessage && <p className={styles.successMessage}>{statusUpdateMessage}</p>}
          {statusUpdateError && <p className={styles.errorMessage}>{statusUpdateError}</p>}
          {photoUploadMessage && <p className={styles.successMessage}>{photoUploadMessage}</p>}
          {photoUploadError && <p className={styles.errorMessage}>{photoUploadError}</p>}
          {deleteMessage && <p className={styles.successMessage}>{deleteMessage}</p>} {/* NEW: Delete success msg */}
          {deleteError && <p className={styles.errorMessage}>{deleteError}</p>}     {/* NEW: Delete error msg */}


          {/* Assign Complaint */}
          <div className={styles.actionGroup}>
            <h4>Assign Complaint:</h4>
            {assigneesLoading ? (
                <p>Loading assignees...</p>
            ) : assigneesError ? (
                <p className={styles.error}>{assigneesError}</p>
            ) : assignees.length > 0 ? (
                <select className={styles.actionSelect} value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)}>
                    <option value="">Select Department/NGO</option>
                    {assignees.map(assignee => (
                        <option key={assignee._id} value={assignee._id}>
                            {assignee.firstName} {assignee.lastName || ''} ({assignee.role.toUpperCase()}) - {assignee.email}
                        </option>
                    ))}
                </select>
            ) : (
                <p>No assignees found.</p>
            )}
            <button className={styles.actionButton} onClick={handleAssignComplaint} disabled={assigneesLoading || !selectedAssignee}>Assign</button>
          </div>

          {/* Update Status */}
          <div className={styles.actionGroup}>
            <h4>Update Status:</h4>
            <select className={styles.actionSelect} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Process Ongoing">Process Ongoing</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <textarea
              placeholder="Add internal notes..."
              className={styles.actionTextarea}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            ></textarea>
            <button
              className={styles.actionButton}
              onClick={handleUpdateStatusAndNotes}
              disabled={newStatus === complaint.status && (!adminNote || adminNote.trim() === '')}
            >
              Update Status
            </button>
          </div>

          {/* Upload Before/After Photos */}
          <div className={styles.actionGroup}>
            <h4>Add Before/After Photos:</h4>
            <input type="file" accept="image/*" onChange={handleBeforeAfterPhotoChange} />
            {beforeAfterPhotoPreview && <img src={beforeAfterPhotoPreview} alt="Preview" className={styles.photoPreview} />}
            <button
              className={styles.actionButton}
              onClick={handleUploadBeforeAfterPhoto}
              disabled={!beforeAfterPhotoFile}
            >
              Upload Photo
            </button>
          </div>
            {/* Display existing beforeAfterPhotos */}
            {complaint.beforeAfterPhotos && complaint.beforeAfterPhotos.length > 0 && (
                <div className={styles.detailSection}> {/* Reusing detailSection style */}
                    <h4>Uploaded Photos:</h4>
                    <div className={styles.uploadedPhotosGrid}>
                        {complaint.beforeAfterPhotos.map((photoObj, index) => (
                            <div key={index} className={styles.uploadedPhotoItem}>
                                <img src={`${API_BASE_URL.replace('/api', '')}/${photoObj.url}`} alt={`Before/After ${index + 1}`} className={styles.complaintPhoto} />
                                <small>{new Date(photoObj.uploadedAt).toLocaleString()} by {photoObj.uploadedBy?.firstName || photoObj.uploadedBy?.email}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

          {/* Delete Complaint */}
          <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={handleDeleteComplaint}>Delete Complaint</button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;