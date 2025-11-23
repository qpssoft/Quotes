# Root Admin User Guide

## Overview
The Quotes system now automatically creates a **root administrator account** on first startup. This account has full system privileges and is used for initial system configuration and user management.

## Root Admin Credentials

### Default Account
```
Email:    root@quotes.com
Name:     Root Administrator
Role:     Admin
Provider: system
```

### Permissions
The root admin has the following special claims:
- `IsRootAdmin`: true
- `CanManageUsers`: true
- `CanManageQuotes`: true
- `CanAccessAllFeatures`: true

## How to Login as Root Admin

### Option 1: Using Admin Portal (Recommended)

1. **Start the backend services:**
   ```powershell
   cd d:\Projects\Quotes\quotes-backend
   .\start-backend.ps1
   ```

2. **Open Admin Portal:**
   - URL: http://localhost:3000
   - The portal will load the login page

3. **Login with root credentials:**
   - Enter email: `root@quotes.com`
   - Click "Sign In with Email"
   - The system will automatically log you in with root admin privileges

4. **Verify admin access:**
   - Check the user menu - should show "Root Administrator"
   - You should have access to all admin features
   - Navigate to user management to see all users

### Option 2: Using API Directly (cURL)

```bash
# Login request
curl -X POST http://localhost:7071/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@quotes.com",
    "name": "Root Administrator",
    "provider": "system"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "abc123...",
  "expiresIn": 3600,
  "user": {
    "id": "guid-here",
    "email": "root@quotes.com",
    "name": "Root Administrator",
    "role": "Admin",
    "provider": "system",
    "profilePicture": null
  }
}
```

### Option 3: Using PowerShell

```powershell
# Login as root admin
$loginBody = @{
    email = "root@quotes.com"
    name = "Root Administrator"
    provider = "system"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:7071/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

# Display the access token
Write-Host "Access Token: $($response.accessToken)"
Write-Host "User: $($response.user.name) ($($response.user.role))"

# Use the token in subsequent requests
$headers = @{
    "Authorization" = "Bearer $($response.accessToken)"
    "Content-Type" = "application/json"
}

# Example: Get current user info
Invoke-RestMethod -Uri "http://localhost:7071/api/v1/users/me" `
    -Method GET `
    -Headers $headers
```

### Option 4: Using JavaScript/Fetch

```javascript
// Login as root admin
async function loginAsRootAdmin() {
    const response = await fetch('http://localhost:7071/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            email: 'root@quotes.com',
            name: 'Root Administrator',
            provider: 'system'
        })
    });

    const data = await response.json();
    console.log('Logged in as:', data.user.name);
    console.log('Role:', data.user.role);
    
    // Store token for subsequent requests
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
}

// Use the stored token
async function makeAuthenticatedRequest() {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('http://localhost:7071/api/v1/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });
    
    return await response.json();
}
```

## Default Test Users

In addition to the root admin, the system also creates these test users automatically:

| Email | Role | Purpose |
|-------|------|---------|
| `root@quotes.com` | Admin | Root administrator with full access |
| `admin@test.com` | Admin | Test admin account |
| `editor@test.com` | Contributor | Test contributor account |
| `user@test.com` | Authenticated | Test regular user account |

## Security Notes

### For Production Deployment

⚠️ **IMPORTANT**: Before deploying to production:

1. **Change or disable the default root account**
2. **Use a secure authentication provider** (Azure AD, OAuth, etc.)
3. **Remove test accounts** from initialization
4. **Implement proper password policies**
5. **Enable MFA for admin accounts**

### Modifying Root Admin Settings

To change the root admin email or other settings, edit:
```
src/Quotes.Infrastructure/Services/DatabaseInitializer.cs
```

```csharp
public const string RootAdminEmail = "root@quotes.com";  // Change this
public const string RootAdminName = "Root Administrator"; // Change this
public const string RootAdminRole = "Admin";              // Keep as Admin
```

## Troubleshooting

### Root Admin Not Created

**Check logs:**
```powershell
# View function logs for initialization messages
# Look for: "Root admin user created" or "Root admin user already exists"
```

**Manually verify in storage:**
```powershell
# Check Azurite blob storage
# Container: users
# File: users.json
```

**Force re-initialization:**
1. Stop all services
2. Delete `azurite-data` folder
3. Restart services with `.\start-backend.ps1`

### Login Failed

**Check API is running:**
```powershell
curl http://localhost:7071/api/health
```

**Check CORS:**
- Open browser console (F12)
- Look for CORS errors
- Ensure you're calling from `http://localhost:3000`

**Check request payload:**
```json
{
  "email": "root@quotes.com",
  "name": "Root Administrator",
  "provider": "system"
}
```

All three fields are required!

### Token Not Working

**Verify token in JWT debugger:**
- Copy the access token
- Go to https://jwt.io
- Paste token to decode
- Check the `role` claim is "Admin"
- Check the `email` claim is "root@quotes.com"

**Check token expiration:**
```javascript
const token = "your-token-here";
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

## Admin Features Access

Once logged in as root admin, you have access to:

### User Management
- View all users
- Create new users
- Edit user roles
- Deactivate/activate users
- Delete users

### Quote Management
- Approve submitted quotes
- Reject quotes with feedback
- Edit quote metadata
- Delete quotes
- Bulk operations

### System Configuration
- View system health
- Access analytics
- Manage categories
- Configure search settings

## API Endpoints Available to Admin

```
GET    /api/v1/users              - List all users
GET    /api/v1/users/me           - Current user info
POST   /api/v1/users              - Create user
PUT    /api/v1/users/{id}         - Update user
DELETE /api/v1/users/{id}         - Delete user

GET    /api/v1/quotes             - List quotes (all, including pending)
GET    /api/v1/quotes/{id}        - Get quote details
POST   /api/v1/quotes             - Create quote
PUT    /api/v1/quotes/{id}        - Update quote
DELETE /api/v1/quotes/{id}        - Delete quote
POST   /api/v1/quotes/{id}/approve - Approve quote
POST   /api/v1/quotes/{id}/reject  - Reject quote
```

## Next Steps

After logging in as root admin:

1. **Create additional admin users** with proper credentials
2. **Configure system settings** for your environment
3. **Test user flows** with different role levels
4. **Set up proper authentication** for production
5. **Configure email notifications** (SendGrid)
6. **Deploy to Azure** when ready

## Support

For issues or questions:
- Check logs in Azure Functions terminal
- Review `CORS_FIX_SUMMARY.md` for API access issues
- See `README.md` for general setup
- Check `TESTING.md` for test account details
