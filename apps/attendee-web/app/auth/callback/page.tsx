'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      router.push('/auth?error=' + error);
      return;
    }

    if (token) {
      // Fetch user data with the token
      fetchUserData(token);
    } else {
      router.push('/auth');
    }
  }, [searchParams, router]);

  const fetchUserData = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Store the token
      localStorage.setItem('authToken', token);

      // Decode the JWT to get user info (simple decode, not validation)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Fetch full user data
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Fallback to token payload
        localStorage.setItem('user', JSON.stringify({
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          fullName: payload.email.split('@')[0],
        }));
      }

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error processing auth callback:', error);
      router.push('/auth?error=processing_failed');
    }
  };

  return (
    <div className="loading">
      <h2>Completing sign in...</h2>
      <p>Please wait while we redirect you.</p>
    </div>
  );
}
