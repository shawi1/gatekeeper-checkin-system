// Requirement: FR-01 - Public event discovery landing page
// Purpose: Display public events in a browsable grid
// Links: See docs/requirements-traceability.md section 3.1.1

'use client';

import { useEffect, useState } from 'react';

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

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/events/public`);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
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
    return (
      <div className="loading">
        <h2>Loading events...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discover Events</h1>
        <p className="page-subtitle">Find and register for upcoming events</p>
      </div>

      {events.length === 0 ? (
        <div className="loading">
          <p>No upcoming events available.</p>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => window.location.href = `/events/${event.id}`}
            >
              <div className="event-card-header">
                <h2 className="event-title">{event.title}</h2>
                <p className="event-date">{formatDate(event.dateTime)}</p>
              </div>

              <div className="event-card-body">
                <div className="event-location">
                  📍 {event.location}
                </div>

                {event.description && (
                  <p className="event-description">
                    {event.description.substring(0, 120)}
                    {event.description.length > 120 ? '...' : ''}
                  </p>
                )}

                <div className="event-card-footer">
                  <div>
                    <div className={`event-price ${event.price > 0 ? 'paid' : ''}`}>
                      {event.price > 0 ? `$${event.price}` : 'FREE'}
                    </div>
                  </div>
                  <div className="event-capacity">
                    {event.isSoldOut ? (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>SOLD OUT</span>
                    ) : (
                      <span>{event.spotsAvailable} spots left</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
