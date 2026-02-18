'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  spotsAvailable: number;
  isSoldOut: boolean;
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/events/${params.id}`);

      if (!response.ok) {
        throw new Error('Event not found');
      }

      const data = await response.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/tickets/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: params.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();
      router.push(`/tickets/${data.ticket.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading event...</div>;
  }

  if (error || !event) {
    return <div className="error-message">{error || 'Event not found'}</div>;
  }

  return (
    <div>
      <div className="event-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="event-card-header">
          <h1 className="event-title">{event.title}</h1>
          <p className="event-date">{formatDate(event.dateTime)}</p>
        </div>

        <div className="event-card-body">
          <div className="event-location">
            {event.location}
          </div>

          {event.description && (
            <p style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
              {event.description}
            </p>
          )}

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#ecf0f1', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <strong>Price:</strong> {event.price > 0 ? `$${event.price}` : 'FREE'}
              </div>
              <div>
                <strong>Capacity:</strong> {event.capacity}
              </div>
            </div>
            <div>
              <strong>Available:</strong> {event.spotsAvailable} spots left
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            className="btn btn-primary"
            disabled={registering || event.isSoldOut}
            style={{ width: '100%', marginTop: '2rem', fontSize: '1.2rem', padding: '1rem' }}
          >
            {registering ? 'Registering...' : event.isSoldOut ? 'Sold Out' : 'Register for Event'}
          </button>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a href="/" style={{ color: '#7f8c8d' }}>Back to Events</a>
          </div>
        </div>
      </div>
    </div>
  );
}
