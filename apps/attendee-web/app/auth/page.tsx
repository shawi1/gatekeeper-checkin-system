'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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

  const handleGoogleAuth = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign up failed');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleButton = (
    <button
      onClick={handleGoogleAuth}
      className="btn"
      style={{
        width: '100%',
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
      {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
    </button>
  );

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
      {/* Tab toggle */}
      <div style={{
        display: 'flex',
        marginBottom: '2rem',
        borderRadius: 'var(--radius)',
        background: '#f1f3f4',
        padding: '4px',
      }}>
        <button
          onClick={() => { setMode('login'); setError(''); }}
          style={{
            flex: 1,
            padding: '0.625rem',
            border: 'none',
            borderRadius: 'calc(var(--radius) - 2px)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            background: mode === 'login' ? 'white' : 'transparent',
            color: mode === 'login' ? 'var(--primary)' : 'var(--gray-500)',
            boxShadow: mode === 'login' ? 'var(--shadow)' : 'none',
          }}
        >
          Log In
        </button>
        <button
          onClick={() => { setMode('signup'); setError(''); }}
          style={{
            flex: 1,
            padding: '0.625rem',
            border: 'none',
            borderRadius: 'calc(var(--radius) - 2px)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            background: mode === 'signup' ? 'white' : 'transparent',
            color: mode === 'signup' ? 'var(--primary)' : 'var(--gray-500)',
            boxShadow: mode === 'signup' ? 'var(--shadow)' : 'none',
          }}
        >
          Sign Up
        </button>
      </div>

      <h1 style={{
        fontSize: '1.75rem',
        marginBottom: '1.75rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: '800'
      }}>
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h1>

      {error && <div className="error-message">{error}</div>}

      {googleButton}

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

      {mode === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Logging in...' : 'Log In with Email'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
              Sign up
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 8 characters" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
              Log in
            </button>
          </p>
        </form>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Demo accounts:</p>
        <p style={{ fontSize: '0.85rem' }}>Organizer: organizer@example.com / password123</p>
        <p style={{ fontSize: '0.85rem' }}>Attendee: attendee@example.com / password123</p>
      </div>
    </div>
  );
}
