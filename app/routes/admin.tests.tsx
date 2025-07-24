import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Exam Schedules - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  try {
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: examSubjects, error: subjectsError } = await supabase
      .from('exam_subjects')
      .select('*')
      .order('exam_date', { ascending: true });

    if (examsError) {
      console.error('Error fetching exams:', examsError);
      // If tables don't exist, return empty data
      return json({ 
        exams: [], 
        examSubjects: [],
        tablesNotCreated: true,
        error: 'Database tables not created yet. Please run the SQL migration.'
      });
    }

    if (subjectsError) {
      console.error('Error fetching exam subjects:', subjectsError);
    }

    return json({ 
      exams: exams || [], 
      examSubjects: examSubjects || [],
      tablesNotCreated: false
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return json({ 
      exams: [], 
      examSubjects: [],
      tablesNotCreated: true,
      error: 'Database connection issue. Please check your setup.'
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'createExam') {
    const examName = formData.get('examName') as string;

    // Validate required fields
    if (!examName) {
      return json({ error: 'Exam name is required' }, { status: 400 });
    }

    try {
      const { error } = await supabase
        .from('exams')
        .insert({
          exam_name: examName,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (error) {
        if (error.message.includes('relation "exams" does not exist')) {
          return json({ 
            error: 'Database tables not created yet. Please run the SQL migration first.',
            tablesNotCreated: true 
          }, { status: 400 });
        }
        return json({ error: error.message }, { status: 400 });
      }

      return redirect('/admin/tests');
    } catch (error) {
      return json({ 
        error: 'Database error. Please check your setup and try again.',
        tablesNotCreated: true 
      }, { status: 500 });
    }
  }

  if (intent === 'addSubject') {
    const examId = formData.get('examId') as string;
    const subject = formData.get('subject') as string;
    const examDate = formData.get('examDate') as string;

    // Validate required fields
    if (!examId || !subject || !examDate) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('exam_subjects')
      .insert({
        exam_id: examId,
        subject,
        exam_date: examDate,
        created_at: new Date().toISOString()
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/tests');
  }

  if (intent === 'deleteExam') {
    const examId = formData.get('examId') as string;
    
    // First delete all subjects for this exam
    await supabase
      .from('exam_subjects')
      .delete()
      .eq('exam_id', examId);

    // Then delete the exam
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/tests');
  }

  if (intent === 'deleteSubject') {
    const subjectId = formData.get('subjectId') as string;
    
    const { error } = await supabase
      .from('exam_subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/tests');
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function ExamScheduleManagement() {
  const { exams, examSubjects, tablesNotCreated } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showExamForm, setShowExamForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting';

  const getExamSubjects = (examId: string) => {
    return examSubjects.filter(subject => subject.exam_id === examId);
  };

  const getUpcomingExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examSubjects.filter(subject => 
      new Date(subject.exam_date) >= today
    );
  };

  // Show setup instructions if tables don't exist
  if (tablesNotCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900">
        <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin" 
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  📊 Exam Schedules - Setup Required
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Database Setup Required
                </h3>
                <p className="mt-2 text-yellow-700 dark:text-yellow-300">
                  The exam schedules feature requires additional database tables that haven't been created yet.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🛠️ Setup Instructions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Step 1: Access Supabase Dashboard
                </h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Go to your Supabase dashboard and select your project.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  Step 2: Open SQL Editor
                </h3>
                <p className="text-green-800 dark:text-green-300 text-sm">
                  Navigate to the "SQL Editor" in the left sidebar of your Supabase dashboard.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  Step 3: Run the Migration SQL
                </h3>
                <p className="text-purple-800 dark:text-purple-300 text-sm mb-3">
                  Copy and paste the SQL from the file <code className="bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">create-exam-tables.sql</code> 
                  (located in your project root) into the SQL Editor and click "Run".
                </p>
                <details className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded p-3">
                  <summary className="cursor-pointer text-purple-900 dark:text-purple-200 font-medium">
                    Show SQL Code
                  </summary>
                  <pre className="mt-2 text-xs overflow-x-auto bg-gray-50 dark:bg-gray-900 p-3 rounded">
{`-- Quick fix: Add exam tables to existing database
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                  </pre>
                </details>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  Step 4: Refresh This Page
                </h3>
                <p className="text-orange-800 dark:text-orange-300 text-sm">
                  After running the SQL successfully, refresh this page to start using the exam schedules feature.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Need help? Check the <code>EXAM_FIX_README.md</code> file for detailed instructions.
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin" 
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                📊 Exam Schedules
              </h1>
            </div>
            
            <button
              onClick={() => setShowExamForm(!showExamForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Exam
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Exams</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{getUpcomingExams().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{exams.length}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{examSubjects.length}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Exams</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {exams.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Exam Form */}
        {showExamForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New Exam</h2>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="createExam" />
              
              <div>
                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  id="examName"
                  name="examName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter exam name (e.g., Mid-term Exam, Final Exam)..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowExamForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </Form>

            {actionData?.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      {actionData.error}
                    </p>
                    {(actionData as any)?.tablesNotCreated && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        Please follow the setup instructions above to create the database tables.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter and Tests List */}
        {/* Exam Schedules List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Schedules</h2>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exams created</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first exam to get started.</p>
              <button
                onClick={() => setShowExamForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Create First Exam
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {exams.map((exam) => {
                const examSubjectsForThisExam = getExamSubjects(exam.id);
                return (
                  <div key={exam.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {exam.exam_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {examSubjectsForThisExam.length} subjects scheduled
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowSubjectForm(showSubjectForm === exam.id ? null : exam.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Subject
                        </button>
                        
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="deleteExam" />
                          <input type="hidden" name="examId" value={exam.id} />
                          <button 
                            type="submit"
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            onClick={(e) => {
                              if (!confirm('Are you sure you want to delete this exam? This will also delete all subjects for this exam.')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </Form>
                      </div>
                    </div>

                    {/* Add Subject Form */}
                    {showSubjectForm === exam.id && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Subject to {exam.exam_name}</h4>
                        <Form method="post" className="space-y-4">
                          <input type="hidden" name="intent" value="addSubject" />
                          <input type="hidden" name="examId" value={exam.id} />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`subject-${exam.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Subject
                              </label>
                              <input
                                type="text"
                                id={`subject-${exam.id}`}
                                name="subject"
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                placeholder="Enter subject name..."
                              />
                            </div>
                            <div>
                              <label htmlFor={`examDate-${exam.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Exam Date
                              </label>
                              <input
                                type="date"
                                id={`examDate-${exam.id}`}
                                name="examDate"
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowSubjectForm(null)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-sm disabled:opacity-50"
                            >
                              {isSubmitting ? 'Adding...' : 'Add Subject'}
                            </button>
                          </div>
                        </Form>
                      </div>
                    )}

                    {/* Subjects List */}
                    <div className="space-y-2">
                      {examSubjectsForThisExam.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">No subjects added yet</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {examSubjectsForThisExam.map((subject) => (
                            <div key={subject.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {subject.subject}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(subject.exam_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <Form method="post" className="inline ml-2">
                                  <input type="hidden" name="intent" value="deleteSubject" />
                                  <input type="hidden" name="subjectId" value={subject.id} />
                                  <button 
                                    type="submit"
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    onClick={(e) => {
                                      if (!confirm('Are you sure you want to delete this subject?')) {
                                        e.preventDefault();
                                      }
                                    }}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </Form>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
