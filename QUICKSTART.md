# ⚡ Quick Start Guide

Get your Staff Attendance System running in 5 minutes!

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ MySQL 8+ installed and running
- ✅ npm installed

## 🚀 Setup Steps

### 1. Create MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE attendance_db;
EXIT;
```

### 2. Configure Environment

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` and update your MySQL password:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/attendance_db"
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:push

# Create admin user
npm run seed
```

### 4. Start Application

```bash
npm run dev
```

Open http://localhost:3000

## 🔐 Login Credentials

**Admin Account**
- Email: `admin@example.com`
- Password: `admin123`

**Sample Staff Account**
- Email: `staff@example.com`
- Password: `staff123`

## ✨ What's Next?

1. **Login as Admin** - Create new staff members
2. **Login as Staff** - Test punch in/out functionality
3. **Explore** - Check out the monthly calendar view

## 🎯 Key Features

### For Admin:
- Create staff with email/password
- Set working days (Mon-Sun)
- Define office hours
- Set salary

### For Staff:
- Punch In (captures location)
- Punch Out (captures location)
- Start Lunch Break
- End Lunch Break
- View monthly attendance calendar
- See working hours automatically calculated

## 🐛 Troubleshooting

**Can't connect to database?**
```bash
# Check if MySQL is running
sudo service mysql status  # Linux
brew services list         # macOS
```

**Prisma errors?**
```bash
npm run prisma:generate
npm run prisma:push
```

**Port 3000 already in use?**
```bash
# Change port
npm run dev -- -p 3001
```

## 📚 Full Documentation

See `README.md` for complete documentation including:
- API endpoints
- Database schema
- Security notes
- Production deployment

## 🆘 Need Help?

Check `SETUP.md` for detailed troubleshooting guide!

