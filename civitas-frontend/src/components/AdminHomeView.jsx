// src/components/AdminHomeView.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './AdminHomeView.module.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});



const AdminHomeView = ({ user }) => {
  // States for KPIs
  const [kpiData, setKpiData] = useState({
    totalComplaints: 0,
    newToday: 0,
    resolvedThisWeek: 0,
    avgResolutionTime: 'N/A',
    complaintsByStatus: { Pending: 0, 'Process Ongoing': 0, Resolved: 0, Rejected: 0 }
  });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(null);

  // States for Locality Zone Map
  const [localityZonesData, setLocalityZonesData] = useState(null);
  const [localityZonesLoading, setLocalityZonesLoading] = useState(true);
  const [localityZonesError, setLocalityZonesError] = useState(null);

  // NEW STATES for Recent Activity Feed
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentActivityLoading, setRecentActivityLoading] = useState(true);
  const [recentActivityError, setRecentActivityError] = useState(null);


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  // Fetch KPI data
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setKpiLoading(true);
      setKpiError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setKpiError('Authentication required to fetch dashboard stats.');
        setKpiLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setKpiData(data.stats);
        } else {
          setKpiError(data.message || 'Failed to fetch dashboard statistics.');
          console.error('Backend error fetching dashboard stats:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching dashboard stats:', err);
        setKpiError('Network error fetching dashboard statistics. Please try again.');
      } finally {
        setKpiLoading(false);
      }
    };

    fetchDashboardStats();
  }, [API_BASE_URL]);


  // Fetch Locality Zone Data for Map
  useEffect(() => {
    const fetchLocalityZones = async () => {
      setLocalityZonesLoading(true);
      setLocalityZonesError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setLocalityZonesError('Authentication required to fetch locality data.');
        setLocalityZonesLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/zones/conditions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setLocalityZonesData(data.data);
        } else {
          setLocalityZonesError(data.message || 'Failed to fetch locality zone data.');
          console.error('Backend error fetching locality zones:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching locality zones:', err);
        setLocalityZonesError('Network error fetching locality zones. Please try again.');
      } finally {
        setLocalityZonesLoading(false);
      }
    };

    fetchLocalityZones();
  }, [API_BASE_URL]);


  // NEW useEffect: Fetch Recent Activity Feed Data
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setRecentActivityLoading(true);
      setRecentActivityError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setRecentActivityError('Authentication required to fetch recent activity.');
        setRecentActivityLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/activity-feed`, { // New API endpoint
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setRecentActivity(data.recentActivity || []); // Assuming backend returns { success, recentActivity: [...] }
        } else {
          setRecentActivityError(data.message || 'Failed to fetch recent activity.');
          console.error('Backend error fetching recent activity:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error fetching recent activity:', err);
        setRecentActivityError('Network error fetching recent activity. Please try again.');
      } finally {
        setRecentActivityLoading(false);
      }
    };

    fetchRecentActivity();
  }, [API_BASE_URL]);


  // Chart.js options (existing)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Complaints by Status',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Complaints'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Complaint Categories'
        }
      }
    }
  };
  // Prepare data for the complaintsByStatus chart
  const complaintsByStatusChartData = {
    labels: Object.keys(kpiData.complaintsByStatus),
    datasets: [
      {
        label: 'Complaints by Status',
        data: Object.values(kpiData.complaintsByStatus),
        backgroundColor: [
          '#FFCE56', // Pending (yellow)
          '#36A2EB', // Process Ongoing (blue)
          '#28a745', // Resolved (green)
          '#FF6384', // Rejected (red)
        ],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  // Map styling functions (existing)
  const getZoneStyle = (feature) => {
    switch (feature.properties.zone) {
      case 'red': return { color: '#dc3545', weight: 2, fillColor: '#dc3545', fillOpacity: 0.5 };
      case 'orange': return { color: '#fd7e14', weight: 2, fillColor: '#fd7e14', fillOpacity: 0.5 };
      case 'green': return { color: '#28a445', weight: 2, fillColor: '#28a745', fillOpacity: 0.5 };
      default: return { color: '#555', weight: 2, fillColor: '#555', fillOpacity: 0.3 };
    }
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(
        `<strong>${feature.properties.name}</strong><br/>` +
        `Zone: ${feature.properties.zone.toUpperCase()}<br/>` +
        `Complaints: ${feature.properties.complaints}`
      );
    }
  };

  const defaultMapCenter = [12.9716, 77.5946];
  const defaultZoom = 12;


  return (
    <div className={styles.adminHomeContainer}>
      <h1 className={styles.welcomeHeading}>Welcome, Admin {user.firstName}!</h1>
      <p className={styles.subHeading}>This is your central command for CIVITAS.</p>

      {kpiLoading ? (
        <p className={styles.loading}>Loading Dashboard KPIs...</p>
      ) : kpiError ? (
        <p className={styles.error}>Error: {kpiError}</p>
      ) : (
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <h3>Total Complaints</h3>
            <p>{kpiData.totalComplaints}</p>
          </div>
          <div className={styles.kpiCard}>
            <h3>New (Today)</h3>
            <p>{kpiData.newToday}</p>
          </div>
          <div className={styles.kpiCard}>
            <h3>Resolved (This Week)</h3>
            <p>{kpiData.resolvedThisWeek}</p>
          </div>
          <div className={styles.kpiCard}>
            <h3>Avg. Resolution Time</h3>
            <p>{kpiData.avgResolutionTime}</p>
          </div>
        </div>
      )}

      <div className={styles.sectionCard}>
        <h2>📈 Complaints by Status</h2>
        {kpiLoading ? (
          <p className={styles.loading}>Loading status chart...</p>
        ) : kpiError ? (
          <p className={styles.error}>{kpiError}</p>
        ) : complaintsByStatusChartData.labels.length > 0 ? (
          <div className={styles.chartContainer}>
            <Bar options={chartOptions} data={complaintsByStatusChartData} />
          </div>
        ) : (
          <p className={styles.placeholder}>No status data available.</p>
        )}
      </div>

      <div className={styles.sectionCard}>
        <h2>🚦 Locality Condition Zones (Map)</h2>
        {localityZonesLoading ? (
          <p className={styles.loading}>Loading locality map data...</p>
        ) : localityZonesError ? (
          <p className={styles.error}>{localityZonesError}</p>
        ) : localityZonesData ? (
          <div className={styles.mapContainer}>
            <MapContainer center={defaultMapCenter} zoom={defaultZoom} scrollWheelZoom={false} className={styles.leafletMap}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON data={localityZonesData} style={getZoneStyle} onEachFeature={onEachFeature} />
              
              {/* Optional: Add markers for individual complaints if desired on Admin map */}
              {/* This example uses a simplified fixed center for Admin map, not user's dynamic location */}
            </MapContainer>
          </div>
        ) : (
          <p className={styles.placeholder}>No locality zone data available. Please populate 'localities' collection.</p>
        )}
      </div>

      {/* Recent Activity Feed - UPDATED */}
      <div className={styles.sectionCard}>
        <h2>🕒Recent Activity Feed</h2>
        {recentActivityLoading ? (
          <p className={styles.loading}>Loading recent activity...</p>
        ) : recentActivityError ? (
          <p className={styles.error}>{recentActivityError}</p>
        ) : recentActivity.length > 0 ? (
          <ul className={styles.activityList}> {/* New class for activity list */}
            {recentActivity.map((activity, index) => (
              <li key={index} className={styles.activityItem}>
                <strong>{new Date(activity.date).toLocaleString()}:</strong> {activity.description}
                {activity.by && <small> by {activity.by}</small>}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.placeholder}>No recent activity found.</p>
        )}
      </div>

    </div>
  );
};

export default AdminHomeView;

