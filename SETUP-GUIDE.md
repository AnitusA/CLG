# CLG Admin Dashboard - Complete Setup Guide

## 🚀 **STEP-BY-STEP RUNNING INSTRUCTIONS**

### **Step 1: Complete Database Reset & Setup**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your CLG project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the Complete Reset Script**
   - Copy ALL content from `database-reset-and-setup.sql`
   - Paste it in the Supabase SQL Editor
   - Click "Run" (this will take a few seconds)
   - You should see: "Database setup completed successfully!"

### **Step 2: Update Environment Variables**

Update your `.env` file with your actual Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SESSION_SECRET=your-super-secret-session-key-make-it-long-and-random
```

### **Step 3: Install and Run**

Open PowerShell/Command Prompt in your project folder:

```powershell
# Navigate to your project
cd "e:\class\CLG"

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### **Step 4: Access Your Admin Dashboard**

1. Open browser: http://localhost:3000
2. Navigate to: http://localhost:3000/admin
3. All 9 admin features will be available:
   - 📝 Assignments
   - 📅 Record Ending Date (Deadlines)
   - 📚 Daily Homework
   - 📢 Daily Updates
   - 📋 Notes
   - 📊 Test Updates
   - 📖 Syllabus
   - 🎉 Birthday Dates
   - 🎓 Seminars

## ✅ **What's Fixed:**

1. **Database Schema**: Complete reset with proper column names
2. **All Tables**: 10 tables with consistent structure
3. **Indexes**: Optimized for performance
4. **Triggers**: Automatic timestamp updates
5. **Security**: Row Level Security enabled
6. **Admin Pages**: All 9 features working with proper database integration

## 🔧 **Troubleshooting:**

If you get any errors:
1. Make sure your .env file has correct Supabase credentials
2. Verify the database reset script ran successfully
3. Check that all npm dependencies are installed
4. Ensure you're using Node.js version 20+

## 📊 **Database Tables Created:**

- `students` - User authentication
- `assignments` - Academic assignments
- `deadlines` - Important deadlines
- `homework` - Daily homework tracking
- `daily_updates` - Announcements
- `notes` - Study materials
- `tests` - Exam scheduling
- `syllabus` - Course content
- `birthdays` - Birthday calendar
- `seminars` - Event management

Your CLG Admin Dashboard is now ready to run! 🎉
