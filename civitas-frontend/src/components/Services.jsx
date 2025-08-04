/*import React from 'react';
import styles from './Services.module.css'; 

function Services() {
  return (
    <div className={styles.container}>
      <h1>Our Services</h1>
      <p>
        At <strong>Civitas</strong>, we are dedicated to building cleaner, safer, and smarter cities by leveraging technology and community involvement.
        Our platform provides a set of vital services that empower citizens to raise complaints and share real-time issues related to urban infrastructure.
      </p>

      <h2>Garbage Disposal Complaints</h2>
      <p>
        Unattended garbage can be an eyesore and a health hazard. You can report any such issue in your neighborhood by simply uploading a photo and the exact location.
        We notify the relevant municipal authorities for swift cleanup, ensuring a cleaner environment.
      </p>

      <h2>Drainage Overflow Complaints</h2>
      <p>
        Overflowing or blocked drains are breeding grounds for disease and discomfort.
        Our platform allows you to report drainage problems with photos and location, helping local authorities respond quickly to prevent further inconvenience.
      </p>

      <h2>Damaged Roads Reporting</h2>
      <p>
        Roads full of potholes or cracks are risky for daily commuters.
        Through Civitas, you can report damaged roads by submitting a photo and location.
        We work with civic departments to ensure such areas are repaired quickly for safer travel.
      </p>

      <h2>Street Light Complaints</h2>
      <p>
        Dark streets can lead to accidents and crime.
        If you spot a broken or non-functional street light, just report it with its location and a photo.
        We’ll alert the local authorities to restore lighting and improve safety in your area.
      </p>
      <p className={styles.finalNote}>
        Every complaint you raise contributes to a better tomorrow.
        Let’s join hands in transforming our city with Civitas — your smart city companion.
      </p>

      <a href="/home" className={styles.homeLink}>← Back to Home</a>
    </div>
  );
}

export default Services;*/

import React from 'react';
import styles from './Services.module.css'; 

function Services() {
  return (
    <div className={styles.container}>
      <h1>Our Services</h1>
      <p>
        At <strong>Civitas</strong>, we are dedicated to building cleaner, safer, and smarter cities by leveraging 
        technology and community involvement. Our platform empowers citizens to report real-time urban issues 
        and helps civic authorities respond quickly.
      </p>

      <h2>Report a New Complaint</h2>
      <p>
        Choose from a wide range of categories to keep your city safe, clean, and efficient:
      </p>

      {/* 1. Sanitation & Waste */}
      <h3>1. Sanitation & Waste</h3>
      <ul>
        <li><strong>Garbage Overflow</strong> – Report unattended garbage piles for quick cleanup.</li>
        <li><strong>Missed Waste Pickup</strong> – Notify if the waste collection was skipped in your area.</li>
      </ul>

      {/* 2. Drainage & Water */}
      
      <h3>2. Drainage & Water</h3>
      <ul>
        <li><strong>Drainage Overflow</strong> – Report overflowing or blocked drains to avoid health hazards.</li>
        <li><strong>Waterlogging / Flooded Street</strong> – Alert authorities about water accumulation or flooding.</li>
      </ul>

      {/* 3. Electrical & Lighting */}
      <h3>3. Electrical & Lighting</h3>
      <ul>
        <li><strong>Streetlight Not Working</strong> – Report dark streets to enhance public safety.</li>
        <li><strong>Streetlight Always ON</strong> – Save energy by notifying lights that remain on during the day.</li>
      </ul>

      {/* 4. Road & Infrastructure */}
      <h3>4. Road & Infrastructure</h3>
      <ul>
        <li><strong>Pothole / Damaged Road</strong> – Prevent accidents by reporting damaged roads.</li>
        <li><strong>Tree Fallen / Road Obstruction</strong> – Ensure roads remain clear and safe for travel.</li>
      </ul>

      {/* 5. Animal Safety / Nuisance */}
      <h3>5. Animal Safety / Nuisance</h3>
      <ul>
        <li><strong>Stray Dog Issue</strong> – Ensure safe handling of stray dogs in your area.</li>
        <li><strong>Cattle Blocking Road</strong> – Report obstructions caused by animals for traffic safety.</li>
      </ul>

      {/* 6. Public Safety */}
      <h3>6. Public Safety</h3>
      <ul>
        <li><strong>Noise Complaint</strong> – Maintain peaceful neighborhoods by reporting excessive noise.</li>
        <li><strong>Broken Footpath / Open Manhole</strong> – Avoid accidents by alerting unsafe walkways.</li>
      </ul>

      <p className={styles.finalNote}>
        Every complaint you raise contributes to a better tomorrow.
        Let’s join hands in transforming our city with Civitas — your smart city companion.
      </p>

      <a href="/home" className={styles.homeLink}>← Back to Home</a>
    </div>
  );
}

export default Services;


