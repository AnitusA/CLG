import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Syllabus - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  const { data: syllabusItems, error } = await supabase
    .from('syllabus')
    .select('*')
    .order('subject', { ascending: true });

  if (error) {
    console.error('Error fetching syllabus:', error);
  }

  return json({ 
    user,
    syllabusItems: syllabusItems || []
  });
};

export default function StudentSyllabus() {
  const { syllabusItems } = useLoaderData<typeof loader>();

  // Group syllabus items by subject
  const groupedSyllabus = syllabusItems.reduce((groups: Record<string, any[]>, item) => {
    const subject = item.subject;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(item);
    return groups;
  }, {});

  const subjectColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📚 Course Syllabus</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete curriculum and learning objectives for all subjects
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{Object.keys(groupedSyllabus).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Topics</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{syllabusItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Outcomes</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {syllabusItems.filter(item => item.learning_outcomes).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects */}
      {Object.keys(groupedSyllabus).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedSyllabus).map(([subject, items], index) => (
            <div key={subject} className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-lg ${subjectColors[index % subjectColors.length]}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{subject}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{items.length} topics covered</p>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item, itemIndex) => (
                  <div key={item.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-5 border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 mr-3">
                          {itemIndex + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.topic}</h3>
                      </div>
                      {item.duration && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                          {item.duration} hours
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 ml-11">{item.description}</p>
                    )}

                    {item.learning_outcomes && (
                      <div className="ml-11">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🎯 Learning Outcomes:</h4>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.learning_outcomes}</p>
                        </div>
                      </div>
                    )}

                    {item.prerequisites && (
                      <div className="ml-11 mt-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📋 Prerequisites:</h4>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-400">{item.prerequisites}</p>
                        </div>
                      </div>
                    )}

                    {item.resources && (
                      <div className="ml-11 mt-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Resources:</h4>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <p className="text-sm text-green-800 dark:text-green-400">{item.resources}</p>
                        </div>
                      </div>
                    )}

                    {item.assessment_criteria && (
                      <div className="ml-11 mt-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">✅ Assessment Criteria:</h4>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                          <p className="text-sm text-purple-800 dark:text-purple-400">{item.assessment_criteria}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No syllabus available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            The course syllabus has not been uploaded yet. Check back later for curriculum details.
          </p>
        </div>
      )}
    </div>
  );
}
