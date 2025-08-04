import React, { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required to fetch leaderboard.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLeaderboardData(data.leaderboard || []);
        else setError(data.message || 'Failed to fetch leaderboard.');
      } catch (err) {
        setError('Network error fetching leaderboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [API_BASE_URL]);

  return (
    <div className={styles.leaderboardPage}>
      <h2>🏆 Civic Champions Leaderboard</h2>
      {loading && <p>Loading leaderboard...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && leaderboardData.length === 0 && <p>No leaderboard data found.</p>}

      {!loading && !error && leaderboardData.length > 0 && (
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.firstName} {user.lastName || ''}</td>
                <td>{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
