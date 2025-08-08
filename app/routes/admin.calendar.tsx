import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useState } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Calendar View - Admin Dashboard' }];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'event' | 'test' | 'assignment' | 'seminar' | 'deadline';
  description?: string;
  status?: string;
  priority?: string;
  color: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const calendarEvents: CalendarEvent[] = [];

  try {
    // Fetch Events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (events) {
      events.forEach(event => {
        calendarEvents.push({
          id: `event-${event.id}`,
          title: event.event_name,
          date: event.event_date,
          type: 'event',
          description: event.description,
          status: event.status,
          color: 'bg-cyan-500'
        });
      });
    }

    // Fetch Exams (using the actual exams table)
    const { data: exams } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: true });

    if (exams) {
      exams.forEach(exam => {
        calendarEvents.push({
          id: `exam-${exam.id}`,
          title: exam.exam_name,
          date: exam.created_at.split('T')[0], // Use created date as placeholder
          type: 'test',
          description: exam.status,
          color: 'bg-red-500'
        });
      });
    }

    // Fetch Assignments
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (assignments) {
      assignments.forEach(assignment => {
        calendarEvents.push({
          id: `assignment-${assignment.id}`,
          title: assignment.title,
          date: assignment.due_date,
          type: 'assignment',
          description: assignment.description,
          status: assignment.status,
          color: 'bg-blue-500'
        });
      });
    }

    // Fetch Seminars
    const { data: seminars } = await supabase
      .from('seminars')
      .select('*')
      .order('seminar_date', { ascending: true });

    if (seminars) {
      seminars.forEach(seminar => {
        calendarEvents.push({
          id: `seminar-${seminar.id}`,
          title: seminar.title,
          date: seminar.seminar_date,
          type: 'seminar',
          description: seminar.description,
          color: 'bg-purple-500'
        });
      });
    }

    // Fetch Records
    const { data: records } = await supabase
      .from('records')
      .select('*')
      .order('record_date', { ascending: true });

    if (records) {
      records.forEach(record => {
        calendarEvents.push({
          id: `record-${record.id}`,
          title: `${record.subject} Record`,
          date: record.record_date,
          type: 'deadline',
          description: record.description,
          color: 'bg-green-500'
        });
      });
    }

    // Sort all events by date
    calendarEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (seminars) {
      seminars.forEach(seminar => {
        calendarEvents.push({
          id: `seminar-${seminar.id}`,
          title: seminar.title,
          date: seminar.seminar_date,
          type: 'seminar',
          description: `Speaker: ${seminar.speaker || 'TBA'}`,
          color: 'bg-purple-500'
        });
      });
    }

    // Fetch Deadlines
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('*')
      .order('deadline_date', { ascending: true });

    if (deadlines) {
      deadlines.forEach(deadline => {
        calendarEvents.push({
          id: `deadline-${deadline.id}`,
          title: deadline.title,
          date: deadline.deadline_date,
          type: 'deadline',
          description: deadline.description,
          priority: deadline.priority,
          color: 'bg-rose-600'
        });
      });
    }

    return json({ 
      calendarEvents: calendarEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      tablesNotCreated: false 
    });

  } catch (error) {
    console.error('Database error:', error);
    return json({ 
      calendarEvents: [], 
      tablesNotCreated: true,
      error: 'Some database tables may not be created yet.'
    });
  }
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCalendar() {
  const { calendarEvents, tablesNotCreated } = useLoaderData<typeof loader>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return calendarEvents.filter(event => event.date === date);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      const dateString = currentDateObj.toISOString().split('T')[0];
      const isCurrentMonth = currentDateObj.getMonth() === currentMonth;
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const events = getEventsForDate(dateString);

      days.push({
        date: new Date(currentDateObj),
        dateString,
        isCurrentMonth,
        isToday,
        events,
        day: currentDateObj.getDate()
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const calendarDays = generateCalendarDays();
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return '🎪';
      case 'test':
        return '📝';
      case 'assignment':
        return '📋';
      case 'seminar':
        return '🎤';
      case 'deadline':
        return '⏰';
      default:
        return '📅';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (tablesNotCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900">
        <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin" 
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  📅 Calendar - Setup Required
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Database Setup Required
                </h3>
                <p className="mt-2 text-yellow-700 dark:text-yellow-300">
                  The calendar requires database tables from other sections to be created first. Please set up the Events, Tests, Assignments, Seminars, and Deadlines sections.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin" 
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                📅 Academic Calendar
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Today
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {calendarEvents.length} events total
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`
                      relative p-2 min-h-[80px] cursor-pointer rounded-lg border transition-all duration-200
                      ${day.isCurrentMonth 
                        ? 'bg-white/50 dark:bg-slate-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600/50' 
                        : 'bg-gray-50/30 dark:bg-slate-800/30 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                      }
                      ${day.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                      ${selectedDate === day.dateString ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : ''}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.day}
                    </div>
                    
                    {day.events.length > 0 && (
                      <div className="space-y-1">
                        {day.events.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className={`text-xs px-1 py-0.5 rounded text-white truncate ${event.color}`}
                            title={event.title}
                          >
                            {getTypeIcon(event.type)} {event.title}
                          </div>
                        ))}
                        {day.events.length > 2 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            +{day.events.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Legend */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">🎪 Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">📝 Tests/Exams</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">📋 Assignments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">🎤 Seminars</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-rose-600 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">⏰ Deadlines</span>
                </div>
              </div>
            </div>

            {/* Selected Date Events */}
            {selectedDate && (
              <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                {selectedEvents.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No events on this date</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event, index) => (
                      <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50">
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 ${event.color} rounded-full mt-1.5 flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {getTypeIcon(event.type)} {event.title}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                {getTypeLabel(event.type)}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {event.description}
                              </p>
                            )}
                            {event.status && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 dark:text-gray-500">Status:</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  event.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  event.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                            )}
                            {event.priority && (
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-500">Priority:</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  event.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {event.priority}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🎪 Events</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calendarEvents.filter(e => e.type === 'event').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">📝 Tests</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calendarEvents.filter(e => e.type === 'test').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">📋 Assignments</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calendarEvents.filter(e => e.type === 'assignment').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🎤 Seminars</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calendarEvents.filter(e => e.type === 'seminar').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">⏰ Deadlines</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calendarEvents.filter(e => e.type === 'deadline').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}