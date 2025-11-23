import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

export function Login() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email) {
      setLoginError('Email is required');
      return;
    }

    try {
      await login({
        email,
        name: name || email.split('@')[0],
        provider: 'email',
      });
      // Use window.location for hard navigation to ensure auth state is ready
      // This avoids race conditions with React Router's ProtectedRoute checks
      window.location.href = '/dashboard';
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'facebook' | 'microsoft') => {
    // TODO: Implement OAuth flow with Azure AD B2C
    // For now, show a message that OAuth is not yet configured
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth will be available after Azure AD B2C configuration (T074)`);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Quotes Admin Center</h1>
          <p>Sign in to manage quotes and users</p>
        </div>

        {(error || loginError) && (
          <div className="error-message">
            {error || loginError}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Name (optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="oauth-buttons">
          <button
            type="button"
            className="btn btn-google"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            className="btn btn-facebook"
            onClick={() => handleOAuthLogin('facebook')}
            disabled={isLoading}
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
            </svg>
            Sign in with Facebook
          </button>

          <button
            type="button"
            className="btn btn-microsoft"
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={isLoading}
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11.4,11.4H2V2h9.4ZM22,11.4H12.6V2H22ZM11.4,22H2V12.6h9.4ZM22,22H12.6V12.6H22Z"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>

        <div className="login-footer">
          <p className="text-muted">
            For testing: Use any email to sign in. OAuth providers require Azure AD B2C configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
