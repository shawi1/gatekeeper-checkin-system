'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'oauth_failed': 'Google sign in failed. Please try again.',
        'no_user': 'Failed to get user information.',
        'callback_failed': 'Authentication callback failed.',
        'processing_failed': 'Failed to process authentication.',
      };
      setError(errorMessages[errorParam] || 'An error occurred during sign in.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '4rem auto',
      padding: '3rem',
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      animation: 'fadeInUp 0.6s ease'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: '800'
      }}>Welcome Back</h1>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button
        onClick={handleGoogleLogin}
        className="btn"
        style={{
          width: '100%',
          marginBottom: '1.5rem',
          background: 'white',
          color: '#444',
          border: '2px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontSize: '1rem',
          padding: '0.875rem',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '1.5rem 0',
        color: '#7f8c8d',
      }}>
        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
        <span style={{ padding: '0 1rem', fontSize: '0.9rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Login with Email'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Demo accounts:</p>
        <p style={{ fontSize: '0.85rem' }}>Organizer: organizer@example.com / password123</p>
        <p style={{ fontSize: '0.85rem' }}>Attendee: attendee@example.com / password123</p>
      </div>
    </div>
  );
}
