# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1️⃣ Install Dependencies (Already Done ✓)
```bash
npm install
```

### 2️⃣ Configure MySQL Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```
Then run:
```sql
CREATE DATABASE attendance_db;
EXIT;
```

**Option B: Using MySQL Workbench or phpMyAdmin**
- Create a new database named `attendance_db`

### 3️⃣ Update Database Connection

Edit `.env` file (create it if doesn't exist):

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/attendance_db"
JWT_SECRET="attendance-secret-key-2024-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL password.

### 4️⃣ Generate Prisma Client & Push Schema

```bash
npm run prisma:generate
npm run prisma:push
```

This will create all the database tables.

### 5️⃣ Seed Database (Create Admin User)

```bash
npm run seed
```

This creates:
- **Admin**: admin@example.com / admin123
- **Sample Staff**: staff@example.com / staff123

### 6️⃣ Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Default Login Credentials

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### Sample Staff Account
- **Email**: staff@example.com
- **Password**: staff123

## Common Issues & Solutions

### ❌ "Error: P1001: Can't reach database server"
**Solution**: Make sure MySQL is running
```bash
# macOS
brew services start mysql

# Linux
sudo service mysql start

# Windows
# Start MySQL from Services
```

### ❌ "Access denied for user"
**Solution**: Check your MySQL username and password in `.env` file

### ❌ Prisma errors
**Solution**: Regenerate Prisma client
```bash
npm run prisma:generate
```

### ❌ Location not working
**Solution**: 
- Allow location permissions in your browser
- Use HTTPS in production (HTTP works on localhost)

## Next Steps

1. **Login as Admin** → Create staff members
2. **Login as Staff** → Test punch in/out and lunch breaks
3. **View Calendar** → Check monthly attendance
4. **Customize** → Modify working days, office hours, etc.

## Project Structure

```
attendance/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── auth/         # Login, logout
│   │   ├── admin/        # Staff management
│   │   └── staff/        # Attendance operations
│   ├── admin/            # Admin dashboard
│   │   └── staff/        # Staff management page
│   ├── staff/            # Staff dashboard
│   │   └── dashboard/    # Staff attendance page
│   └── page.tsx          # Login page
├── components/           # React components
├── lib/                  # Utilities (auth, prisma)
├── prisma/               # Database schema
└── scripts/              # Setup scripts
```

## Useful Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm start                   # Start production server

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:push         # Push schema to database
npm run prisma:studio       # Open Prisma Studio (DB GUI)
npm run seed                # Seed database

# View Database
npm run prisma:studio       # Opens at http://localhost:5555
```

## Features Overview

### 👨‍💼 Admin Features
- ✅ Create staff with custom settings
- ✅ Set salary, working days, office hours
- ✅ View and delete staff members
- ✅ Generate staff login credentials

### 👨‍💻 Staff Features
- ✅ Punch In with location
- ✅ Punch Out with location
- ✅ Start/End Lunch Break with location
- ✅ View monthly attendance calendar
- ✅ See working hours calculation
- ✅ Real-time status display

### 🔒 Security Features
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Secure HTTP-only cookies

## Need Help?

Check the main README.md for detailed documentation!

