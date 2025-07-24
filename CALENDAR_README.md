# 📅 Academic Calendar Feature

## Overview
The Academic Calendar is a comprehensive calendar system that displays all important dates from various sections of the college management system in a unified view. It excludes daily homework to focus on major academic events and deadlines.

## Features

### ✨ **What's Included in Calendar:**
- 🎪 **Events** - College events and activities
- 📝 **Tests/Exams** - Examination schedules
- 📋 **Assignments** - Major assignments (excluding daily homework)
- 🎤 **Seminars** - Scheduled seminars and talks
- ⏰ **Deadlines** - Important deadlines

### 🚫 **What's Excluded:**
- Daily homework assignments (to reduce clutter)
- Regular class schedules

## User Interfaces

### Admin Calendar (`/admin/calendar`)
- **Full Management View**: Complete overview of all academic events
- **Interactive Calendar Grid**: Month view with color-coded events
- **Event Details Panel**: Click on dates to see detailed event information
- **Legend**: Color-coded legend for different event types
- **Navigation**: Month navigation with "Today" button
- **Statistics**: Quick stats showing event counts by type

### Student Calendar (`/student/calendar`)
- **Student View**: Same calendar functionality optimized for students
- **Upcoming Events**: Shows next 7 days of events in sidebar
- **Read-Only Access**: Students can view but not modify events
- **Event Details**: Full details when clicking on calendar dates

## Color Coding System

| Event Type | Color | Icon |
|------------|-------|------|
| Events | Cyan (`bg-cyan-500`) | 🎪 |
| Tests/Exams | Red (`bg-red-500`) | 📝 |
| Assignments | Orange (`bg-orange-500`) | 📋 |
| Seminars | Purple (`bg-purple-500`) | 🎤 |
| Deadlines | Rose (`bg-rose-600`) | ⏰ |

## Technical Implementation

### Database Integration
The calendar pulls data from multiple tables:
- `events` table - College events
- `exam_schedules` table - Test and exam dates
- `assignments` table - Major assignments (excluding type='daily_homework')
- `seminars` table - Seminar schedules
- `deadlines` table - Important deadlines

### Data Flow
1. **Loader Function**: Fetches data from all relevant tables
2. **Data Aggregation**: Combines all events into unified CalendarEvent format
3. **Date Processing**: Converts all dates to consistent format
4. **Sorting**: Events sorted chronologically
5. **Filtering**: Daily homework excluded automatically

### Calendar Grid Logic
- **Month View**: Shows 6 weeks (42 days) to accommodate all month layouts
- **Day Calculation**: Proper handling of month boundaries and leap years
- **Event Display**: Up to 2 events shown per day, with "+X more" indicator
- **Interactive**: Click to select dates and view all events for that day

## Setup Instructions

### Prerequisites
The calendar depends on data from other sections:
1. Events section must be set up
2. Tests/Exams section must be configured
3. Assignments section must be available
4. Seminars section should be created
5. Deadlines section should be established

### Database Setup
No additional database tables needed - the calendar uses existing tables from other features.

### Integration
The calendar is automatically integrated into both admin and student dashboards with navigation cards.

## Usage Guide

### For Administrators
1. **Access**: Navigate to Admin Dashboard → Calendar
2. **View Events**: Browse months using navigation arrows
3. **Event Details**: Click any date to see all events for that day
4. **Today Navigation**: Click "Today" button to jump to current date
5. **Legend Reference**: Use color legend to identify event types

### For Students
1. **Access**: Navigate to Student Dashboard → Calendar
2. **View Schedule**: Browse academic calendar to plan ahead
3. **Upcoming Events**: Check sidebar for next week's events
4. **Event Details**: Click dates to see full event information
5. **Planning**: Use calendar for academic planning and preparation

## Features in Detail

### Interactive Calendar Grid
- **Month Navigation**: Smooth transitions between months
- **Today Highlighting**: Current date highlighted with blue ring
- **Event Indicators**: Color-coded event blocks on calendar days
- **Hover Effects**: Visual feedback on interactive elements
- **Responsive Design**: Works on desktop, tablet, and mobile

### Event Display System
- **Compact View**: Shows event icons and truncated titles
- **Overflow Handling**: "+X more" indicator for days with many events
- **Color Coordination**: Consistent color scheme across all views
- **Type Identification**: Icons help quickly identify event types

### Sidebar Information
- **Upcoming Events**: Next 7 days of events in chronological order
- **Selected Date Details**: Full information for clicked dates
- **Legend**: Color and icon reference guide
- **Statistics**: Count of different event types (admin only)

## Benefits

### For Students
- **Centralized View**: All important dates in one place
- **Better Planning**: Helps with time management and preparation
- **Visual Organization**: Color coding makes it easy to identify event types
- **Mobile Friendly**: Access calendar information anywhere

### For Administrators
- **Overview Management**: See all academic activities at a glance
- **Conflict Detection**: Identify scheduling conflicts easily
- **Event Tracking**: Monitor different types of academic events
- **Planning Tool**: Helps with academic calendar management

## Future Enhancements

Potential improvements:
- **Event Filtering**: Filter by event type
- **Print View**: Printable calendar format
- **Export Options**: Export calendar to external applications
- **Notification Integration**: Reminders for upcoming events
- **Year View**: Annual calendar overview
- **Event Search**: Search functionality for specific events

## Troubleshooting

### Calendar Not Loading
- Ensure database tables from other sections are created
- Check that each section (Events, Tests, etc.) is properly set up
- Verify database connection in Supabase

### Missing Events
- Confirm that events are being created in their respective sections
- Check that event dates are properly formatted
- Verify that daily homework is correctly tagged (should be excluded)

### Navigation Issues
- Refresh the page if month navigation is not working
- Clear browser cache if calendar appears stuck
- Check browser console for any JavaScript errors

The Academic Calendar provides a comprehensive, user-friendly way to view and manage all important academic dates in one unified interface.
