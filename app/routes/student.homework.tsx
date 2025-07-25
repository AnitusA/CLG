import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Homework - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  const { data: homework, error } = await supabase
    .from('homework')
    .select('*')
    .order('homework_date', { ascending: true });

  if (error) {
    console.error('Error fetching homework:', error);
  }

  return json({ 
    user,
    homework: homework || []
  });
};

export default function StudentHomework() {
  const { homework } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📚 Homework</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your assigned homework and manage your study schedule
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{homework.length}</p>
            </div>
          </div>
        </div>

        {/* Only show total and subjects count, since status is removed */}

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
                {new Set(homework.map(hw => hw.subject)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Homework List */}
      {homework.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">� Assigned Homework</h2>
          <div className="space-y-4">
            {homework.map((hw) => (
              <div key={hw.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Subject: {hw.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{hw.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500 mt-3">
                      <span>📅 Assigned: {formatDate(hw.homework_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Homework */}
      {homework.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No homework assigned</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You're all caught up! No homework has been assigned yet.
          </p>
        </div>
      )}
    </div>
  );
}
