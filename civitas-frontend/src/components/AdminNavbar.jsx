import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminNavbar.module.css'; 

const AdminNavbar = ({ user, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin'); 
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <div className={styles.hamburgerMenu} onClick={toggleSidebar}>☰</div>
        <Link to="/admin/dashboard" className={styles.adminLogo}>
          CIVITAS Admin
        </Link>
      </div>
      <div className={styles.navbarRight}>
        <div className={styles.profileSection} onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}>
          <span className={styles.profileIcon}>{user.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}</span> {/* 'A' for Admin */}
          {isAdminDropdownOpen && (
            <div className={styles.adminDropdownMenu}>
              <p><strong>{user.firstName} {user.lastName}</strong></p>
              <p>{user.email}</p>
              <p>Role: {user.role.toUpperCase()}</p>
              <button className={styles.dropdownButton} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;