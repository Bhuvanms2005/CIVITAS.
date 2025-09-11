import React from 'react';
import './Legend.css'; // We will create this CSS file next

const Legend = () => {
  return (
    <div className="legend">
      <h4>Complaint Rate</h4>
      <div><i style={{ background: 'red' }}></i><span>High (&gt; 30)</span></div>
      <div><i style={{ background: 'yellow' }}></i><span>Medium (11-30)</span></div>
      <div><i style={{ background: 'green' }}></i><span>Low (0-10)</span></div>
    </div>
  );
};

export default Legend;