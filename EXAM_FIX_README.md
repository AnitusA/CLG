# Fix for Exam Creation Issue

## Problem
The exam creation is not working because the `exams` and `exam_subjects` tables don't exist in your Supabase database yet.

## Solution

### Option 1: Create Tables Manually (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the entire content from `create-exam-tables.sql` file
5. Paste it into the SQL Editor
6. Click **"Run"** to execute the SQL
7. You should see a success message
8. Now your exam creation will work!

### Option 2: Quick Test (Alternative)
If you want to test the functionality immediately, I can temporarily modify the code to use the existing `tests` table structure.

## Files Created
- `create-exam-tables.sql` - SQL to create the new exam tables
- `exam-schedules-migration.sql` - Complete migration with sample data
- `setup-exam-tables.js` - Node.js script to test table creation

## What Happens After Tables Are Created
Once you run the SQL in Supabase:
1. Two new tables will be created: `exams` and `exam_subjects`
2. Proper indexes and triggers will be set up
3. Row Level Security policies will be configured
4. Your exam creation form will work perfectly
5. You can create exams with multiple subjects and individual dates

## Testing
After creating the tables, you can test by:
1. Going to your app at `/admin/tests` (now called "Exam Schedules")
2. Clicking "Create Exam"
3. Entering an exam name (e.g., "Mid-term Examination")
4. Clicking "Create Exam"
5. Adding subjects with individual dates

Let me know if you need help with any of these steps!
