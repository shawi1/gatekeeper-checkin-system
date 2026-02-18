'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ticket {
  id: string;
  status: string;
  checkInTime?: string;
  event: {
    id: string;
    title: string;
    dateTime: string;
    location: string;
  };
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/tickets/my-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'REGISTERED': 'badge-registered',
      'CHECKED_IN': 'badge-checked-in',
      'WAITLISTED': 'badge-waitlisted',
      'CANCELLED': 'badge-cancelled',
    };

    return `badge ${statusMap[status] || 'badge-secondary'}`;
  };

  if (loading) {
    return <div className="loading">Loading your tickets...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Tickets</h1>
        <p className="page-subtitle">View and manage your event tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>You don't have any tickets yet.</p>
          <a href="/" className="btn btn-primary">Browse Events</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/tickets/${ticket.id}`)}
            >
              <div className="ticket-header">
                <h2>{ticket.event.title}</h2>
                <p>{formatDate(ticket.event.dateTime)}</p>
                <p>{ticket.event.location}</p>
              </div>
              <div className="ticket-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={getStatusBadge(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  {ticket.checkInTime && (
                    <span style={{ color: '#27ae60', fontSize: '0.9rem' }}>
                      Checked in: {new Date(ticket.checkInTime).toLocaleString()}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '1rem', color: '#7f8c8d' }}>
                  Click to view QR code
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
