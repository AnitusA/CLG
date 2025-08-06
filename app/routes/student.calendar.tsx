import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState, useMemo, useEffect } from 'react';
import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Calendar View - Student Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireStudent(request);

  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*')
    .gte('due_date', new Date().toISOString().split('T')[0])
    .eq('status', 'active')
    .order('due_date', { ascending: true });

  const { data: records, error: recordsError } = await supabase
    .from('records')
    .select('*')
    .gte('record_date', new Date().toISOString().split('T')[0])
    .order('record_date', { ascending: true });

  const { data: seminars, error: seminarsError } = await supabase
    .from('seminars')
    .select('*')
    .gte('seminar_date', new Date().toISOString().split('T')[0])
    .in('status', ['active', 'scheduled'])
    .order('seminar_date', { ascending: true });

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .in('status', ['active', 'upcoming'])
    .order('event_date', { ascending: true });

  const { data: tests, error: testsError } = await supabase
    .from('tests')
    .select('*')
    .gte('test_date', new Date().toISOString().split('T')[0])
    .neq('status', 'completed')
    .order('test_date', { ascending: true });

  const { data: examSubjects, error: examSubjectsError } = await supabase
    .from('exam_subjects')
    .select('*, exams(*)')
    .gte('exam_date', new Date().toISOString().split('T')[0])
    .neq('status', 'completed')
    .order('exam_date', { ascending: true });

  if (assignmentsError) console.error('Error fetching assignments:', assignmentsError);
  if (recordsError) console.error('Error fetching records:', recordsError);
  if (seminarsError) console.error('Error fetching seminars:', seminarsError);
  if (eventsError) console.error('Error fetching events:', eventsError);
  if (testsError) console.error('Error fetching tests:', testsError);
  if (examSubjectsError) console.error('Error fetching exam subjects:', examSubjectsError);

  return json({
    assignments: assignments || [],
    records: records || [],
    seminars: seminars || [],
    events: events || [],
    tests: tests || [],
    examSubjects: examSubjects || [],
  });
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'assignment' | 'record' | 'seminar' | 'event' | 'test' | 'exam';
  color: string;
  description?: string;
  category?: string;
  venue?: string;
  speaker?: string;
  event_type?: string;
  subject?: string;
  exam_name?: string;
}

export default function StudentCalendar() {
  const { assignments, records, seminars, events, tests, examSubjects } = useLoaderData<typeof loader>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: CalendarEvent[] } | null>(null);
  const [animateMonth, setAnimateMonth] = useState(false);

  // Trigger animation on month change
  useEffect(() => {
    setAnimateMonth(true);
    const timer = setTimeout(() => setAnimateMonth(false), 500); // Match animation duration
    return () => clearTimeout(timer);
  }, [currentDate]);

  const calendarEvents: CalendarEvent[] = useMemo(
    () => [
      ...assignments.map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        date: assignment.due_date,
        type: 'assignment' as const,
        color: 'bg-orange-500',
        description: assignment.description,
      })),
      ...records.map((record: any) => ({
        id: record.id,
        title: record.title,
        date: record.record_date,
        type: 'record' as const,
        color: 'bg-amber-500',
        description: record.description,
        category: record.category,
      })),
      ...seminars.map((seminar: any) => ({
        id: seminar.id,
        title: seminar.title,
        date: seminar.seminar_date,
        type: 'seminar' as const,
        color: 'bg-red-500',
        description: seminar.description,
        venue: seminar.venue,
        speaker: seminar.speaker,
      })),
      ...events.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.event_date,
        type: 'event' as const,
        color: 'bg-orange-600',
        description: event.description,
        venue: event.venue,
        event_type: event.event_type,
      })),
      ...tests.map((test: any) => ({
        id: test.id,
        title: test.title,
        date: test.test_date,
        type: 'test' as const,
        color: 'bg-red-600',
        description: test.description,
        subject: test.subject,
      })),
      ...examSubjects.map((examSubject: any) => ({
        id: examSubject.id,
        title: `${examSubject.exams?.exam_name || 'Exam'} - ${examSubject.subject}`,
        date: examSubject.exam_date,
        type: 'exam' as const,
        color: 'bg-red-700',
        description: examSubject.exams?.description,
        subject: examSubject.subject,
        exam_name: examSubject.exams?.exam_name,
      })),
    ],
    [assignments, records, seminars, events, tests, examSubjects]
  );

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('en-CA');
    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.date).toLocaleDateString('en-CA');
      return eventDate === dateStr;
    });
  };

  const renderEventIcon = (event: CalendarEvent) => {
    switch (event.type) {
      case 'assignment':
        return '📝';
      case 'record':
        return '📋';
      case 'seminar':
        return '🎤';
      case 'event':
        return '🎉';
      case 'test':
        return '📊';
      case 'exam':
        return '📚';
      default:
        return '📅';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Custom CSS for neon glow */}
      <style>
        {`
          .neon-glow {
            box-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3);
          }
          .col-start-1 { grid-column-start: 1; }
          .col-start-2 { grid-column-start: 2; }
          .col-start-3 { grid-column-start: 3; }
          .col-start-4 { grid-column-start: 4; }
          .col-start-5 { grid-column-start: 5; }
          .col-start-6 { grid-column-start: 6; }
          .col-start-7 { grid-column-start: 7; }
        `}
      </style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
          📅 Calendar View
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          View all your academic events in calendar format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="px-2 py-1 sm:px-3 sm:py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                aria-label="Previous Month"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-1 sm:px-3 sm:py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                aria-label="Go to Today"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="px-2 py-1 sm:px-3 sm:py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                aria-label="Next Month"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div
            className={`grid grid-cols-7 gap-2 sm:gap-3 text-center text-sm sm:text-base transition-all duration-500 ease-in-out ${
              animateMonth ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-semibold text-gray-700 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
            {daysArray.map((day, index) => {
              const events = getEventsForDay(day);
              const isToday =
                new Date().toDateString() ===
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const hasEvents = events.length > 0;
              
              // Calculate the actual grid position for the first row
              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
              const isFirstWeek = day <= 7;
              const gridColumn = isFirstWeek ? `col-start-${dayOfWeek + 1}` : '';

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 sm:p-2 rounded-lg border flex flex-col items-center justify-center
                  transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer neon-glow
                  ${isToday ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-700 shadow-blue-400 shadow-md animate-pulse' : ''}
                  ${hasEvents ? 'border-2 border-teal-400 dark:border-teal-500 shadow-teal-400/30 shadow-sm' : 'border-gray-200 dark:border-slate-700'}
                  bg-white dark:bg-slate-800 ${gridColumn}`}
                >
                  <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">{day}</span>

                  {/* Mobile: number of events */}
                  <div className="block sm:hidden mt-1">
                    {hasEvents ? (
                      <button
                        onClick={() => {
                          // Open modal with day events
                          setSelectedDayEvents({ day, events });
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 min-w-[24px] h-6 flex items-center justify-center"
                      >
                        {events.length}
                      </button>
                    ) : (
                      <div className="text-gray-400 dark:text-slate-500 text-xs">—</div>
                    )}
                  </div>

                  {/* Desktop: event icons */}
                  <div className="hidden sm:flex flex-wrap gap-1 mt-2 justify-center">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="text-lg hover:scale-110 transition-transform"
                        aria-label={`${event.type} - ${event.title}`}
                        title={event.title}
                      >
                        {renderEventIcon(event)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Works */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Works</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {calendarEvents
              .filter((event) => new Date(event.date) >= new Date())
              .map((event) => (
                <button
                  key={`${event.type}-${event.id}`}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex items-center space-x-3 p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                >
                  <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString()} • {event.type}
                      {event.category && ` • ${event.category}`}
                      {event.event_type && ` • ${event.event_type}`}
                      {event.venue && ` • ${event.venue}`}
                    </p>
                  </div>
                </button>
              ))}
          </div>
          {calendarEvents.filter((event) => new Date(event.date) >= new Date()).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming works</p>
            </div>
          )}
        </div>
      </div>

      {/* Day Events Modal (Mobile) */}
      {selectedDayEvents && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDayEvents.day}
              </h3>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {selectedDayEvents.events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedDayEvents(null);
                    setSelectedEvent(event);
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition text-left"
                >
                  <div className="text-2xl">{renderEventIcon(event)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {event.type}
                      {event.category && ` • ${event.category}`}
                      {event.event_type && ` • ${event.event_type}`}
                      {event.venue && ` • ${event.venue}`}
                      {event.subject && ` • ${event.subject}`}
                      {event.exam_name && ` • ${event.exam_name}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Type:</span> {selectedEvent.type}
              </p>
              {selectedEvent.category && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Category:</span> {selectedEvent.category}
                </p>
              )}
              {selectedEvent.event_type && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Event Type:</span> {selectedEvent.event_type}
                </p>
              )}
              {selectedEvent.venue && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Venue:</span> {selectedEvent.venue}
                </p>
              )}
              {selectedEvent.speaker && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Speaker:</span> {selectedEvent.speaker}
                </p>
              )}
              {selectedEvent.subject && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Subject:</span> {selectedEvent.subject}
                </p>
              )}
              {selectedEvent.exam_name && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Exam:</span> {selectedEvent.exam_name}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Date:</span>{' '}
                {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {selectedEvent.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Description:</span> {selectedEvent.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}