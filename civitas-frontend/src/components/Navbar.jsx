import React, {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import styles from './Navbar.module.css';
const Navbar = ({user, toggleSidebar, onProfileUpdateSuccess, onNavigateToContent, onProfileDeleteResult}) => {
    const navigate=useNavigate();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen]= useState(false);

    const handleLogout=()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/home');
    };

    const handleProfileClick=()=>{
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    return(
        <nav className={styles.navbar}>
            <div className={styles.navbarLeft}>
                <div className={styles.hamburgerMenu} onClick={toggleSidebar}>☰</div>
                <Link to="/dashboard" className={styles.civitasLogo}>
                    CIVITAS
                </Link>
            </div>

            <div className={styles.navbarRight}>
                <div className={styles.profileSection} onClick={handleProfileClick}>
                    <span className={styles.profileIcon}>{user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}</span>
                    {isProfileDropdownOpen && (
                        <ProfileDropdown user={user} onLogout={handleLogout} onClose={() => setIsProfileDropdownOpen(false)} onProfileUpdateSuccess={onProfileUpdateSuccess} onNavigateToContent={onNavigateToContent} onProfileDeleteResult={onProfileDeleteResult} />
                    )}
                    </div>
            </div>
        </nav>
    );
};

export default Navbar;