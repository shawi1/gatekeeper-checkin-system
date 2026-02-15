// Requirement: FR-09 - Real-time attendance statistics
// Purpose: Display live event statistics and check-in rates
// Links: See docs/requirements-traceability.md section 3.1.9
// ⭐ KEY DEMO FILE

'use client';

import { useEffect, useState } from 'react';

interface AttendanceStats {
  eventId: string;
  eventTitle: string;
  totalRegistered: number;
  totalCheckedIn: number;
  totalWaitlisted: number;
  capacity: number;
  checkInRate: number;
  lastUpdated: string;
}

export default function DashboardPage({ params }: { params: { eventId: string } }) {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();

    // FR-09: Poll for updates every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [params.eventId]);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scanner/stats/${params.eventId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
      setError('');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getCapacityPercentage = () => {
    if (!stats) return 0;
    const total = stats.totalRegistered + stats.totalCheckedIn;
    return Math.min((total / stats.capacity) * 100, 100);
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (error || !stats) {
    return <div className="error-message">{error || 'Statistics not available'}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Event Dashboard</h1>
          <h2 style={{ color: '#95a5a6', fontSize: '1.3rem' }}>{stats.eventTitle}</h2>
        </div>
        <button onClick={fetchStats} className="btn btn-primary">
          🔄 Refresh
        </button>
      </div>

      <div className="info-message">
        Last updated: {formatLastUpdated(stats.lastUpdated)} • Auto-refreshes every 5 seconds
      </div>

      {/* Main Statistics Grid */}
      <div className="dashboard-grid">
        {/* Total Registered */}
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalRegistered}</div>
          <div className="stat-label">Registered</div>
        </div>

        {/* Total Checked In */}
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>
            {stats.totalCheckedIn}
          </div>
          <div className="stat-label">Checked In</div>
        </div>

        {/* Waitlisted */}
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>
            {stats.totalWaitlisted}
          </div>
          <div className="stat-label">Waitlisted</div>
        </div>

        {/* Check-in Rate */}
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value" style={{ color: '#3498db' }}>
            {stats.checkInRate}%
          </div>
          <div className="stat-label">Check-in Rate</div>
        </div>
      </div>

      {/* Capacity Progress */}
      <div style={{ marginTop: '3rem', background: '#2c3e50', padding: '2rem', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Capacity</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: '#95a5a6' }}>
            {stats.totalRegistered + stats.totalCheckedIn} / {stats.capacity} attendees
          </span>
          <span style={{ color: '#95a5a6' }}>
            {Math.round(getCapacityPercentage())}% full
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${getCapacityPercentage()}%`,
              background: getCapacityPercentage() >= 90
                ? 'linear-gradient(90deg, #e74c3c, #c0392b)'
                : 'linear-gradient(90deg, #27ae60, #2ecc71)'
            }}
          >
            {getCapacityPercentage() >= 10 && `${Math.round(getCapacityPercentage())}%`}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <a href="/" className="btn btn-primary" style={{ marginRight: '1rem' }}>
          📱 Back to Scanner
        </a>
        <button onClick={fetchStats} className="btn btn-secondary">
          🔄 Manual Refresh
        </button>
      </div>

      {/* Additional Info */}
      <div style={{ marginTop: '3rem', background: '#2c3e50', padding: '2rem', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Summary</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #34495e' }}>
            <strong>Total Tickets Sold:</strong> {stats.totalRegistered + stats.totalCheckedIn}
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #34495e' }}>
            <strong>Checked In:</strong> {stats.totalCheckedIn}
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #34495e' }}>
            <strong>Not Yet Checked In:</strong> {stats.totalRegistered}
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #34495e' }}>
            <strong>Waitlisted:</strong> {stats.totalWaitlisted}
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <strong>Available Spots:</strong>{' '}
            {Math.max(0, stats.capacity - stats.totalRegistered - stats.totalCheckedIn)}
          </li>
        </ul>
      </div>
    </div>
  );
}
