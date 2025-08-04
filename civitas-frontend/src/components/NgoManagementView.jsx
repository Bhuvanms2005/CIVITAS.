/*// src/components/NgoManagementView.jsx
import React, { useState, useEffect } from 'react';
import NgoEditModal from './NgoEditModal';
import styles from './NgoManagementView.module.css'; // You'll create this CSS file

const NgoManagementView = ({ user: adminUser }) => { // Renamed prop to avoid confusion with NGOs list
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedNgoId, setSelectedNgoId] = useState(null); 

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const fetchAllNGOs = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required to view NGOs.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ngos`, { // API to fetch all NGOs
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setNgos(data.ngos || []); // Assuming backend returns { success, ngos: [...] }
      } else {
        setError(data.message || 'Failed to fetch NGO list.');
        console.error('Backend error fetching NGOs:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching NGOs:', err);
      setError('Network error fetching NGOs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNGOs(); // Initial fetch
  }, [API_BASE_URL]);

const handleOpenEditModal = (ngoId) => {
    setSelectedNgoId(ngoId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = (updatedNgo) => { // Updated to accept updatedNgo
    setIsEditModalOpen(false);
    setSelectedNgoId(null);
    if (updatedNgo) { // If NGO was updated, refresh the list
      fetchAllNGOs();
    }
  };
  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading NGOs...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>NGO Management</h1>
      <p className={styles.subHeading}>Manage all NGO accounts in the system.</p>

      {ngos.length === 0 ? (
        <p className={styles.noNgosMessage}>No NGO accounts found in the system.</p>
      ) : (
        <ul className={styles.ngoList}>
          {ngos.map(ngoItem => (
            <li key={ngoItem._id} className={styles.ngoItem}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{ngoItem.firstName} {ngoItem.lastName || ''}</h3> 
                <span className={styles.ngoRole}>{ngoItem.role.toUpperCase()}</span>
              </div>
              <p className={styles.ngoDetails}>Email: {ngoItem.email}</p>
              {ngoItem.phone && <p className={styles.ngoDetails}>Phone: {ngoItem.phone}</p>}
              <p className={styles.ngoDetails}>Joined: {new Date(ngoItem.createdAt).toLocaleString()}</p>
              <div className={styles.itemActions}>
               
                <button className={styles.actionButton} onClick={() => handleOpenEditModal(ngoItem._id)}>Edit</button>
                <button className={`${styles.actionButton} ${styles.approveButton}`}>Approve</button>
                <button className={`${styles.actionButton} ${styles.rejectButton}`}>Reject</button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isEditModalOpen && (
  <NgoEditModal
    ngoId={selectedNgoId}
    onClose={handleCloseEditModal}
    API_BASE_URL={API_BASE_URL}
    onNgoUpdated={handleCloseEditModal}
  />
)}
    </div>
  );
};

export default NgoManagementView;*/
// src/components/NgoManagementView.jsx
import React, { useState, useEffect } from 'react';
import NgoEditModal from './NgoEditModal';
import styles from './NgoManagementView.module.css';

const NgoManagementView = ({ user: adminUser }) => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNgoId, setSelectedNgoId] = useState(null);
  // NEW STATES for Delete NGO feedback
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const fetchAllNGOs = async () => {
    setLoading(true);
    setError(null);
    setDeleteMessage(null); // Clear delete messages on fetch
    setDeleteError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required to view NGOs.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ngos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setNgos(data.ngos || []);
      } else {
        setError(data.message || 'Failed to fetch NGO list.');
        console.error('Backend error fetching NGOs:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching NGOs:', err);
      setError('Network error fetching NGOs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNGOs(); // Initial fetch
  }, [API_BASE_URL]);


  // Handlers for modal
  const handleOpenEditModal = (ngoId) => {
    setSelectedNgoId(ngoId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = (updatedNgo) => {
    setIsEditModalOpen(false);
    setSelectedNgoId(null);
    if (updatedNgo) { // If NGO was updated, refresh the list
      fetchAllNGOs();
    }
  };

  // NEW: handleDeleteNGO function
  const handleDeleteNGO = async (ngoIdToDelete) => {
    setDeleteMessage(null); // Clear previous messages
    setDeleteError(null);

    const confirmDelete = window.confirm('Are you sure you want to permanently delete this NGO? This action cannot be undone.');
    if (!confirmDelete) {
      return; // Stop if user cancels
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setDeleteError('Authentication required to delete NGOs.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin/ngos/${ngoIdToDelete}`, {
            method: 'DELETE', // Use DELETE method
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.ok) {
            setDeleteMessage('NGO deleted successfully!');
            fetchAllNGOs(); // Refresh the list to show the NGO is removed
        } else {
            const data = await res.json();
            setDeleteError(data.message || 'Failed to delete NGO. Please try again.');
            console.error('Backend error deleting NGO:', data.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Network error deleting NGO:', err);
        setDeleteError('Network error deleting NGO. Please try again.');
    }
  };


  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading NGOs...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>NGO Management</h1>
      <p className={styles.subHeading}>Manage all NGO accounts in the system.</p>

      {/* Display delete messages */}
      {deleteMessage && <p className={styles.successMessage}>{deleteMessage}</p>}
      {deleteError && <p className={styles.errorMessage}>{deleteError}</p>}


      {ngos.length === 0 ? (
        <p className={styles.noNgosMessage}>No NGO accounts found in the system.</p>
      ) : (
        <ul className={styles.ngoList}>
          {ngos.map(ngoItem => (
            <li key={ngoItem._id} className={styles.ngoItem}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{ngoItem.firstName} {ngoItem.lastName || ''}</h3>
                <span className={styles.ngoRole}>{ngoItem.role.toUpperCase()}</span>
              </div>
              <p className={styles.ngoDetails}>Email: {ngoItem.email}</p>
              {ngoItem.phone && <p className={styles.ngoDetails}>Phone: {ngoItem.phone}</p>}
              <p className={styles.ngoDetails}>Joined: {new Date(ngoItem.createdAt).toLocaleString()}</p>
              <div className={styles.itemActions}>
                {/* Button to open edit modal */}
                <button 
                  className={styles.actionButton} 
                  onClick={() => handleOpenEditModal(ngoItem._id)}
                >
                  Edit
                </button>
                {/* Delete button, wired to new handleDeleteNGO function */}
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`} 
                  onClick={() => handleDeleteNGO(ngoItem._id)} // Pass NGO ID to delete
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* NGO Edit Modal */}
      {isEditModalOpen && selectedNgoId && (
        <NgoEditModal
          ngoId={selectedNgoId}
          onClose={handleCloseEditModal}
          API_BASE_URL={API_BASE_URL}
          onNgoUpdated={handleCloseEditModal} // Pass callback to refresh list and close modal
        />
      )}
    </div>
  );
};

export default NgoManagementView;