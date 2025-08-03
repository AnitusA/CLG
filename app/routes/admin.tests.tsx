import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import React from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Exam Schedules - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  try {
    const { data: examSchedules, error: examsError } = await supabase
      .from('exam_schedules')
      .select('*')
      .order('exam_date', { ascending: true });

    if (examsError) {
      console.error('Error fetching exam schedules:', examsError);
      // If tables don't exist, return empty data
      return json({ 
        examSchedules: [], 
        tablesNotCreated: true,
        error: 'Database tables not created yet. Please run the SQL migration.'
      });
    }

    return json({ 
      examSchedules: examSchedules || [], 
      tablesNotCreated: false
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return json({ 
      examSchedules: [], 
      tablesNotCreated: true,
      error: 'Database connection issue. Please check your setup.'
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const subject = formData.get('subject') as string;
    const examDate = formData.get('examDate') as string;
    const examTime = formData.get('examTime') as string;
    const syllabus = formData.get('syllabus') as string;

    // Validate required fields
    if (!subject || !examDate || !examTime || !syllabus) {
      return json({ error: 'All fields including syllabus are required' }, { status: 400 });
    }

    try {
      const { error } = await supabase
        .from('exam_schedules')
        .insert({
          subject,
          exam_date: examDate,
          exam_time: examTime,
          syllabus,
          status: 'scheduled',
          created_at: new Date().toISOString()
        });

      if (error) {
        if (error.message.includes('relation "exam_schedules" does not exist')) {
          return json({ 
            error: 'Database tables not created yet. Please run the SQL migration first.',
            tablesNotCreated: true 
          }, { status: 400 });
        }
        return json({ error: error.message }, { status: 400 });
      }

      return json({ success: 'Exam scheduled successfully!' });
    } catch (error) {
      return json({ 
        error: 'Database error. Please check your setup and try again.',
        tablesNotCreated: true 
      }, { status: 500 });
    }
  }

  if (intent === 'delete') {
    const examId = formData.get('examId') as string;
    
    const { error } = await supabase
      .from('exam_schedules')
      .delete()
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: 'Exam deleted successfully!' });
  }

  if (intent === 'updateStatus') {
    const examId = formData.get('examId') as string;
    const status = formData.get('status') as string;
    
    const { error } = await supabase
      .from('exam_schedules')
      .update({ status })
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: 'Exam status updated successfully!' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function ExamSchedules() {
  const { examSchedules, tablesNotCreated } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Handle success responses
  React.useEffect(() => {
    if (navigation.state === 'idle' && actionData && 'success' in actionData) {
      setShowCreateForm(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  }, [navigation.state, actionData]);

  // Clear success message when opening forms
  React.useEffect(() => {
    if (showCreateForm) {
      setShowSuccessMessage(false);
    }
  }, [showCreateForm]);

  const getUpcomingExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examSchedules.filter(exam => 
      new Date(exam.exam_date) >= today && exam.status === 'scheduled'
    );
  };

  const getPastExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examSchedules.filter(exam => 
      new Date(exam.exam_date) < today || exam.status === 'completed'
    );
  };

  // Show setup instructions if tables don't exist
  if (tablesNotCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900">
        <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin" 
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Back to Dashboard"
                >
                  <svg className="w-5 h-5 mr-0 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  📝 Exam Schedules - Setup Required
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 sm:p-6 mb-6">
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
                <p className="mt-2 text-sm sm:text-base text-yellow-700 dark:text-yellow-300">
                  The exam schedules feature requires database tables that haven't been created yet.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🛠️ Setup Instructions
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Step 1: Access Supabase Dashboard
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Go to your Supabase dashboard and select your project.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  Step 2: Open SQL Editor
                </h3>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Navigate to the "SQL Editor" in the left sidebar of your Supabase dashboard.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  Step 3: Run the Exam Schedules SQL
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                  Copy and paste the SQL below into the SQL Editor and click "Run".
                </p>
                <details className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded p-3">
                  <summary className="cursor-pointer text-purple-900 dark:text-purple-200 font-medium text-sm">
                    Show SQL Code
                  </summary>
                  <pre className="mt-2 text-xs overflow-x-auto bg-gray-50 dark:bg-gray-900 p-3 rounded whitespace-pre-wrap">
{`-- Create exam_schedules table
CREATE TABLE IF NOT EXISTS exam_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    syllabus TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_status ON exam_schedules(status);

-- Enable RLS
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable all operations for service role" ON exam_schedules
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON exam_schedules TO service_role;`}
                  </pre>
                </details>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  Step 4: Refresh This Page
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  After running the SQL successfully, refresh this page to start managing exam schedules.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Schedule and manage examination dates and times.
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-16 py-4 sm:py-0 space-y-4 sm:space-y-0">
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
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                📝 Exam Schedules
              </h1>
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Schedule Exam
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && actionData && 'success' in actionData && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700 dark:text-green-300 font-medium">{actionData.success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {actionData && 'error' in actionData && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">{actionData.error}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-500">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{getUpcomingExams().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-500">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{examSchedules.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-500">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {examSchedules.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Past Exams</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{getPastExams().length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Exam Form */}
        {showCreateForm && (
          <div className="mb-6 sm:mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Schedule New Exam</h2>
            
            <Form method="post" className="space-y-4 sm:space-y-6">
              <input type="hidden" name="intent" value="create" />
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter subject name (e.g., Mathematics, Physics, Chemistry)..."
                />
              </div>

              <div>
                <label htmlFor="syllabus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Syllabus/Topics
                </label>
                <textarea
                  id="syllabus"
                  name="syllabus"
                  rows={4}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter exam syllabus and topics to be covered (e.g., Chapter 1-5: Algebra, Trigonometry, Calculus basics...)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    id="examDate"
                    name="examDate"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Time
                  </label>
                  <input
                    type="time"
                    id="examTime"
                    name="examTime"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Exams List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">All Exam Schedules</h2>
          </div>

          {examSchedules.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No exams scheduled</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create your first exam schedule to get started.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Schedule First Exam
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {examSchedules.map((exam) => {
                const examDate = new Date(exam.exam_date);
                const today = new Date();
                const isUpcoming = examDate >= today && exam.status === 'scheduled';
                
                return (
                  <div key={exam.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-white/20 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {exam.subject}
                        </h3>
                        <div className="mb-3">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            <span className="font-medium text-gray-800 dark:text-gray-200">Syllabus: </span>
                            {exam.syllabus}
                          </p>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {examDate.toLocaleDateString()}
                          </p>
                          <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exam.exam_time}
                          </p>
                        </div>
                        <div className="flex items-center mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            exam.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            exam.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {exam.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {isUpcoming && (
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="updateStatus" />
                            <input type="hidden" name="examId" value={exam.id} />
                            <input type="hidden" name="status" value="completed" />
                            <button 
                              type="submit"
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Mark as completed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </Form>
                        )}
                        
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="examId" value={exam.id} />
                          <button 
                            type="submit"
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            onClick={(e) => {
                              if (!confirm('Are you sure you want to delete this exam schedule?')) {
                                e.preventDefault();
                              }
                            }}
                            title="Delete exam"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </Form>
                      </div>
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


