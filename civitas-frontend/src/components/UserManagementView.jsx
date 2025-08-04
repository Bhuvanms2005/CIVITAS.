/*import React, { useState, useEffect } from 'react';
import UserEditModal from './UserEditModal'; // NEW: Import UserEditModal
import styles from './UserManagementView.module.css';

const UserManagementView = ({ user: adminUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // NEW: State for modal visibility
  const [selectedUserId, setSelectedUserId] = useState(null);       // NEW: State for selected user ID


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  // Function to fetch all users (moved outside useEffect for re-use)
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required to view users.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch user list.');
        console.error('Backend error fetching users:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching users:', err);
      setError('Network error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers(); // Initial fetch
  }, [API_BASE_URL]);


  // Handlers for modal
  const handleOpenEditModal = (userId) => {
    setSelectedUserId(userId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = (updatedUser) => {
    setIsEditModalOpen(false);
    setSelectedUserId(null);
    if (updatedUser) { // If user was updated, refresh the list
      fetchAllUsers();
    }
  };


  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading users...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>User Management</h1>
      <p className={styles.subHeading}>Manage all user accounts in the system.</p>

      {users.length === 0 ? (
        <p className={styles.noUsersMessage}>No users found in the system (except perhaps yourself).</p>
      ) : (
        <ul className={styles.userList}>
          {users.map(userItem => (
            <li key={userItem._id} className={styles.userItem}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{userItem.firstName} {userItem.lastName}</h3>
                <span className={styles.userRole}>{userItem.role.toUpperCase()}</span>
              </div>
              <p className={styles.userDetails}>Email: {userItem.email}</p>
              {userItem.phone && <p className={styles.userDetails}>Phone: {userItem.phone}</p>}
              <p className={styles.userDetails}>Joined: {new Date(userItem.createdAt).toLocaleString()}</p>
              <div className={styles.itemActions}>
                <button 
                  className={styles.actionButton} 
                  onClick={() => handleOpenEditModal(userItem._id)}
                >
                  Edit
                </button>
                
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`} 
                  onClick={() => alert(`Delete user ${userItem._id}`)} // Will implement later
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      
      {isEditModalOpen && selectedUserId && (
        <UserEditModal
          userId={selectedUserId}
          onClose={handleCloseEditModal}
          API_BASE_URL={API_BASE_URL}
          onUserUpdated={handleCloseEditModal} // Pass callback to refresh list and close modal
        />
      )}
    </div>
  );
};

export default UserManagementView;*/

// src/components/UserManagementView.jsx
import React, { useState, useEffect } from 'react';
import UserEditModal from './UserEditModal';
import styles from './UserManagementView.module.css';

const UserManagementView = ({ user: adminUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  // NEW STATES for Delete User feedback
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    setDeleteMessage(null); // Clear delete messages on fetch
    setDeleteError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required to view users.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch user list.');
        console.error('Backend error fetching users:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error fetching users:', err);
      setError('Network error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers(); // Initial fetch
  }, [API_BASE_URL]);


  // Handlers for modal
  const handleOpenEditModal = (userId) => {
    setSelectedUserId(userId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = (updatedUser) => {
    setIsEditModalOpen(false);
    setSelectedUserId(null);
    if (updatedUser) { // If user was updated, refresh the list
      fetchAllUsers();
    }
  };

  // NEW: handleDeleteUser function
  const handleDeleteUser = async (userIdToDelete) => {
    setDeleteMessage(null); // Clear previous messages
    setDeleteError(null);

    const confirmDelete = window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.');
    if (!confirmDelete) {
      return; // Stop if user cancels
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setDeleteError('Authentication required to delete users.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userIdToDelete}`, {
            method: 'DELETE', // Use DELETE method
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.ok) {
            setDeleteMessage('User deleted successfully!');
            fetchAllUsers(); // Refresh the list to show the user is removed
        } else {
            const data = await res.json();
            setDeleteError(data.message || 'Failed to delete user. Please try again.');
            console.error('Backend error deleting user:', data.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Network error deleting user:', err);
        setDeleteError('Network error deleting user. Please try again.');
    }
  };


  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading users...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>User Management</h1>
      <p className={styles.subHeading}>Manage all user accounts in the system.</p>

      {/* Display delete messages */}
      {deleteMessage && <p className={styles.successMessage}>{deleteMessage}</p>}
      {deleteError && <p className={styles.errorMessage}>{deleteError}</p>}


      {users.length === 0 ? (
        <p className={styles.noUsersMessage}>No users found in the system (except perhaps yourself).</p>
      ) : (
        <ul className={styles.userList}>
          {users.map(userItem => (
            <li key={userItem._id} className={styles.userItem}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{userItem.firstName} {userItem.lastName}</h3>
                <span className={styles.userRole}>{userItem.role.toUpperCase()}</span>
              </div>
              <p className={styles.userDetails}>Email: {userItem.email}</p>
              {userItem.phone && <p className={styles.userDetails}>Phone: {userItem.phone}</p>}
              <p className={styles.userDetails}>Joined: {new Date(userItem.createdAt).toLocaleString()}</p>
              <div className={styles.itemActions}>
                {/* Button to open edit modal */}
                <button 
                  className={styles.actionButton} 
                  onClick={() => handleOpenEditModal(userItem._id)}
                >
                  Edit
                </button>
                {/* Delete button, wired to new handleDeleteUser function */}
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`} 
                  onClick={() => handleDeleteUser(userItem._id)} // Pass user ID to delete
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* User Edit Modal */}
      {isEditModalOpen && selectedUserId && (
        <UserEditModal
          userId={selectedUserId}
          onClose={handleCloseEditModal}
          API_BASE_URL={API_BASE_URL}
          onUserUpdated={handleCloseEditModal} // Pass callback to refresh list and close modal
        />
      )}
    </div>
  );
};

export default UserManagementView;