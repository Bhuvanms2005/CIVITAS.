import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose, onMenuItemClick }) => {
  return (
    <>
  {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
    <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <button className={styles.closeButton} onClick={onClose}>&times;</button>
      <div className={styles.menuHeader}>
        <h3 id="Heading">Main Menu</h3>
      </div>
      <ul className={styles.menuList}>
        <li onClick={() => onMenuItemClick('home')}>🏠 Dashboard Home</li>
      </ul>
      <div className={styles.menuDivider}></div>
      <div className={styles.menuHeader}>
        <h3 id="Heading">Report a New Complaint</h3>
      </div>
      <ul className={styles.menuList}>
        <li className={styles.categoryHeader}>1. Sanitation & Waste</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Sanitation & Waste', subType: 'Garbage Overflow' })}>🗑 Garbage Overflow</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Sanitation & Waste', subType: 'Missed Waste Pickup' })}>🚮 Missed Waste Pickup</li>

        <li className={styles.categoryHeader}>2. Drainage & Water</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Drainage & Water', subType: 'Drainage Overflow' })}>💧 Drainage Overflow</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Drainage & Water', subType: 'Waterlogging / Flooded Street' })}>🌊 Waterlogging / Flooded Street</li>

        <li className={styles.categoryHeader}>3. Electrical & Lighting</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Electrical & Lighting', subType: 'Streetlight Not Working' })}>💡 Streetlight Not Working</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Electrical & Lighting', subType: 'Streetlight Always ON' })}>🔆 Streetlight Always ON</li>

        <li className={styles.categoryHeader}>4. Road & Infrastructure</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Road & Infrastructure', subType: 'Pothole / Damaged Road' })}>🕳 Pothole / Damaged Road</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Road & Infrastructure', subType: 'Tree Fallen / Road Obstruction' })}>🌳 Tree Fallen / Road Obstruction</li>

        <li className={styles.categoryHeader}>5. Animal Safety / Nuisance</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Animal Safety / Nuisance', subType: 'Stray Dog Issue' })}>🐕 Stray Dog Issue</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Animal Safety / Nuisance', subType: 'Cattle Blocking Road' })}>🐄 Cattle Blocking Road</li>

        <li className={styles.categoryHeader}>6. Public Safety</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Public Safety', subType: 'Noise Complaint' })}>🔊 Noise Complaint</li>
        <li className={styles.subMenuItem} onClick={() => onMenuItemClick({ type: 'reportComplaint', category: 'Public Safety', subType: 'Broken Footpath / Open Manhole' })}>🧱 Broken Footpath / Open Manhole</li>
      </ul>
      <div className={styles.menuDivider}></div>
      <ul className={styles.menuList}>
        <li onClick={() => onMenuItemClick('myComplaints')}>📋 My Complaints</li>
        <li onClick={() => onMenuItemClick('announcements')}>📢 Local Announcements</li>      </ul>
    </div>
    </>
  );
};

export default Sidebar;