// Purpose: Create event form for attendees who want to host events
// On success, shows the secure scanner link for the event

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdEvent, setCreatedEvent] = useState<any>(null);
  const [scannerUrl, setScannerUrl] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    price: '0',
    capacity: '100',
    isPrivate: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth');
      return;
    }
    setAuthToken(token);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          capacity: parseInt(form.capacity) || 100,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const event = await response.json();
      setCreatedEvent(event);

      const scannerBase = process.env.NEXT_PUBLIC_SCANNER_URL || 'http://localhost:3002';
      setScannerUrl(`${scannerBase}/?token=${event.scannerToken}`);

      // Update stored user role to ORGANIZER
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...user, role: 'ORGANIZER' }));
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (createdEvent) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Event Created!</h1>
          <p className="page-subtitle">Your event is live. Share the scanner link with your check-in staff.</p>
        </div>

        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <h2 style={{ marginBottom: '0.5rem' }}>{createdEvent.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {new Date(createdEvent.dateTime).toLocaleString()} &mdash; {createdEvent.location}
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}>
              Secure Scanner Link
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1rem',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--primary)',
            }}>
              {scannerUrl}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              This link is tied exclusively to your event. Anyone with this link can scan tickets for this event only.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigator.clipboard.writeText(scannerUrl)}
            >
              Copy Scanner Link
            </button>
            <a href="/" className="btn btn-secondary">
              Back to Events
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Host an Event</h1>
        <p className="page-subtitle">Fill in your event details and get a secure scanner link</p>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Event Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Annual Tech Conference 2026"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tell attendees about your event"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dateTime">Date & Time *</label>
            <input
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              className="form-input"
              value={form.dateTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. 123 Main St, San Francisco, CA"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="price">Ticket Price ($)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                className="form-input"
                value={form.capacity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              id="isPrivate"
              name="isPrivate"
              type="checkbox"
              checked={form.isPrivate}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isPrivate" style={{ cursor: 'pointer', margin: 0 }}>
              Private event (invite-only)
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Creating Event...' : 'Create Event & Get Scanner Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
