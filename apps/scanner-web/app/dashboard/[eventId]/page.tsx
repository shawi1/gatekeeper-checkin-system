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
      <div style={{
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div className="page-header" style={{ textAlign: 'left', marginBottom: 0, flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: '0.75rem' }}>Event Dashboard</h1>
          <h2 style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            {stats.eventTitle}
          </h2>
        </div>
        <button
          onClick={fetchStats}
          className="btn btn-primary"
          style={{ minWidth: '150px' }}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="info-message" style={{ marginBottom: '2rem' }}>
        <span>🕐</span>
        <span>Last updated: {formatLastUpdated(stats.lastUpdated)} • Auto-refreshes every 5 seconds</span>
      </div>

      {/* Main Statistics Grid */}
      <div className="dashboard-grid">
        {/* Total Registered */}
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>📋 Registered</div>
          <div className="stat-value">{stats.totalRegistered}</div>
        </div>

        {/* Total Checked In */}
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>✓ Checked In</div>
          <div className="stat-value">
            {stats.totalCheckedIn}
          </div>
        </div>

        {/* Waitlisted */}
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>⏳ Waitlisted</div>
          <div className="stat-value" style={{
            background: 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stats.totalWaitlisted}
          </div>
        </div>

        {/* Check-in Rate */}
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>📊 Check-in Rate</div>
          <div className="stat-value">
            {stats.checkInRate}%
          </div>
        </div>
      </div>

      {/* Capacity Progress */}
      <div style={{
        marginTop: '3rem',
        background: 'var(--dark-card)',
        padding: '2.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--dark-border)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          🏢 Venue Capacity
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          fontSize: '1.05rem'
        }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {stats.totalRegistered + stats.totalCheckedIn} / {stats.capacity} attendees
          </span>
          <span style={{
            color: getCapacityPercentage() >= 90 ? 'var(--danger)' : 'var(--primary)',
            fontWeight: 700
          }}>
            {Math.round(getCapacityPercentage())}% full
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${getCapacityPercentage()}%`,
              background: getCapacityPercentage() >= 90
                ? 'linear-gradient(90deg, var(--danger), #dc2626)'
                : 'linear-gradient(90deg, var(--primary), var(--primary-light))'
            }}
          >
            {getCapacityPercentage() >= 10 && `${Math.round(getCapacityPercentage())}%`}
          </div>
        </div>
        {getCapacityPercentage() >= 90 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '0.5rem',
            color: '#fca5a5',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            ⚠️ Event is nearing capacity
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <a href="/" className="btn btn-primary" style={{ minWidth: '180px' }}>
          ← Back to Scanner
        </a>
        <button onClick={fetchStats} className="btn btn-secondary" style={{ minWidth: '180px' }}>
          🔄 Manual Refresh
        </button>
      </div>

      {/* Additional Info */}
      <div style={{
        marginTop: '3rem',
        background: 'var(--dark-card)',
        padding: '2.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--dark-border)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          marginBottom: '1.5rem',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          📈 Detailed Summary
        </h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{
            padding: '1rem 0',
            borderBottom: '1px solid var(--dark-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Tickets Sold</span>
            <strong style={{ fontSize: '1.2rem', color: 'white' }}>
              {stats.totalRegistered + stats.totalCheckedIn}
            </strong>
          </li>
          <li style={{
            padding: '1rem 0',
            borderBottom: '1px solid var(--dark-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Checked In</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
              {stats.totalCheckedIn}
            </strong>
          </li>
          <li style={{
            padding: '1rem 0',
            borderBottom: '1px solid var(--dark-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Not Yet Checked In</span>
            <strong style={{ fontSize: '1.2rem', color: 'white' }}>
              {stats.totalRegistered}
            </strong>
          </li>
          <li style={{
            padding: '1rem 0',
            borderBottom: '1px solid var(--dark-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Waitlisted</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--warning)' }}>
              {stats.totalWaitlisted}
            </strong>
          </li>
          <li style={{
            padding: '1rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Available Spots</span>
            <strong style={{ fontSize: '1.2rem', color: 'white' }}>
              {Math.max(0, stats.capacity - stats.totalRegistered - stats.totalCheckedIn)}
            </strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
