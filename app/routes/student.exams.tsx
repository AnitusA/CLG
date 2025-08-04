import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Exam Schedules - Student Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireStudent(request);

  try {
    // Fetch both tests and exam schedules
    const [testsRes, examSchedulesRes] = await Promise.all([
      // Fetch individual tests
      supabase
        .from('tests')
        .select('*')
        .order('test_date', { ascending: true }),
      
      // Fetch exam schedules (exams with their subjects) - only active exams
      supabase
        .from('exam_subjects')
        .select(`
          *,
          exams!inner(
            id,
            exam_name,
            status
          )
        `)
        .eq('exams.status', 'active')
        .order('exam_date', { ascending: true })
    ]);

    if (testsRes.error) {
      console.error('Error fetching tests:', testsRes.error);
    }
    
    if (examSchedulesRes.error) {
      console.error('Error fetching exam schedules:', examSchedulesRes.error);
    }

    return json({ 
      tests: testsRes.data || [],
      examSchedules: examSchedulesRes.data || []
    });
  } catch (error) {
    console.error('Error in loader:', error);
    return json({ 
      tests: [],
      examSchedules: []
    });
  }
};

export default function StudentExams() {
  const { tests, examSchedules } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalExamItems = tests.length + examSchedules.length;

  // Group exam schedules by exam name for timetable view
  const groupedExamSchedules = examSchedules.reduce((acc: any, examSubject: any) => {
    const examName = examSubject.exams.exam_name;
    if (!acc[examName]) {
      acc[examName] = {
        exam: examSubject.exams,
        subjects: []
      };
    }
    acc[examName].subjects.push(examSubject);
    return acc;
  }, {});

  // Sort subjects within each exam by date
  Object.keys(groupedExamSchedules).forEach(examName => {
    groupedExamSchedules[examName].subjects.sort((a: any, b: any) => 
      new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
    );
  });

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
        {totalExamItems === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exams scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400">Exam schedules will appear here when available.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Individual Tests */}
            {tests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📝 Individual Tests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tests.map((test: any) => (
                    <div key={test.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {test.title}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                          {test.subject}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2">📅</span>
                          <span>{formatDate(test.test_date)}</span>
                        </div>
                        {test.start_time && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 mr-2">🕐</span>
                            <span>{formatTime(test.start_time)}</span>
                          </div>
                        )}
                        {test.duration_minutes && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 mr-2">⏱️</span>
                            <span>{test.duration_minutes} minutes</span>
                          </div>
                        )}
                        {test.total_marks && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 mr-2">💯</span>
                            <span>{test.total_marks} marks</span>
                          </div>
                        )}
                      </div>

                      {test.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 line-clamp-2">
                          {test.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Schedules - Timetable View */}
            {Object.keys(groupedExamSchedules).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">📋 Exam Schedules</h2>
                <div className="space-y-8">
                  {Object.entries(groupedExamSchedules).map(([examName, examData]: [string, any]) => (
                    <div key={examName} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                      {/* Exam Header */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {examName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {examData.subjects.length} subjects scheduled
                        </p>
                      </div>

                      {/* Timetable */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">Subject</th>
                              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Day</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examData.subjects.map((examSubject: any, index: number) => {
                              const examDate = new Date(examSubject.exam_date);
                              const isToday = examDate.toDateString() === new Date().toDateString();
                              
                              return (
                                <tr 
                                  key={examSubject.id} 
                                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-600/50 ${
                                    isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                  }`}
                                >
                                  <td className="py-3 px-2 sm:px-4">
                                    <div className="flex flex-col space-y-1">
                                      <span className={`text-sm font-medium ${
                                        isToday ? 'text-blue-600 dark:text-blue-400' : 
                                        'text-gray-900 dark:text-white'
                                      }`}>
                                        {formatDate(examSubject.exam_date)}
                                      </span>
                                      {isToday && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full w-fit">
                                          Today
                                        </span>
                                      )}
                                      {/* Show day on mobile */}
                                      <span className="text-xs text-gray-600 dark:text-gray-400 sm:hidden">
                                        {examDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 sm:px-4">
                                    <span className={`font-medium ${
                                      isToday ? 'text-blue-600 dark:text-blue-400' : 
                                      'text-gray-900 dark:text-white'
                                    }`}>
                                      {examSubject.subject}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {examDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            Duration: {formatDate(examData.subjects[0].exam_date)} - {formatDate(examData.subjects[examData.subjects.length - 1].exam_date)}
                          </span>
                          <span>
                            Total: {examData.subjects.length} subjects
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
