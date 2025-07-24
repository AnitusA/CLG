# Events Management System

## Overview
The Events Management system allows administrators to create, manage, and track college events with detailed information including event names, dates, and descriptions.

## Features

### ✨ Event Management
- **Create Events**: Add new events with name, date, and description
- **Event Status Tracking**: Track events as upcoming, ongoing, completed, or cancelled
- **Event Details**: Rich descriptions for each event
- **Date Management**: Schedule events with specific dates

### 📊 Dashboard Statistics
- **Upcoming Events**: Count of future events
- **Total Events**: Total number of events in the system
- **Completed Events**: Count of finished events
- **Past Events**: Historical event tracking

### 🎯 Event Operations
- **Status Updates**: Mark events as completed
- **Event Deletion**: Remove events with confirmation
- **Event Listing**: View all events in a organized grid layout
- **Real-time Updates**: Instant updates after any changes

## Database Schema

### Events Table
```sql
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_events_event_date`: For efficient date-based queries
- `idx_events_status`: For status filtering
- `idx_events_created_at`: For chronological ordering

## Setup Instructions

### 1. Database Setup
Run the SQL from `create-events-table.sql` in your Supabase SQL Editor:

```sql
-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Enable RLS and create policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for service role" ON events
    FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT ALL ON events TO service_role;
```

### 2. Testing
Run the test script to verify everything is working:
```bash
node test-events-table.js
```

### 3. Access the Feature
Navigate to `/admin/events` in your application to start managing events.

## Usage Examples

### Creating an Event
1. Click "Create Event" button
2. Fill in:
   - **Event Name**: e.g., "Annual Day Celebration"
   - **Event Date**: Select the event date
   - **Description**: Detailed description of the event
3. Click "Create Event" to save

### Managing Events
- **Mark as Completed**: Click the green checkmark icon
- **Delete Event**: Click the red trash icon (with confirmation)
- **View Details**: All event information is displayed in the card layout

### Event Status Flow
- **Upcoming**: New events (default status)
- **Ongoing**: Events currently happening
- **Completed**: Finished events
- **Cancelled**: Cancelled events

## Sample Events
The system comes with sample events:
- Annual Day Celebration
- Tech Fest 2025
- Sports Meet
- Cultural Night

## File Structure
```
├── app/routes/admin.events.tsx    # Main events management page
├── create-events-table.sql        # Database setup SQL
├── test-events-table.js          # Testing script
└── database-reset-and-setup.sql  # Updated with events table
```

## Color Theme
The Events section uses a **cyan/blue** color scheme:
- Primary: Cyan (for buttons and highlights)
- Secondary: Blue (for icons and accents)
- Status indicators: Color-coded for different event states

## Integration
The Events feature is fully integrated with:
- Admin dashboard navigation
- Consistent UI/UX with other admin features
- Database security and Row Level Security (RLS)
- Error handling and user feedback

## Future Enhancements
Potential features for future versions:
- Event categories/tags
- Event location tracking
- Participant management
- Event notifications
- Calendar integration
- Event image uploads
