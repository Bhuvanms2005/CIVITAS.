import React from 'react';
import styles from './About.module.css';

function About() {
  return (
    <div className={styles.aboutContainer}>
      <h1>About Us</h1>
      <p>
        Welcome to <strong>Civitas</strong>, a digital platform built with a vision to transform our cities into cleaner, smarter, and more livable spaces for everyone.
        This website has been thoughtfully developed to empower citizens and promote active participation in maintaining urban cleanliness and infrastructure.
      </p>
      <p>
        At <strong>Civitas</strong>, we believe that a better tomorrow begins with responsible actions today.
        Our goal is to harness the power of technology to create a connected, aware, and responsive community where every voice matters and every issue can be addressed in a timely manner.
      </p>
      <p>
        Whether it's an overflowing garbage bin, a clogged drainage line, a pothole-ridden road, or a malfunctioning street light,
        we provide a simple way for you to raise your concerns and be part of the solution.
      </p>
      <p>
        Using our platform, you can easily report any civic issues by uploading a photo of the problem along with its exact location.
        Once received, we ensure that your complaint reaches the right department so that the issue can be resolved as quickly and efficiently as possible.
      </p>
      <p>
        This transparent and collaborative process is what drives our mission forward — building trust between citizens and local authorities.
      </p>
      <p>
        We are committed to making urban life better by using innovation, awareness, and cooperation as our core tools.
        Let’s come together and use technology for good. Let’s make our surroundings clean, functional, and safe — not just for ourselves but for future generations.
      </p>
      <p><strong>Together, let’s build a smarter city and a brighter tomorrow. Welcome to Civitas.</strong></p>
      
      <a href="/home" className={styles.homeLink}>← Back to Home</a>
    </div>
  );
}

export default About;