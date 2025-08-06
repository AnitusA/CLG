import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Assignments - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  // Get all assignments, both active and completed
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*')
    .in('status', ['active', 'completed'])
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching assignments:', error);
  }

  return json({ 
    user,
    assignments: assignments || [],
    currentDate: new Date().toISOString().split('T')[0] // Send current date to compare with due dates
  });
};

export default function StudentAssignments() {
  const { assignments, currentDate } = useLoaderData<typeof loader>();

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
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  // Filter assignments into future (upcoming) and past/completed
  const futureAssignments = assignments
    .filter(a => a.status === 'active' && a.due_date > currentDate)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  
  const pastOrCompletedAssignments = assignments
    .filter(a => a.status === 'completed' || a.due_date <= currentDate)
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()); // Most recent first
    
  // Keep these for stats
  const activeAssignments = assignments.filter(a => a.status === 'active');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📝 Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and track your assignments and project submissions
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{activeAssignments.length}</p>
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
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{completedAssignments.length}</p>
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
                {new Set(assignments.map(a => a.subject)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Assignments - Sorted by date */}
      {futureAssignments.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⏰ Upcoming Assignments</h2>
          <div className="grid gap-4">
            {futureAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-6 border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{assignment.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {assignment.subject}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due: {formatDate(assignment.due_date)}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {Math.ceil((new Date(assignment.due_date).getTime() - new Date(currentDate).getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past or Completed Assignments */}
      {pastOrCompletedAssignments.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📚 Past or Completed Assignments</h2>
          <div className="grid gap-4">
            {pastOrCompletedAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-6 border border-white/20 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{assignment.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {assignment.subject}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due: {formatDate(assignment.due_date)}
                        {assignment.due_date <= currentDate && assignment.status !== 'completed' && (
                          <span className="ml-2 text-red-500 font-medium">(Past due)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assignments */}
      {assignments.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments assigned</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You're all caught up! No assignments have been assigned yet.
          </p>
        </div>
      )}
      
      {/* No Future Assignments */}
      {assignments.length > 0 && futureAssignments.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⏰ Upcoming Assignments</h2>
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any upcoming assignments at the moment. All assignments are either completed or past due.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
