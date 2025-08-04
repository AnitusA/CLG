import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Academic Record - Student Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireStudent(request);

  // Fetch general records for students (only future dates)
  const { data: records, error } = await supabase
    .from('records')
    .select('*')
    .gte('record_date', new Date().toISOString().split('T')[0])
    .order('record_date', { ascending: true });

  if (error) {
    console.error('Error fetching records:', error);
  }

  return json({ records: records || [] });
};

export default function StudentRecord() {
  const { records } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          🔖 Academic Record
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View your academic performance and records
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No records available</h3>
            <p className="text-gray-600 dark:text-gray-400">Your academic records will appear here once available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record: any) => (
              <div key={record.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {record.subject}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {record.description}
                </p>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(record.record_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
