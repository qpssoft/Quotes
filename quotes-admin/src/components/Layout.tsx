import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.Role === 'Admin';
  const isContributor = user.Role === 'Contributor' || user.Role === 'Admin';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Quotes Admin</h2>
          <div className="user-badge">
            <div className="user-avatar">
              {user.Name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-sidebar">
              <div className="user-name-sidebar">{user.Name}</div>
              <div className={`role-badge-sidebar role-${user.Role.toLowerCase()}`}>
                {user.Role}
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/dashboard')}`}
            onClick={() => navigate('/dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </button>

          {isAdmin && (
            <>
              <button
                className={`nav-item ${isActive('/quotes')}`}
                onClick={() => navigate('/quotes')}
              >
                <span className="nav-icon">💬</span>
                <span className="nav-label">Quotes</span>
              </button>

              <button
                className={`nav-item ${isActive('/users')}`}
                onClick={() => navigate('/users')}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-label">Users</span>
              </button>

              <button
                className={`nav-item ${isActive('/submissions')}`}
                onClick={() => navigate('/submissions')}
              >
                <span className="nav-icon">✉️</span>
                <span className="nav-label">Submissions</span>
              </button>
            </>
          )}

          {isContributor && !isAdmin && (
            <button
              className={`nav-item ${isActive('/my-quotes')}`}
              onClick={() => navigate('/my-quotes')}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-label">My Quotes</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-content">
            <h1 className="page-title">
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/quotes' && 'Quotes Management'}
              {location.pathname === '/users' && 'User Management'}
              {location.pathname === '/submissions' && 'Quote Submissions'}
              {location.pathname === '/my-quotes' && 'My Quotes'}
            </h1>
            <div className="topbar-actions">
              <span className="user-email-topbar">{user.Email}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
