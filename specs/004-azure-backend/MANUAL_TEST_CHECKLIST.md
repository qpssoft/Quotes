# Manual Test Checklist - Phase 4 Authentication

**Date**: November 22, 2025
**Tester**: _______________
**Environment**: Local Development

---

## Test Environment Status

✅ **Backend Functions**: Running on `http://localhost:7071`
✅ **Admin Center**: Running on `http://localhost:3000`
✅ **Browser**: Opened automatically

---

## Test 1: Email Login Flow ⬜

**Objective**: Verify email-based authentication works end-to-end

### Steps:
1. ⬜ Admin Center should have opened in your browser at `http://localhost:3000`
2. ⬜ You should see the login page with:
   - Email input field
   - Name input field (optional)
   - "Sign in with Email" button
   - Three OAuth buttons (Google, Facebook, Microsoft)
3. ⬜ Enter the following:
   - **Email**: `admin@example.com`
   - **Name**: `Admin User` (or leave blank)
4. ⬜ Click **"Sign in with Email"** button
5. ⬜ Page should redirect to `/dashboard`
6. ⬜ Dashboard should display:
   - Welcome message with your name
   - User profile card showing:
     - User ID (UUID)
     - Email: admin@example.com
     - Name: Admin User (or "Not specified")
     - Role badge: "Authenticated" (blue), "Contributor" (green), or "Admin" (red)
     - Provider: email
     - Created date
     - Last login date
   - Stats grid (placeholder "Coming soon")
   - Info cards about Phase 4 completion

### Expected Result:
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ User profile displays correctly
- ❌ Login failed with error message

**Notes**: _______________________________________________

---

## Test 2: Token Storage Verification ⬜

**Objective**: Verify JWT tokens are stored in localStorage

### Steps:
1. ⬜ While on the dashboard, press `F12` to open DevTools
2. ⬜ Click **Application** tab (or **Storage** in Firefox)
3. ⬜ Expand **Local Storage** → `http://localhost:3000`
4. ⬜ Verify 3 items are present:
   - `quotes_access_token` - Should be a long JWT string (starts with "eyJ")
   - `quotes_refresh_token` - Should be a Base64 string
   - `quotes_user` - Should be a JSON object with id, email, name, role, provider
5. ⬜ Click on `quotes_access_token` and verify it's a JWT token
6. ⬜ Click on `quotes_user` and verify it shows your user data

### Expected Result:
- ✅ All 3 items present in localStorage
- ✅ Tokens are valid strings (not empty or null)
- ❌ Missing tokens or invalid data

**Access Token** (first 50 chars): _______________________________________________
**Refresh Token** (first 20 chars): _______________________________________________

---

## Test 3: Token Persistence (Page Refresh) ⬜

**Objective**: Verify user stays logged in after page refresh

### Steps:
1. ⬜ While on the dashboard, press `F5` or click browser refresh button
2. ⬜ Wait for page to reload
3. ⬜ Verify you are still on `/dashboard` (not redirected to login)
4. ⬜ Verify user profile still displays correctly
5. ⬜ Open DevTools → Application → Local Storage
6. ⬜ Verify tokens are still present

### Expected Result:
- ✅ User stays authenticated after refresh
- ✅ No redirect to login page
- ✅ Tokens persist in localStorage
- ❌ Logged out and redirected to login

**Notes**: _______________________________________________

---

## Test 4: Protected Routes ⬜

**Objective**: Verify unauthenticated users cannot access dashboard

### Steps:
1. ⬜ Open **DevTools** → **Application** → **Local Storage**
2. ⬜ Right-click on `http://localhost:3000` → **Clear**
3. ⬜ Verify all 3 items deleted (access_token, refresh_token, user)
4. ⬜ Try to navigate to `http://localhost:3000/dashboard` directly
5. ⬜ Verify you are redirected to `/login`
6. ⬜ Try to navigate to `http://localhost:3000/` (root)
7. ⬜ Verify you are redirected to `/dashboard`, then to `/login`

### Alternative Test (Incognito):
1. ⬜ Open a new **Incognito/Private** window
2. ⬜ Navigate to `http://localhost:3000/dashboard`
3. ⬜ Verify redirected to `/login`

### Expected Result:
- ✅ Unauthenticated access redirects to login
- ✅ Cannot bypass authentication by URL manipulation
- ❌ Can access dashboard without login

**Notes**: _______________________________________________

---

## Test 5: Logout Flow ⬜

**Objective**: Verify logout clears tokens and redirects to login

### Steps:
1. ⬜ Login successfully (see Test 1)
2. ⬜ On dashboard, locate the **"Logout"** button (usually top-right or in profile card)
3. ⬜ Click **"Logout"** button
4. ⬜ If a confirmation dialog appears, click **"OK"** or **"Confirm"**
5. ⬜ Verify you are redirected to `/login`
6. ⬜ Open **DevTools** → **Application** → **Local Storage**
7. ⬜ Verify all 3 items are deleted:
   - `quotes_access_token` ❌
   - `quotes_refresh_token` ❌
   - `quotes_user` ❌
8. ⬜ Try to navigate to `/dashboard` again
9. ⬜ Verify you are redirected back to `/login`

### Expected Result:
- ✅ Logout clears all tokens from localStorage
- ✅ Redirected to login page
- ✅ Cannot access dashboard after logout
- ❌ Tokens remain in localStorage after logout

**Notes**: _______________________________________________

---

## Test 6: OAuth Buttons (Placeholder) ⬜

**Objective**: Verify OAuth buttons show correct placeholder messages

### Steps:
1. ⬜ On the login page, click **"Sign in with Google"** button
2. ⬜ Verify an alert appears with message: "Google OAuth will be available after Azure AD B2C configuration (T074)"
3. ⬜ Click **OK** to dismiss
4. ⬜ Click **"Sign in with Facebook"** button
5. ⬜ Verify alert: "Facebook OAuth will be available after Azure AD B2C configuration (T074)"
6. ⬜ Click **OK** to dismiss
7. ⬜ Click **"Sign in with Microsoft"** button
8. ⬜ Verify alert: "Microsoft OAuth will be available after Azure AD B2C configuration (T074)"

### Expected Result:
- ✅ All OAuth buttons show placeholder alerts
- ✅ Alerts mention task T074 (Azure AD B2C)
- ✅ No errors or crashes
- ❌ OAuth buttons trigger actual OAuth flow (not expected yet)

**Notes**: _______________________________________________

---

## Test 7: API Error Handling ⬜

**Objective**: Verify frontend handles invalid tokens gracefully

### Steps:
1. ⬜ Login successfully
2. ⬜ Open **DevTools** → **Application** → **Local Storage**
3. ⬜ Click on `quotes_access_token`
4. ⬜ Change the value to: `invalid_token_123`
5. ⬜ Press **Enter** to save
6. ⬜ Refresh the page (`F5`)
7. ⬜ Observe the network requests in **DevTools** → **Network** tab
8. ⬜ Look for a request to `/auth/refresh`
9. ⬜ Verify behavior:
   - **Option A**: Token refresh succeeds → Dashboard loads
   - **Option B**: Token refresh fails → Redirected to login

### Expected Result:
- ✅ Invalid token triggers automatic refresh attempt
- ✅ If refresh fails, user is logged out
- ✅ No JavaScript errors in console
- ❌ Application crashes or shows blank page

**Observed Behavior**: _______________________________________________

---

## Test 8: Network Traffic Inspection ⬜

**Objective**: Verify correct API calls are made during authentication

### Steps:
1. ⬜ Clear localStorage and refresh to logout
2. ⬜ Open **DevTools** → **Network** tab
3. ⬜ Enable **"Preserve log"** checkbox
4. ⬜ Login with email: `test@example.com`, name: `Test User`
5. ⬜ Watch network requests and verify:
   - ⬜ **POST** to `http://localhost:7071/api/v1/auth/login`
     - Request body: `{"email":"test@example.com","name":"Test User","provider":"email"}`
     - Response: 200 OK with `accessToken`, `refreshToken`, `user` object
   - ⬜ **GET** to `http://localhost:7071/api/v1/users/me`
     - Request header: `Authorization: Bearer <token>`
     - Response: 200 OK with user profile
6. ⬜ Click logout
7. ⬜ Verify:
   - ⬜ **POST** to `http://localhost:7071/api/v1/auth/logout`
     - Request header: `Authorization: Bearer <token>`
     - Response: 200 OK

### Expected Result:
- ✅ All API calls return 200 OK
- ✅ JWT token included in Authorization header
- ✅ Response bodies contain expected data
- ❌ API calls fail with 401, 403, 500 errors

**Login Response Status**: _______________________________________________
**User Profile Response Status**: _______________________________________________
**Logout Response Status**: _______________________________________________

---

## Test 9: Multiple User Logins ⬜

**Objective**: Verify multiple users can login with different credentials

### Steps:
1. ⬜ Login with email: `user1@example.com`, name: `User One`
2. ⬜ Verify dashboard shows "User One"
3. ⬜ Note the User ID: _______________________________________________
4. ⬜ Logout
5. ⬜ Login with email: `user2@example.com`, name: `User Two`
6. ⬜ Verify dashboard shows "User Two"
7. ⬜ Note the User ID: _______________________________________________
8. ⬜ Verify User IDs are different (unique per user)
9. ⬜ Logout
10. ⬜ Login with first user again: `user1@example.com`
11. ⬜ Verify User ID matches the original: _______________________________________________

### Expected Result:
- ✅ Each email gets a unique User ID
- ✅ User ID persists across logins
- ✅ Dashboard displays correct user info for each login
- ❌ Users share the same User ID or wrong user displayed

**Notes**: _______________________________________________

---

## Test 10: Responsive Design ⬜

**Objective**: Verify UI works on different screen sizes

### Steps:
1. ⬜ On the login page, open **DevTools**
2. ⬜ Click the **"Toggle device toolbar"** icon (or press `Ctrl+Shift+M`)
3. ⬜ Test the following screen sizes:
   - ⬜ **Desktop**: 1920x1080 - Login form centered, OAuth buttons side-by-side
   - ⬜ **Tablet**: 768x1024 - Login form adapts, OAuth buttons stack if needed
   - ⬜ **Mobile**: 375x667 - Login form full-width, OAuth buttons stacked vertically
4. ⬜ Login and test dashboard on each screen size
5. ⬜ Verify all elements are visible and usable

### Expected Result:
- ✅ UI adapts to all screen sizes
- ✅ No horizontal scrolling required
- ✅ All buttons and inputs are accessible
- ❌ UI breaks or elements overlap on small screens

**Notes**: _______________________________________________

---

## Test 11: Browser Console Errors ⬜

**Objective**: Verify no JavaScript errors during normal flow

### Steps:
1. ⬜ Open **DevTools** → **Console** tab
2. ⬜ Clear the console (click trash icon)
3. ⬜ Perform the complete flow:
   - Navigate to login page
   - Login with email
   - View dashboard
   - Refresh page
   - Logout
4. ⬜ Check console for errors:
   - ⬜ **Red errors** (should be 0)
   - ⬜ **Yellow warnings** (acceptable if minor)
   - ⬜ **Blue info** (normal)

### Expected Result:
- ✅ Zero console errors during normal flow
- ✅ Minor warnings acceptable (e.g., dev mode, deprecation notices)
- ❌ Red errors indicating JavaScript failures

**Errors Found**: _______________________________________________

---

## Test 12: Backend Validation (PowerShell) ⬜

**Objective**: Verify backend API works independently of frontend

### Steps (Copy/Paste into PowerShell):

```powershell
# 1. Login
$loginBody = '{"email":"powershell-test@example.com","name":"PowerShell Tester","provider":"email"}'
$loginResponse = Invoke-WebRequest -Uri 'http://localhost:7071/api/v1/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing
$loginData = $loginResponse.Content | ConvertFrom-Json
$accessToken = $loginData.accessToken
$refreshToken = $loginData.refreshToken

Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "  User ID: $($loginData.user.Id)"
Write-Host "  Access Token: $($accessToken.Substring(0, 50))..."

# 2. Get user profile
$headers = @{ "Authorization" = "Bearer $accessToken" }
$meResponse = Invoke-WebRequest -Uri 'http://localhost:7071/api/v1/users/me' -Method GET -Headers $headers -UseBasicParsing
$meData = $meResponse.Content | ConvertFrom-Json

Write-Host "`n✓ User profile retrieved" -ForegroundColor Green
Write-Host "  Name: $($meData.Name)"
Write-Host "  Email: $($meData.Email)"

# 3. Logout
$logoutResponse = Invoke-WebRequest -Uri 'http://localhost:7071/api/v1/auth/logout' -Method POST -Headers $headers -UseBasicParsing
Write-Host "`n✓ Logout successful" -ForegroundColor Green
```

### Checkboxes:
- ⬜ Ran PowerShell commands
- ⬜ Login returned 200 OK with tokens
- ⬜ User profile retrieved successfully
- ⬜ Logout returned 200 OK
- ⬜ No errors in output

### Expected Result:
- ✅ All three operations succeed
- ✅ Tokens are valid JWT strings
- ❌ Any operation fails with error

**Output**: _______________________________________________

---

## Summary

**Total Tests**: 12
**Passed**: _____ / 12
**Failed**: _____ / 12
**Blocked**: _____ / 12

### Critical Issues Found:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Minor Issues Found:
1. _______________________________________________
2. _______________________________________________

### Recommendations:
- ⬜ All tests passed → **Phase 4 frontend implementation complete!**
- ⬜ Minor issues only → Document and continue to Phase 5
- ⬜ Critical issues found → Fix before proceeding

---

## Next Steps

**If all tests pass**:
1. ✅ Mark Test 1 task complete in todo list
2. ✅ Commit test checklist results
3. ✅ Proceed with Phase 4 completion:
   - Deploy to Azure (T001-T008, T030-T031)
   - Configure Azure AD B2C (T074)
   - Test OAuth flows (T086-T091)

**If tests fail**:
1. ❌ Document failures in this checklist
2. ❌ Create GitHub issues for bugs
3. ❌ Fix issues before deployment

---

**Test Completed By**: _______________________________________________
**Date**: _______________________________________________
**Time**: _______________________________________________
**Notes**: _______________________________________________
