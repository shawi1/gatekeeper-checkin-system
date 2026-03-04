// Requirements: FR-06, FR-07, FR-08 - Scanner with camera, validation, feedback
// Purpose: QR code scanner with real-time validation and color-coded feedback
// Links: See docs/requirements-traceability.md sections 3.1.6, 3.1.7, 3.1.8
// ⭐ KEY DEMO FILE

'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface ValidationResult {
  valid: boolean;
  color: 'green' | 'yellow' | 'red';
  message: string;
  reason?: string;
}

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/events/public`);
      const data = await response.json();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    }
  };

  const startScanning = async () => {
    try {
      if (!selectedEventId) {
        setError('Please select an event first');
        return;
      }

      // Request camera access (FR-06)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanningRef.current = true;
        setError('');
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera. Please grant camera permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    scanningRef.current = false;
  };

  // Requirement: FR-07 - Continuous QR code scanning
  const tick = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(tick);
      return;
    }

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data and scan for QR code
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // QR code detected! Validate it
      validateTicket(code.data);
      // Don't continue scanning while showing feedback
      return;
    }

    // Continue scanning
    if (scanningRef.current) {
      requestAnimationFrame(tick);
    }
  };

  /**
   * Validate scanned QR code ticket
   *
   * Requirements:
   * - FR-07: Send JWT to backend for validation
   * - FR-08: Display color-coded feedback
   */
  const validateTicket = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scanner/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          eventId: selectedEventId,
        }),
      });

      const result: ValidationResult = await response.json();

      // FR-08: Show color-coded feedback
      setValidationResult(result);

      // Play sound effect based on result
      playFeedbackSound(result.valid);

      // Auto-resume scanning after 3 seconds
      setTimeout(() => {
        setValidationResult(null);
        if (scanning) {
          requestAnimationFrame(tick);
        }
      }, 3000);

    } catch (err) {
      console.error('Validation error:', err);
      setValidationResult({
        valid: false,
        color: 'red',
        message: 'Network error - please try again',
      });

      setTimeout(() => {
        setValidationResult(null);
        if (scanning) {
          requestAnimationFrame(tick);
        }
      }, 3000);
    }
  };

  const playFeedbackSound = (success: boolean) => {
    // Create simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = success ? 800 : 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">QR Code Scanner</h1>
        <p className="page-subtitle">Scan tickets for instant check-in validation</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="event-selector">
        <label htmlFor="event-select">
          <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Active Event
          </span>
        </label>
        <select
          id="event-select"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          disabled={scanning}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} - {new Date(event.dateTime).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div className="scanner-container">
        <div className="video-container">
          <video ref={videoRef} className="scanner-video" playsInline />
          {scanning && <div className="scanner-overlay"></div>}
          <canvas ref={canvasRef} className="scanner-canvas" />
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!scanning ? (
            <button onClick={startScanning} className="btn btn-primary" style={{ minWidth: '200px' }}>
              🎯 Start Scanning
            </button>
          ) : (
            <button onClick={stopScanning} className="btn btn-secondary" style={{ minWidth: '200px' }}>
              ⏹ Stop Scanning
            </button>
          )}

          {selectedEventId && (
            <a href={`/dashboard/${selectedEventId}`} className="btn btn-secondary" style={{ minWidth: '200px' }}>
              📊 View Dashboard
            </a>
          )}
        </div>

        {scanning && (
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            animation: 'fadeIn 0.6s ease'
          }}>
            <p>Position the QR code within the frame</p>
            <p style={{ marginTop: '0.5rem', color: 'var(--primary)' }}>● Scanning active...</p>
          </div>
        )}
      </div>

      {/* FR-08: Color-coded validation feedback overlay */}
      {validationResult && (
        <div className={`validation-overlay ${validationResult.color}`}>
          <div className="validation-icon">
            {validationResult.color === 'green' && '✓'}
            {validationResult.color === 'yellow' && '⚠'}
            {validationResult.color === 'red' && '✗'}
          </div>
          <div className="validation-message">
            {validationResult.message}
          </div>
          {validationResult.reason && (
            <div style={{
              fontSize: '1.2rem',
              marginTop: '1rem',
              opacity: 0.9,
              animation: 'slideUp 0.5s ease 0.3s both'
            }}>
              {validationResult.reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
