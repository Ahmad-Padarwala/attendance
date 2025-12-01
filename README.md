# Staff Attendance System

A modern, web-based staff attendance system with location tracking built using Next.js, TypeScript, Prisma, and MySQL.

## Features

### Admin Features
- **Admin Login** - Secure authentication for administrators
- **Staff Management** - Create, view, and delete staff members
- **Configure Staff** - Set salary, working days, and office hours for each staff member

### Staff Features
- **Staff Login** - Secure authentication for staff members
- **Punch In/Out** - Clock in and out with automatic location capture
- **Lunch Breaks** - Track lunch break start and end times with location
- **Monthly Calendar** - View attendance history with working hours
- **Real-time Status** - See current attendance status (Punched In, On Lunch, etc.)

### Technical Features
- **Location Tracking** - Captures GPS coordinates for all punch actions
- **Working Hours Calculation** - Automatically calculates working hours (excluding lunch breaks)
- **MySQL Database** - Reliable data storage
- **Responsive Design** - Works on desktop and mobile browsers
- **Type-safe** - Built with TypeScript for better code quality

## Tech Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- MySQL 8+ installed and running
- npm or yarn package manager

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a MySQL database:

```sql
CREATE DATABASE attendance_db;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://root:your_password@localhost:3306/attendance_db"

# JWT Secret (change this to a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Replace `root` and `your_password` with your MySQL credentials.

### 4. Setup Database Schema

```bash
npm run prisma:generate
npm run prisma:push
```

### 5. Seed Database (Create Admin User)

```bash
npx tsx scripts/seed.ts
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Sample staff user: `staff@example.com` / `staff123`

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Usage Guide

### For Administrators

1. **Login** - Go to http://localhost:3000 and login with admin credentials
2. **Create Staff** - Click "Add New Staff" button
3. **Fill Details**:
   - Full Name
   - Email (will be used for staff login)
   - Password (staff will use this to login)
   - Salary
   - Working Days (select multiple days)
   - Office Time In/Out

### For Staff

1. **Login** - Go to http://localhost:3000 and login with staff credentials
2. **View Dashboard** - See monthly attendance calendar and today's status
3. **Punch In** - Click "Punch In" button (location will be captured)
4. **Lunch Break**:
   - Click "Start Lunch" to begin lunch break
   - Click "End Lunch Break" to resume work
5. **Punch Out** - Click "Punch Out" to end the day
6. **View History** - Select different months to view past attendance

## Database Schema

### Users Table
- id, email, password, role (ADMIN/STAFF)

### Staff Profiles Table
- userId, fullName, salary, workingDays, officeTimeIn, officeTimeOut

### Attendance Records Table
- userId, punchInTime, punchInLat, punchInLng, punchOutTime, punchOutLat, punchOutLng, workingHours, date

### Lunch Breaks Table
- userId, attendanceRecordId, lunchStartTime, lunchStartLat, lunchStartLng, lunchEndTime, lunchEndLat, lunchEndLng, duration

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/staff` - Get all staff
- `POST /api/admin/staff` - Create staff
- `GET /api/admin/staff/[id]` - Get staff by ID
- `PUT /api/admin/staff/[id]` - Update staff
- `DELETE /api/admin/staff/[id]` - Delete staff

### Staff
- `POST /api/staff/punch-in` - Punch in
- `POST /api/staff/punch-out` - Punch out
- `POST /api/staff/lunch-start` - Start lunch break
- `POST /api/staff/lunch-end` - End lunch break
- `GET /api/staff/attendance` - Get attendance records

## Project Structure

```
attendance/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin pages
│   ├── staff/            # Staff pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Login page
├── components/           # Reusable components
├── lib/                  # Utilities (auth, prisma, location)
├── prisma/               # Database schema
├── scripts/              # Setup scripts
└── utils/                # Helper functions
```

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check database credentials in `.env`
- Verify database `attendance_db` exists

### Location Not Working
- Make sure you're using HTTPS in production (or localhost for development)
- Grant location permissions in your browser
- Check browser console for errors

### Prisma Errors
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npm run prisma:studio
```

## Security Notes

⚠️ **Important for Production:**
1. Change `JWT_SECRET` to a strong random string
2. Use HTTPS
3. Set strong passwords for admin users
4. Configure CORS properly
5. Enable MySQL SSL connections
6. Set up proper environment variables

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.

