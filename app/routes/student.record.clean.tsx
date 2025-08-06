import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Academic Record - Student Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  try {
    console.log('Loading records for user:', user.id);
    
    // Fetch records
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('*')
      .order('record_date', { ascending: false });

    console.log('Raw records data:', records);
    console.log('Records error:', recordsError);

    if (recordsError) {
      console.error('Error fetching records:', recordsError);
      return json({ 
        user,
        records: []
      });
    }

    return json({ 
      user,
      records: records || [] 
    });
  } catch (error) {
    console.error('Records loader error:', error);
    return json({ 
      user,
      records: []
    });
  }
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

      {/* Records List */}
      {records.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📋 Academic Records</h2>
          <div className="space-y-4">
            {records.map((record: any) => (
              <div key={record.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {record.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {record.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(record.record_date).toLocaleDateString()}
                      </span>
                      {record.category && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {record.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Records */}
      {records.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No records available</h3>
          <p className="text-gray-600 dark:text-gray-400">Your academic records will appear here once available.</p>
        </div>
      )}
    </div>
  );
}
