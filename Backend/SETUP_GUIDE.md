# 🚀 Backend Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd "c:\Users\mridu\OneDrive\Desktop\Interior Design\Interior Design\Backend"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- helmet
- and more...

### 3. Configure Environment Variables

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Then edit `.env` with your settings:

```env
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/interior_design_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If MongoDB is installed as a service, it should already be running
# Otherwise, start it manually:
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Seed the Database (Optional but Recommended)

This creates initial admin users:

```bash
node seed.js
```

You'll see output like:
```
✅ Super Admin created: admin@ryphira.com
✅ 3 additional users created

📋 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Super Admin:
  Email: admin@ryphira.com
  Password: admin123
...
```

### 6. Start the Server

**Development Mode (with auto-restart):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: interior_design_db
🚀 Server running in development mode on port 5000
📍 API available at http://localhost:5000/api
```

## 🧪 Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-04T..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@interiordesign.com\",\"password\":\"admin123\"}"
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "...",
    "fullName": "Super Admin",
    "email": "admin@interiordesign.com",
    "role": "Super Admin"
  }
}
```

**Save the token!** You'll need it for authenticated requests.

### 3. Test Protected Route

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 Connect Frontend

Update your frontend API configuration to point to:
```
http://localhost:5000/api
```

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. Make sure MongoDB is running
2. Check your `MONGODB_URI` in `.env`
3. Try: `mongod --dbpath /path/to/data`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### JWT Token Errors

**Error:** `Invalid or expired token`

**Solution:**
1. Make sure you're sending the token in the header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```
2. Check that `JWT_SECRET` in `.env` hasn't changed
3. Login again to get a fresh token

### CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:**
1. Update `CORS_ORIGIN` in `.env` to match your frontend URL
2. Restart the server

## 📊 Database Management

### View Database

Use MongoDB Compass (GUI) or mongo shell:

```bash
mongo
use interior_design_db
db.users.find().pretty()
```

### Reset Database

```bash
mongo
use interior_design_db
db.dropDatabase()
```

Then run `node seed.js` again.

## 🔐 Security Checklist for Production

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use a secure MongoDB connection string (MongoDB Atlas)
- [ ] Enable HTTPS
- [ ] Set appropriate CORS origins
- [ ] Review rate limiting settings
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific `.env` files
- [ ] Never commit `.env` to version control

## 📚 API Documentation

All endpoints are documented in `README.md`.

Quick reference:
- **Auth**: `/api/auth/*`
- **Clients**: `/api/clients/*`
- **Quotations**: `/api/quotations/*`
- **Inventory**: `/api/inventory/*`
- **Purchase Orders**: `/api/purchase-orders/*`
- **Tasks**: `/api/tasks/*`
- **Invoices**: `/api/invoices/*`
- **Reports**: `/api/reports/*`

## 🎯 Next Steps

1. ✅ Backend is running
2. Test all endpoints with Postman or similar
3. Connect your frontend
4. Start building features!

## 💡 Tips

- Use **Postman** or **Insomnia** for API testing
- Install **MongoDB Compass** for database visualization
- Use **nodemon** for development (already configured)
- Check server logs for debugging

## 📞 Need Help?

Common issues and solutions are in the Troubleshooting section above.

---

**Happy Coding! 🎉**
