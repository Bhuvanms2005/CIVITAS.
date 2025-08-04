import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
import L from 'leaflet';
import styles from './HomeDashboardView.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const HomeDashboardView = ({ user }) => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [localComplaints, setLocalComplaints] = useState([]);
  const [localComplaintsLoading, setLocalComplaintsLoading] = useState(true);
  const [localComplaintsError, setLocalComplaintsError] = useState(null);
  const [cityComplaintsData, setCityComplaintsData] = useState({ labels: [], datasets: [] });
  const [cityStatsLoading, setCityStatsLoading] = useState(true);
  const [cityStatsError, setCityStatsError] = useState(null);
  const [localityZonesData, setLocalityZonesData] = useState(null);

  const [localAnnouncements, setLocalAnnouncements] = useState([]);
  const [localAnnouncementsLoading, setLocalAnnouncementsLoading] = useState(true);
  const [localAnnouncementsError, setLocalAnnouncementsError] = useState(null);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          setLocationError(null);
        },
        (error) => {
          setLocationError('Location access denied. Some features may be limited.');
          console.error("Geolocation Error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  useEffect(() => {
    const fetchLocalComplaints = async () => {
      setLocalComplaintsLoading(true);
      setLocalComplaintsError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setLocalComplaintsLoading(false);
        setLocalComplaintsError('Authentication or location required.');
        return;
      }

      if (!location) {
        setLocalComplaintsLoading(false);
        setLocalComplaintsError('Waiting for location or location access denied.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/complaints/local?lat=${location.lat}&lon=${location.lon}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 204) {
          setLocalComplaints([]);
          setLocalComplaintsLoading(false);
          return;
        }

        const data = await res.json();
        if (res.ok) {
          setLocalComplaints(data.complaints || []);
        } else {
          setLocalComplaintsError(data.message || 'Failed to fetch local complaints.');
        }
      } catch (err) {
        setLocalComplaintsError('Network error fetching local complaints.');
        console.error('Network error fetching local complaints:', err);
      } finally {
        setLocalComplaintsLoading(false);
      }
    };
    if (location) fetchLocalComplaints();
    else if (locationError) setLocalComplaintsLoading(false);
  }, [location, API_BASE_URL, locationError]);

  useEffect(() => {
    const fetchCityStats = async () => {
      setCityStatsLoading(true);
      setCityStatsError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setCityStatsError('Authentication required to fetch city stats.');
        setCityStatsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/complaints/city-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setCityComplaintsData({
            labels: data.stats.labels,
            datasets: [
              {
                label: 'Complaints',
                data: data.stats.data,
                backgroundColor: data.stats.labels.map(label => {
                  switch(label) {
                    case 'Sanitation & Waste': return '#FF6384';
                    case 'Drainage & Water': return '#36A2EB';
                    case 'Electrical & Lighting': return '#FFCE56';
                    case 'Road & Infrastructure': return '#4BC0C0';
                    case 'Animal Safety / Nuisance': return '#9966FF';
                    case 'Public Safety': return '#FF9933';
                    default: return '#C9CBCE';
                  }
                }),
                borderColor: data.stats.labels.map(label => {
                  switch(label) {
                    case 'Sanitation & Waste': return '#FF6384';
                    case 'Drainage & Water': return '#36A2EB';
                    case 'Electrical & Lighting': return '#FFCE56';
                    case 'Road & Infrastructure': return '#4BC0C0';
                    case 'Animal Safety / Nuisance': return '#9966FF';
                    default: return '#C9CBCE';
                  }
                }),
                borderWidth: 1,
              },
            ],
          });
        } else {
          setCityStatsError(data.message || 'Failed to fetch city statistics.');
        }
      } catch (err) {
        setCityStatsError('Network error fetching city statistics.');
        console.error('Network error fetching city statistics:', err);
      } finally {
        setCityStatsLoading(false);
      }
    };

    fetchCityStats();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchLocalAnnouncements = async () => {
      setLocalAnnouncementsLoading(true);
      setLocalAnnouncementsError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setLocalAnnouncementsError('Authentication required to fetch announcements.');
        setLocalAnnouncementsLoading(false);
        return;
      }
      const localityParam = user?.locality ? `&locality=${user.locality}` : '';

      try {
        const res = await fetch(`${API_BASE_URL}/announcements?limit=5${localityParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setLocalAnnouncements(data.announcements || []);
        } else {
          setLocalAnnouncementsError(data.message || 'Failed to fetch announcements.');
        }
      } catch (err) {
        setLocalAnnouncementsError('Network error fetching announcements.');
        console.error("Network error fetching announcements:", err);
      } finally {
        setLocalAnnouncementsLoading(false);
      }
    };
    fetchLocalAnnouncements();
  }, [API_BASE_URL, user?.locality]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setLeaderboardError('Authentication required to fetch leaderboard.');
        setLeaderboardLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/users/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLeaderboardData(data.leaderboard || []);
        else setLeaderboardError(data.message || 'Failed to fetch leaderboard.');
      } catch (err) {
        setLeaderboardError('Network error fetching leaderboard.');
        console.error('Network error fetching leaderboard:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, [API_BASE_URL]);

  useEffect(() => {
    const mockGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Koramangala', zone: 'red', complaints: 45 },
          geometry: { type: 'Polygon', coordinates: [[[77.618, 12.935], [77.62, 12.935], [77.62, 12.933], [77.618, 12.933], [77.618, 12.935]]] }
        },
        {
          type: 'Feature',
          properties: { name: 'Jayanagar', zone: 'orange', complaints: 20 },
          geometry: { type: 'Polygon', coordinates: [[[77.585, 12.929], [77.587, 12.929], [77.587, 12.927], [77.585, 12.927], [77.585, 12.929]]] }
        },
        {
          type: 'Feature',
          properties: { name: 'Indiranagar', zone: 'green', complaints: 8 },
          geometry: { type: 'Polygon', coordinates: [[[77.64, 12.974], [77.642, 12.974], [77.642, 12.972], [77.64, 12.972], [77.64, 12.974]]] }
        }
      ]
    };
    setLocalityZonesData(mockGeoJSON);
  }, []);

  const getZoneStyle = (feature) => {
    switch (feature.properties.zone) {
      case 'red': return { color: '#dc3545', weight: 2, fillColor: '#dc3545', fillOpacity: 0.5 };
      case 'orange': return { color: '#fd7e14', weight: 2, fillColor: '#fd7e14', fillOpacity: 0.5 };
      case 'green': return { color: '#28a745', weight: 2, fillColor: '#28a745', fillOpacity: 0.5 };
      default: return { color: '#555', weight: 2, fillColor: '#555', fillOpacity: 0.3 };
    }
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties?.name) {
      layer.bindPopup(
        `<strong>${feature.properties.name}</strong><br/>Zone: ${feature.properties.zone.toUpperCase()}<br/>Complaints: ${feature.properties.complaints}`
      );
    }
  };

  const defaultMapCenter = [12.9716, 77.5946];
  const defaultZoom = 12;

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Complaints' } },
      x: { title: { display: true, text: 'Complaint Categories' } }
    }
  };

  return (
    <div className={styles.homeDashboardContainer}>
      <h1 className={styles.welcomeHeading}>Welcome, {user.firstName}!</h1>

      <div className={styles.locationStatus}>
        {locationError && <p className={styles.locationErrorMessage}>{locationError}</p>}
        {!location && !locationError && <p className={styles.locationPrompt}>Requesting your location...</p>}
        {location && <p className={styles.locationSuccessMessage}>📍 Location: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}</p>}
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.sectionCard}>
          <h2>📍 Local Complaints (Past 2 Weeks)</h2>
          {localComplaintsLoading ? <p className={styles.chartPlaceholder}>Loading local complaints...</p> : localComplaintsError ? <p className={`${styles.chartPlaceholder} ${styles.error}`}>{localComplaintsError}</p> : localComplaints.length > 0 ? (
            <ul className={styles.complaintList}>
              {localComplaints.map(complaint => (
                <li key={complaint.id} className={styles.complaintItem}>
                  <strong>{complaint.type}:</strong> {complaint.description} <br/>
                  Status: <span className={`${styles.status} ${styles[complaint.status.toLowerCase()]}`}>{complaint.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.chartPlaceholder}>No local complaints found in your area for the last 2 weeks.</p>
          )}
        </div>

        <div className={styles.sectionCard}>
          <h2>🚦 Locality Condition Zones (Map)</h2>
          <div className={styles.mapContainer}>
            <MapContainer center={location ? [location.lat, location.lon] : defaultMapCenter} zoom={defaultZoom} scrollWheelZoom={false} className={styles.leafletMap}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
              {localityZonesData && <GeoJSON data={localityZonesData} style={getZoneStyle} onEachFeature={onEachFeature} />}
              {location && <Marker position={[location.lat, location.lon]}><Popup>Your Current Location</Popup></Marker>}
              {localComplaints.map(comp => comp.lat && comp.lon && (
                <Marker key={comp.id} position={[comp.lat, comp.lon]}>
                  <Popup><strong>{comp.type}: {comp.subType}</strong><br/>{comp.description}<br/>Status: {comp.status}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2>📊 City-Wide Complaints (Past 2 Weeks)</h2>
          {cityStatsLoading ? <p className={styles.chartPlaceholder}>Loading city stats...</p> : cityStatsError ? <p className={`${styles.chartPlaceholder} ${styles.error}`}>{cityStatsError}</p> : cityComplaintsData.labels.length > 0 ? (
            <div className={styles.chartContainer}>
              <Bar options={chartOptions} data={cityComplaintsData} />
            </div>
          ) : (
            <p className={styles.chartPlaceholder}>No city-wide complaints data available.</p>
          )}
        </div>

        <div className={styles.sectionCard}>
          <h2>📢 Local Announcements</h2>
          {localAnnouncementsLoading ? <p>Loading announcements...</p> :
            localAnnouncementsError ? <p className={styles.error}>{localAnnouncementsError}</p> :
              localAnnouncements.length > 0 ? (
                <ul className={styles.announcementList}>
                  {localAnnouncements.map(a => (
                    <li key={a._id} className={styles.announcementItem}>
                      <strong>{a.title}</strong> <br />
                      <span>{a.content}</span> <br />
                      <small>{a.type} • {new Date(a.publishedAt).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              ) : <p>No announcements found in your locality.</p>}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboardView;

