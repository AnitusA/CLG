import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Exam Schedule Management - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  // Fetch existing exams
  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exams:', error);
  }

  return json({ exams: exams || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const examType = formData.get('examType') as string;
    const subject = formData.get('subject') as string;
    const examDate = formData.get('examDate') as string;
    const examTime = formData.get('examTime') as string;

    // Validate required fields
    if (!examType || !subject || !examDate || !examTime) {
      return json({ error: 'Exam type, subject, date and time are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('exams')
      .insert({
        exam_name: examType, // Use exam type as exam name
        subject: subject,
        exam_date: examDate,
        exam_time: examTime,
        exam_type: examType,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Exam schedule created successfully' });
  }

  if (intent === 'delete') {
    const examId = formData.get('examId') as string;
    
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Exam schedule deleted successfully' });
  }

  if (intent === 'update') {
    const examId = formData.get('examId') as string;
    const examType = formData.get('examType') as string;
    const subject = formData.get('subject') as string;
    const examDate = formData.get('examDate') as string;
    const examTime = formData.get('examTime') as string;

    // Validate required fields
    if (!examType || !subject || !examDate || !examTime) {
      return json({ error: 'Exam type, subject, date and time are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('exams')
      .update({
        exam_name: examType, // Use exam type as exam name
        subject: subject,
        exam_date: examDate,
        exam_time: examTime,
        exam_type: examType,
        updated_at: new Date().toISOString()
      })
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Exam schedule updated successfully' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function ExamScheduleManagement() {
  const { exams } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Hide forms after successful submission
  useEffect(() => {
    if (navigation.state === 'idle' && !('error' in (actionData || {}))) {
      setShowForm(false);
      setEditingExam(null);
      
      // Show success message briefly
      if (actionData && 'success' in actionData) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  }, [navigation.state, actionData]);

  // Clear success message when opening forms
  useEffect(() => {
    if (showForm || editingExam) {
      setShowSuccessMessage(false);
    }
  }, [showForm, editingExam]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin" 
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6 mr-0 sm:mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent flex items-center">
                <svg className="w-7 h-7 mr-3 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                Exam Schedule Management
              </h1>
            </div>
            
            <button
              onClick={() => {
                setEditingExam(null);
                setShowForm(!showForm);
              }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Exam Schedule
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && actionData && 'success' in actionData && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-600 dark:text-green-400 font-medium text-base">{actionData.message}</p>
            </div>
          </div>
        )}

        {/* Create Exam Schedule Form */}
        {showForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New Exam Schedule</h2>
            
            <Form method="post" className="space-y-6" key="create-form">
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="examType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type *
                  </label>
                  <input
                    type="text"
                    id="examType"
                    name="examType"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter exam type (e.g., Mid Term, Final Exam, Quiz, Unit Test)..."
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter subject name (e.g., Mathematics, Physics, Chemistry)..."
                  />
                </div>

                <div>
                  <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    id="examDate"
                    name="examDate"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Time *
                  </label>
                  <input
                    type="time"
                    id="examTime"
                    name="examTime"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Exam Schedule'}
                </button>
              </div>
            </Form>

            {actionData && 'error' in actionData && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-600 dark:text-red-400 font-medium">{actionData.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Exam Schedule Form */}
        {editingExam && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Exam Schedule</h2>
            
            <Form method="post" className="space-y-6" key={editingExam.id}>
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="examId" value={editingExam.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-examType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type *
                  </label>
                  <input
                    type="text"
                    id="edit-examType"
                    name="examType"
                    defaultValue={editingExam.exam_type || editingExam.exam_name || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter exam type (e.g., Mid Term, Final Exam, Quiz, Unit Test)..."
                  />
                </div>

                <div>
                  <label htmlFor="edit-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="edit-subject"
                    name="subject"
                    defaultValue={editingExam.subject || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter subject name (e.g., Mathematics, Physics, Chemistry)..."
                  />
                </div>

                <div>
                  <label htmlFor="edit-examDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    id="edit-examDate"
                    name="examDate"
                    defaultValue={editingExam.exam_date || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="edit-examTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Time *
                  </label>
                  <input
                    type="time"
                    id="edit-examTime"
                    name="examTime"
                    defaultValue={editingExam.exam_time || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Exam Schedule'}
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Exam Schedules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {exam.exam_name || exam.exam_type}
                    </h3>
                    
                    {exam.subject && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-medium">Subject:</span> {exam.subject}
                      </p>
                    )}
                    
                    {exam.exam_date && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-medium">Date:</span> {new Date(exam.exam_date).toLocaleDateString()}
                        {exam.exam_time && <span> at {exam.exam_time}</span>}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span className="font-medium">Status:</span> {exam.status}
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Created:</span> {formatDate(exam.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setEditingExam(exam)}
                    className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="examId" value={exam.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm('Are you sure you want to delete this exam schedule?')) {
                          e.preventDefault();
                        }
                      }}
                      className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Exam Schedules</h3>
            <p className="text-gray-600 dark:text-gray-400">Get started by creating your first exam schedule.</p>
          </div>
        )}
      </main>
    </div>
  );
}
