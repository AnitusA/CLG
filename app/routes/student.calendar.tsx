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
    .order('due_date', { ascending: true });

  const { data: exams, error: examsError } = await supabase
    .from('tests')
    .select('*')
    .order('test_date', { ascending: true });

  const { data: seminars, error: seminarsError } = await supabase
    .from('seminars')
    .select('*')
    .order('seminar_date', { ascending: true });

  if (assignmentsError) console.error('Error fetching assignments:', assignmentsError);
  if (examsError) console.error('Error fetching exams:', examsError);
  if (seminarsError) console.error('Error fetching seminars:', seminarsError);

  return json({
    assignments: assignments || [],
    exams: exams || [],
    seminars: seminars || [],
  });
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'assignment' | 'exam' | 'seminar';
  color: string;
  description?: string;
}

export default function StudentCalendar() {
  const { assignments, exams, seminars } = useLoaderData<typeof loader>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
        color: 'bg-blue-500',
        description: assignment.description,
      })),
      ...exams.map((exam: any) => ({
        id: exam.id,
        title: exam.title,
        date: exam.test_date,
        type: 'exam' as const,
        color: 'bg-red-500',
        description: exam.description,
      })),
      ...seminars.map((seminar: any) => ({
        id: seminar.id,
        title: seminar.title,
        date: seminar.seminar_date,
        type: 'seminar' as const,
        color: 'bg-purple-500',
        description: seminar.description,
      })),
    ],
    [assignments, exams, seminars]
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
      case 'exam':
        return '📚';
      case 'seminar':
        return '🎤';
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
        `}
      </style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
          ⌛ Calendar View
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
            className={`grid grid-cols-7 gap-1 sm:gap-2 text-center text-sm sm:text-base transition-all duration-500 ease-in-out ${
              animateMonth ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-semibold text-gray-700 dark:text-gray-300">
                {day}
              </div>
            ))}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="aspect-square bg-gray-50 dark:bg-slate-900/50 rounded-lg"></div>
            ))}
            {daysArray.map((day) => {
              const events = getEventsForDay(day);
              const isToday =
                new Date().toDateString() ===
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const hasEvents = events.length > 0;

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 sm:p-2 rounded-lg border flex flex-col items-center justify-center
                  transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer neon-glow
                  ${isToday ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-700 shadow-blue-400 shadow-md animate-pulse' : ''}
                  ${hasEvents ? 'border-2 border-teal-400 dark:border-teal-500 shadow-teal-400/30 shadow-sm' : 'border-gray-200 dark:border-slate-700'}
                  bg-white dark:bg-slate-800`}
                >
                  <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">{day}</span>

                  {/* Mobile: number of events */}
                  <div className="block sm:hidden text-xs sm:text-sm mt-1 font-semibold">
                    {hasEvents ? (
                      <span className="text-teal-600 dark:text-teal-400">{events.length} work{events.length > 1 ? 's' : ''}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">—</span>
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

        {/* Upcoming Events */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {calendarEvents
              .filter((event) => new Date(event.date) >= new Date())
              .slice(0, 5)
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
                    </p>
                  </div>
                </button>
              ))}
          </div>
          {calendarEvents.filter((event) => new Date(event.date) >= new Date()).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </div>

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