import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Tests - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  const { data: tests, error } = await supabase
    .from('tests')
    .select('*')
    .in('status', ['scheduled', 'ongoing', 'completed'])
    .order('test_date', { ascending: true });

  if (error) {
    console.error('Error fetching tests:', error);
  }

  return json({ 
    user,
    tests: tests || []
  });
};

export default function StudentTests() {
  const { tests } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const upcomingTests = tests.filter(t => t.status === 'scheduled');
  const ongoingTests = tests.filter(t => t.status === 'ongoing');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Tests & Examinations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your scheduled tests, ongoing exams, and results
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{tests.length}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{upcomingTests.length}</p>
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
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{ongoingTests.length}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{completedTests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Tests */}
      {ongoingTests.length > 0 && (
        <div className="bg-blue-50/70 backdrop-blur-lg dark:bg-blue-900/20 rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-4">🔵 Ongoing Tests</h2>
          <div className="space-y-4">
            {ongoingTests.map((test) => (
              <div key={test.id} className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{test.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500 mt-3">
                      <span>📚 {test.subject}</span>
                      <span>📅 {formatDate(test.test_date)}</span>
                      <span>🕐 {test.start_time}</span>
                      <span>⏱️ {test.duration_minutes} mins</span>
                      <span>📊 {test.total_marks} marks</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tests */}
      {upcomingTests.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📅 Upcoming Tests</h2>
          <div className="space-y-4">
            {upcomingTests.map((test) => (
              <div key={test.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{test.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500 mt-3">
                      <span>📚 {test.subject}</span>
                      <span>📅 {formatDate(test.test_date)}</span>
                      <span>🕐 {test.start_time}</span>
                      <span>⏱️ {test.duration_minutes} mins</span>
                      <span>📊 {test.total_marks} marks</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">✅ Completed Tests</h2>
          <div className="space-y-4">
            {completedTests.map((test) => (
              <div key={test.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{test.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500 mt-3">
                      <span>📚 {test.subject}</span>
                      <span>📅 {formatDate(test.test_date)}</span>
                      <span>🕐 {test.start_time}</span>
                      <span>⏱️ {test.duration_minutes} mins</span>
                      <span>📊 {test.total_marks} marks</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tests */}
      {tests.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tests scheduled</h3>
          <p className="text-gray-600 dark:text-gray-400">
            No tests have been scheduled yet. Check back later for updates.
          </p>
        </div>
      )}
    </div>
  );
}
