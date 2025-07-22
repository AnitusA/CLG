import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Seminars - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  const { data: seminars, error } = await supabase
    .from('seminars')
    .select('*')
    .in('status', ['scheduled', 'ongoing', 'completed'])
    .order('seminar_date', { ascending: true });

  if (error) {
    console.error('Error fetching seminars:', error);
  }

  return json({ 
    user,
    seminars: seminars || []
  });
};

export default function StudentSeminars() {
  const { seminars } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const upcomingSeminars = seminars.filter(s => s.status === 'scheduled');
  const ongoingSeminars = seminars.filter(s => s.status === 'ongoing');
  const completedSeminars = seminars.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎓 Seminars & Workshops</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and attend educational seminars and workshops
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-violet-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5h6m-6 0V9h6v7M7 7h6v6H7V7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{seminars.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{upcomingSeminars.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ongoing</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{ongoingSeminars.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attended</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{completedSeminars.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Seminars */}
      {ongoingSeminars.length > 0 && (
        <div className="bg-blue-50/70 backdrop-blur-lg dark:bg-blue-900/20 rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-4">🔵 Live Seminars</h2>
          <div className="space-y-4">
            {ongoingSeminars.map((seminar) => (
              <div key={seminar.id} className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-6 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{seminar.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{seminar.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span>👤 Speaker: {seminar.speaker}</span>
                        </div>
                        <div className="flex items-center">
                          <span>📅 Date: {formatDate(seminar.seminar_date)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span>🕐 Time: {formatTime(seminar.start_time)} - {formatTime(seminar.end_time)}</span>
                        </div>
                        <div className="flex items-center">
                          <span>📍 Location: {seminar.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(seminar.status)}`}>
                    {seminar.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Seminars */}
      {upcomingSeminars.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📅 Upcoming Seminars</h2>
          <div className="grid gap-6">
            {upcomingSeminars.map((seminar) => (
              <div key={seminar.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-6 border border-white/20 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{seminar.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{seminar.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Speaker: {seminar.speaker}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Date: {formatDate(seminar.seminar_date)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Time: {formatTime(seminar.start_time)} - {formatTime(seminar.end_time)}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Location: {seminar.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(seminar.status)}`}>
                    {seminar.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Seminars */}
      {completedSeminars.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">✅ Attended Seminars</h2>
          <div className="space-y-4">
            {completedSeminars.map((seminar) => (
              <div key={seminar.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{seminar.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{seminar.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500 mt-2">
                      <span>👤 {seminar.speaker}</span>
                      <span>📅 {formatDate(seminar.seminar_date)}</span>
                      <span>📍 {seminar.location}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(seminar.status)}`}>
                    {seminar.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Seminars */}
      {seminars.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5h6m-6 0V9h6v7M7 7h6v6H7V7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No seminars scheduled</h3>
          <p className="text-gray-600 dark:text-gray-400">
            No seminars have been scheduled yet. Check back later for exciting educational opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
