import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import './Dashboard.css';

export function Dashboard() {
  const { user, refreshUser, isLoading } = useAuth();

  useEffect(() => {
    // Refresh user data on mount
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <Layout>
      <div className="welcome-section">
        <h2>Welcome back, {user.Name}!</h2>
        <p>You're logged in as <strong>{user.Role}</strong></p>
      </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Total Quotes</div>
              <div className="stat-value">Coming Soon</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">Coming Soon</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✉️</div>
            <div className="stat-content">
              <div className="stat-label">Pending Submissions</div>
              <div className="stat-value">Coming Soon</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">API Requests Today</div>
              <div className="stat-value">Coming Soon</div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>✅ Phase 4 Authentication Complete</h3>
            <ul>
              <li>JWT authentication with refresh tokens</li>
              <li>Email login functional</li>
              <li>Token validation and automatic refresh</li>
              <li>Role-based access control (RBAC)</li>
              <li>Application Insights telemetry</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🚧 Next Steps</h3>
            <ul>
              <li><strong>T074:</strong> Configure Azure AD B2C for OAuth providers</li>
              <li><strong>T086-T091:</strong> Test OAuth flows (Google, Facebook, Microsoft)</li>
              <li><strong>Phase 5:</strong> Client data synchronization</li>
              <li><strong>Phase 6:</strong> User quote submission management</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🔧 Admin Features (Coming Soon)</h3>
            <ul>
              <li>Quote management (approve, reject, edit, delete)</li>
              <li>User management (roles, banning)</li>
              <li>Submission moderation</li>
              <li>Analytics dashboard</li>
            </ul>
          </div>
        </div>

        <div className="user-profile-section">
          <h3>Your Profile</h3>
          <div className="profile-details">
            <div className="profile-row">
              <span className="profile-label">User ID:</span>
              <span className="profile-value">{user.Id}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.Email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Name:</span>
              <span className="profile-value">{user.Name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Provider:</span>
              <span className="profile-value">{user.Provider}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role:</span>
              <span className="profile-value">{user.Role}</span>
            </div>
            {user.CreatedAt && (
              <div className="profile-row">
                <span className="profile-label">Member Since:</span>
                <span className="profile-value">
                  {new Date(user.CreatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {user.LastLogin && (
              <div className="profile-row">
                <span className="profile-label">Last Login:</span>
                <span className="profile-value">
                  {new Date(user.LastLogin).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
}

