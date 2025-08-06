import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Past Assignments - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  // Get assignments that have passed their due date
  const { data: pastAssignments, error } = await supabase
    .from('assignments')
    .select('*')
    .lt('due_date', new Date().toISOString().split('T')[0])
    .order('due_date', { ascending: false }); // Most recent first

  if (error) {
    console.error('Error fetching past assignments:', error);
  }

  return json({ 
    user,
    pastAssignments: pastAssignments || []
  });
};

export default function StudentPastAssignments() {
  const { pastAssignments } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📚 Past Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View assignments that have passed their due date
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gray-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Past</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{pastAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {new Set(pastAssignments.map(a => a.subject)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {pastAssignments.filter(a => getDaysAgo(a.due_date) <= 7).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Past Assignments List */}
      {pastAssignments.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⏰ Past Assignments</h2>
          <div className="space-y-4">
            {pastAssignments.map((assignment) => {
              const daysAgo = getDaysAgo(assignment.due_date);
              return (
                <div key={assignment.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Subject: {assignment.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{assignment.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500 mt-3">
                        <span>📅 Due: {formatDate(assignment.due_date)}</span>
                        <span className="text-red-600 dark:text-red-400">
                          ⏰ {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
                        </span>
                        {assignment.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${assignment.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                            {assignment.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Past Assignments */}
      {pastAssignments.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No past assignments</h3>
          <p className="text-gray-600 dark:text-gray-400">
            No assignments have passed their due date yet.
          </p>
        </div>
      )}
    </div>
  );
}
