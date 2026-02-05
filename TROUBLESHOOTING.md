# 🔧 TROUBLESHOOTING GUIDE

## ✅ ISSUE FIXED: 401 Unauthorized Error

### Problem
You were getting `401 Unauthorized` errors when trying to access the dashboard because the app was trying to load protected routes before you logged in.

### Solution Applied
Updated `App.jsx` to:
1. Check for existing login token on app load
2. Show login page if not authenticated
3. Only render protected routes after successful login
4. Pass user data and logout function to Layout

### How It Works Now
1. **App loads** → Checks localStorage for token
2. **No token?** → Shows Login page
3. **Login successful** → Stores token & user data
4. **Token exists?** → Shows Dashboard and all pages
5. **Logout** → Clears token, shows Login page

---

## 🎯 CURRENT STATUS

### ✅ What's Fixed
- Authentication flow working
- Login page appears first
- Protected routes only accessible after login
- Token stored in localStorage
- User data passed to components
- Logout functionality working

### 🔄 What to Do Now

**Step 1: Refresh Your Browser**
- Press `Ctrl + Shift + R` (hard refresh)
- Or clear browser cache

**Step 2: You Should See**
- Login page (not dashboard)
- Email and password fields
- Default credentials displayed

**Step 3: Login**
```
Email: admin@interiordesign.com
Password: admin123
```

**Step 4: After Login**
- Dashboard loads with real data
- Sidebar shows your user info
- All sections accessible
- No more 401 errors!

---

## 🐛 Common Issues & Solutions

### Issue 1: Still Getting 401 Errors
**Solution:**
1. Clear browser localStorage:
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Local Storage"
   - Right-click → Clear
   - Refresh page

2. Make sure backend is running:
   ```bash
   cd Backend
   npm run dev
   ```

### Issue 2: Login Page Not Showing
**Solution:**
1. Check if Login.jsx exists:
   - Should be at: `Frontend/src/components/Login.jsx`
   
2. Check console for errors:
   - Press F12
   - Look for red errors
   - Share them if you see any

### Issue 3: "Cannot find module './components/Login'"
**Solution:**
The Login component should already be created. If not, let me know and I'll create it again.

### Issue 4: Login Button Not Working
**Solution:**
1. Check backend is running on port 5000
2. Check browser console for errors
3. Verify credentials:
   - Email: `admin@interiordesign.com`
   - Password: `admin123`

### Issue 5: Dashboard Shows 0 for Everything
**Solution:**
This is NORMAL! The database is empty. As you add:
- Clients
- Inventory items
- Tasks
- Quotations

The dashboard will automatically update with real numbers.

### Issue 6: "Network Error" or "Failed to Fetch"
**Solution:**
1. Backend not running:
   ```bash
   cd "c:\Users\mridu\OneDrive\Desktop\Ryphira\Interior Design\Backend"
   npm run dev
   ```

2. Wrong API URL:
   - Check `Frontend/.env` has: `VITE_API_URL=http://localhost:5000/api`

3. Port conflict:
   - Make sure nothing else is using port 5000

---

## 🔍 How to Debug

### Check if Backend is Running
Open: http://localhost:5000/health

**Should see:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Check if Token is Stored
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Local Storage"
4. Look for:
   - `token` (long string)
   - `user` (JSON object)

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for `/api/auth/login` request
5. Check response:
   - **200 OK** = Success
   - **401 Unauthorized** = Wrong credentials
   - **500 Error** = Backend issue

---

## ✅ Verification Steps

### 1. Test Login
- [ ] Login page appears
- [ ] Can enter email/password
- [ ] Click login button
- [ ] Redirects to dashboard
- [ ] No errors in console

### 2. Test Dashboard
- [ ] Dashboard loads
- [ ] Shows statistics (even if 0)
- [ ] No 401 errors
- [ ] User info in sidebar

### 3. Test Navigation
- [ ] Can click Clients
- [ ] Can click Inventory
- [ ] Can click Tasks
- [ ] All pages load without errors

### 4. Test CRUD Operations
- [ ] Can create a client
- [ ] Client appears in table
- [ ] Can edit client
- [ ] Can delete client
- [ ] Changes persist after refresh

### 5. Test Logout
- [ ] Click logout button
- [ ] Returns to login page
- [ ] Can't access dashboard without login
- [ ] Must login again to access

---

## 📊 Expected Behavior

### On First Load
1. App checks for token
2. No token found
3. Shows login page
4. Waits for user to login

### After Login
1. User enters credentials
2. Backend validates
3. Returns token + user data
4. Stores in localStorage
5. Shows dashboard
6. All API calls include token
7. No more 401 errors

### On Page Refresh
1. App checks localStorage
2. Finds token
3. Validates token is present
4. Shows dashboard immediately
5. No need to login again

### On Logout
1. Clears localStorage
2. Removes token
3. Removes user data
4. Shows login page
5. Blocks access to protected routes

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Login page appears first
- ✅ Can login with credentials
- ✅ Dashboard loads after login
- ✅ No 401 errors in console
- ✅ Can navigate all sections
- ✅ Can create/edit/delete data
- ✅ Logout returns to login page
- ✅ Page refresh keeps you logged in

---

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check both terminals are running:**
   - Backend on port 5000
   - Frontend on port 5173

2. **Clear everything and restart:**
   ```bash
   # Stop both servers (Ctrl+C)
   
   # Clear browser cache
   # Clear localStorage (DevTools → Application → Clear)
   
   # Restart backend
   cd Backend
   npm run dev
   
   # Restart frontend
   cd Frontend
   npm run dev
   
   # Open fresh browser tab
   http://localhost:5173
   ```

3. **Check the files exist:**
   - `Frontend/src/App.jsx` (updated with auth)
   - `Frontend/src/components/Login.jsx`
   - `Frontend/src/config/api.js`
   - `Frontend/.env`

---

**The 401 error is now fixed! Just refresh your browser and you should see the login page.** 🎉
