/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; // We'll create this next
import AdminSidebar from './AdminSidebar'; // We'll create this soon
import AdminHomeView from './AdminHomeView'; // Default view for admin
import ComplaintManagementView from './ComplaintManagementView';
import UserManagementView from './UserManagementView';
import NgoManagementView from './NgoManagementView';
import AnnouncementManagementView from './AnnouncementManagementView';
// import ReportsView from './ReportsView';

import styles from './AdminDashboard.module.css'; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('home'); 

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        navigate('/signin'); 
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'admin') {
          setError('Access Denied: You do not have administrator privileges.');
          setLoading(false);
          navigate('/dashboard'); 
          return;
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        navigate('/signin');
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin?message=Session expired. Please login again.');
            return;
          }
          throw new Error('Failed to fetch admin profile');
        }

        const data = await res.json();
        if (data.user.role !== 'admin') {
            setError('Access Denied: Your role has changed. Please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin');
            return;
        }
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('Failed to load admin profile data.');
        setLoading(false);
        navigate('/signin?message=Error loading Admin Dashboard.');
      }
    };

    fetchAdminProfile();
  }, [navigate, API_BASE_URL]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (contentKey) => {
    setActiveContent(contentKey);
    setIsSidebarOpen(false); 
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (!user) {
    return <div className={styles.redirectingContainer}>Redirecting...</div>;
  }

  return (
    <div className={styles.adminDashboardLayout}>
      <AdminNavbar user={user} toggleSidebar={toggleSidebar} />
      <AdminSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onMenuItemClick={handleMenuItemClick} />
      <div className={`${styles.mainContentArea} ${isSidebarOpen ? styles.shiftedContent : ''}`}>
        {activeContent === 'home' && <AdminHomeView user={user} />}
        {activeContent === 'complaintManagement' && <ComplaintManagementView user={user} />} 
        {activeContent === 'userManagement' && <UserManagementView user={user} />} 
        {activeContent === 'ngoManagement' && <NgoManagementView user={user} />}
        
      </div>
    </div>
  );
};

export default AdminDashboard;*/

// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminHomeView from './AdminHomeView';
import ComplaintManagementView from './ComplaintManagementView';
import UserManagementView from './UserManagementView';
import NgoManagementView from './NgoManagementView';
import AnnouncementManagementView from './AnnouncementManagementView'; // NEW: Import AnnouncementManagementView
// import ReportsView from './ReportsView';

import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('home');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        navigate('/signin');
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'admin') {
          setError('Access Denied: You do not have administrator privileges.');
          setLoading(false);
          navigate('/dashboard'); // Redirect non-admin users to their respective dashboards
          return;
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        navigate('/signin');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin?message=Session expired. Please login again.');
            return;
          }
          throw new Error('Failed to fetch admin profile');
        }

        const data = await res.json();
        if (data.user.role !== 'admin') {
            setError('Access Denied: Your role has changed. Please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin');
            return;
        }
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('Failed to load admin profile data.');
        setLoading(false);
        navigate('/signin?message=Error loading Admin Dashboard.');
      }
    };

    fetchAdminProfile();
  }, [navigate, API_BASE_URL]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (contentKey) => {
    setActiveContent(contentKey);
    setIsSidebarOpen(false); // Close sidebar after selection
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (!user) {
    return <div className={styles.redirectingContainer}>Redirecting...</div>;
  }

  return (
    <div className={styles.adminDashboardLayout}>
      <AdminNavbar user={user} toggleSidebar={toggleSidebar} />
      <AdminSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onMenuItemClick={handleMenuItemClick} />
      <div className={`${styles.mainContentArea} ${isSidebarOpen ? styles.shiftedContent : ''}`}>
        {activeContent === 'home' && <AdminHomeView user={user} />}
        {activeContent === 'complaintManagement' && <ComplaintManagementView user={user} />}
        {activeContent === 'userManagement' && <UserManagementView user={user} />}
        {activeContent === 'ngoManagement' && <NgoManagementView user={user} />}
        {/* NEW: Conditional rendering for AnnouncementManagementView */}
        {activeContent === 'announcementManagement' && <AnnouncementManagementView user={user} />}
        {/* Placeholder for other admin views */}
        {/* {activeContent === 'reports' && <ReportsView user={user} />} */}
      </div>
    </div>
  );
};

export default AdminDashboard;