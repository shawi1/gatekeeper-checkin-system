// Requirements: FR-04 - Ticket display with QR code
// Requirements: FR-05 - Status tracking badge
// Purpose: Display ticket details with QR code for scanning
// Links: See docs/requirements-traceability.md sections 3.1.4, 3.1.5
// ⭐ KEY DEMO FILE

'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

interface Ticket {
  id: string;
  jwtToken?: string;
  status: string;
  checkInTime?: string;
  event: {
    title: string;
    dateTime: string;
    location: string;
    description?: string;
  };
  user: {
    fullName: string;
    email: string;
  };
}

export default function TicketPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchTicket();
  }, []);

  useEffect(() => {
    if (ticket?.jwtToken && canvasRef.current) {
      generateQRCode(ticket.jwtToken);
    }
  }, [ticket]);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/tickets/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }

      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError('Failed to load ticket. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (jwtToken: string) => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, jwtToken, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
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
    return <div className="loading">Loading ticket...</div>;
  }

  if (error || !ticket) {
    return <div className="error-message">{error || 'Ticket not found'}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your Ticket</h1>
      </div>

      <div className="ticket-card">
        <div className="ticket-header">
          <h2>{ticket.event.title}</h2>
          <p>{formatDate(ticket.event.dateTime)}</p>
          <p>📍 {ticket.event.location}</p>
        </div>

        <div className="ticket-body">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span className={getStatusBadge(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>

            <div className="qr-container">
              {ticket.jwtToken ? (
                <>
                  <h3 style={{ marginBottom: '1rem' }}>Scan this QR code at the event</h3>
                  <canvas ref={canvasRef} className="qr-code" />
                  <p style={{ marginTop: '1rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
                    Present this QR code to the scanner at check-in
                  </p>
                </>
              ) : (
                <div className="error-message">
                  QR code not available. Please contact support.
                </div>
              )}
            </div>

            {ticket.checkInTime && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#d5f4e6', borderRadius: '8px' }}>
                <p style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  Checked in at {new Date(ticket.checkInTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #ecf0f1', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Ticket Holder</h3>
            <p><strong>Name:</strong> {ticket.user.fullName}</p>
            <p><strong>Email:</strong> {ticket.user.email}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => window.print()}
          className="btn btn-secondary"
          style={{ marginRight: '1rem' }}
        >
          Print Ticket
        </button>
        <button
          onClick={() => window.location.href = '/tickets'}
          className="btn btn-primary"
        >
          Back to My Tickets
        </button>
      </div>
    </div>
  );
}
