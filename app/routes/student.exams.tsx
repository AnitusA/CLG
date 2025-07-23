import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Exam Schedules - Student Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireStudent(request);

  // Fetch exam schedules/tests
  const { data: exams, error } = await supabase
    .from('tests')
    .select('*')
    .order('test_date', { ascending: true });

  if (error) {
    console.error('Error fetching exams:', error);
  }

  return json({ exams: exams || [] });
};

export default function StudentExams() {
  const { exams } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          📋 Exam Schedules
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View upcoming exam schedules and test dates
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exams scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400">Exam schedules will appear here when available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam: any) => (
              <div key={exam.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {exam.title}
                  </h3>
                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                    {exam.subject}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    <span>{new Date(exam.test_date).toLocaleDateString()}</span>
                  </div>
                  {exam.duration && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">⏱️</span>
                      <span>{exam.duration}</span>
                    </div>
                  )}
                  {exam.total_marks && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">💯</span>
                      <span>{exam.total_marks} marks</span>
                    </div>
                  )}
                </div>

                {exam.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 line-clamp-2">
                    {exam.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
