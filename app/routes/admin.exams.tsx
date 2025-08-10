import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';
import { AdminPageHeader } from '~/components/AdminPageHeader';

// ExamForm Component for adding subjects one by one
function ExamForm({ onCancel, editingExam = null }: { onCancel: () => void; editingExam?: any }) {
  const [examType, setExamType] = useState(editingExam?.exam_type || '');
  const [subjects, setSubjects] = useState(editingExam ? [{ name: editingExam.subject, date: editingExam.exam_date, time: editingExam.exam_time }] : [{ name: '', date: '', time: '' }]);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const addSubject = () => {
    setSubjects([...subjects, { name: '', date: '', time: '' }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: string, value: string) => {
    const updated = subjects.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    );
    setSubjects(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    // Don't prevent default - let Remix handle it
    
    // Validate
    if (!examType.trim()) {
      e.preventDefault();
      alert('Please enter exam type');
      return;
    }
    
    const validSubjects = subjects.filter(s => s.name.trim());
    if (validSubjects.length === 0) {
      e.preventDefault();
      alert('Please add at least one subject');
      return;
    }

    // Set the subjects data in a hidden input before submission
    const form = e.target as HTMLFormElement;
    const subjectsInput = form.querySelector('input[name="subjectsData"]') as HTMLInputElement;
    if (subjectsInput) {
      subjectsInput.value = JSON.stringify(validSubjects);
    }
    
    // Let Remix handle the form submission naturally
  };

  return (
    <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
      <input type="hidden" name="intent" value={editingExam ? "update" : "create"} />
      {editingExam && <input type="hidden" name="examId" value={editingExam.id} />}
      <input type="hidden" name="subjectsData" />
      <input type="hidden" name="examType" value={examType} />
      
      <div>
        <label htmlFor="examType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exam Title *
        </label>
        <input
          type="text"
          id="examType"
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
          placeholder="Enter exam title (e.g., Mid Term Exams, Final Exams, Unit Test 1)..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subjects with Dates & Times *
          </label>
          <button
            type="button"
            onClick={addSubject}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subject
          </button>
        </div>

        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-slate-700/50">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => updateSubject(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Enter subject name..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={subject.date}
                  onChange={(e) => updateSubject(index, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Exam Time
                  </label>
                  <input
                    type="time"
                    value={subject.time}
                    onChange={(e) => updateSubject(index, 'time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Remove subject"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add each subject with its specific exam date and time. You can add multiple subjects under the same exam title.
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? (editingExam ? 'Updating...' : 'Creating...') : (editingExam ? 'Update Exam Schedule' : 'Create Exam Schedule')}
        </button>
      </div>
    </Form>
  );
}

export const meta: MetaFunction = () => [{ title: 'Exam Schedule Management - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  try {
    // Try the new schema first (exams + exam_subjects)
    const { data: exams, error: examError } = await supabase
      .from('exams')
      .select(`
        *,
        exam_subjects (
          id,
          subject,
          exam_date
        )
      `)
      .order('created_at', { ascending: false });

    if (!examError && exams) {
      // Transform the data to flatten it for easier display
      const flattenedExams = [];
      for (const exam of exams) {
        if (exam.exam_subjects && exam.exam_subjects.length > 0) {
          for (const subject of exam.exam_subjects) {
            flattenedExams.push({
              id: subject.id,
              exam_id: exam.id,
              exam_name: exam.exam_name,
              exam_type: exam.exam_name,
              subject: subject.subject,
              exam_date: subject.exam_date,
              exam_time: null, // Not available in current schema
              status: exam.status,
              created_at: exam.created_at,
              updated_at: exam.updated_at
            });
          }
        } else {
          // Include exam even if it has no subjects
          flattenedExams.push({
            id: exam.id,
            exam_id: exam.id,
            exam_name: exam.exam_name,
            exam_type: exam.exam_name,
            subject: null,
            exam_date: null,
            exam_time: null,
            status: exam.status,
            created_at: exam.created_at,
            updated_at: exam.updated_at
          });
        }
      }
      return json({ exams: flattenedExams });
    }
    
    // Fallback: try simple exams table
    const { data: simpleExams, error: simpleError } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (simpleError) {
      console.error('Error fetching exams:', simpleError);
      return json({ exams: [] });
    }

    return json({ exams: simpleExams || [] });
  } catch (error) {
    console.error('Loader error:', error);
    return json({ exams: [] });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const examType = formData.get('examType') as string;
    const subjectsData = formData.get('subjectsData') as string;

    // Validate required fields
    if (!examType || !subjectsData) {
      return json({ error: 'Exam type and subjects are required' }, { status: 400 });
    }

    let subjects;
    try {
      subjects = JSON.parse(subjectsData);
    } catch {
      return json({ error: 'Invalid subjects data' }, { status: 400 });
    }

    if (!subjects || subjects.length === 0) {
      return json({ error: 'At least one subject is required' }, { status: 400 });
    }

    // First, create the exam
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        exam_name: examType,
        status: 'active'
      })
      .select()
      .single();

    if (examError) {
      return json({ error: examError.message }, { status: 400 });
    }

    // Then, create the exam subjects
    const examSubjects = subjects.map((subject: any) => ({
      exam_id: examData.id,
      subject: subject.name,
      exam_date: subject.date || null
    }));

    const { error: subjectsError } = await supabase
      .from('exam_subjects')
      .insert(examSubjects);

    if (subjectsError) {
      // Clean up the exam if subjects failed to insert
      await supabase.from('exams').delete().eq('id', examData.id);
      return json({ error: subjectsError.message }, { status: 400 });
    }

    return json({ success: true, message: 'Exam schedule created successfully' });
  }

  if (intent === 'delete') {
    const examId = formData.get('examId') as string;
    
    // This will delete from exam_subjects table (individual subject)
    const { error } = await supabase
      .from('exam_subjects')
      .delete()
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Subject deleted successfully' });
  }

  if (intent === 'update') {
    const examId = formData.get('examId') as string;
    const examType = formData.get('examType') as string;
    const subjectsData = formData.get('subjectsData') as string;

    // Validate required fields
    if (!examType || !subjectsData) {
      return json({ error: 'Exam type and subjects are required' }, { status: 400 });
    }

    let subjects;
    try {
      subjects = JSON.parse(subjectsData);
    } catch {
      return json({ error: 'Invalid subjects data' }, { status: 400 });
    }

    if (!subjects || subjects.length === 0) {
      return json({ error: 'At least one subject is required' }, { status: 400 });
    }

    // For update, we'll update the single exam subject entry
    const subject = subjects[0]; // Take the first subject for the current exam subject entry
    const { error } = await supabase
      .from('exam_subjects')
      .update({
        subject: subject.name,
        exam_date: subject.date || null
      })
      .eq('id', examId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Subject updated successfully' });
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
      <AdminPageHeader 
        title="Exam Schedule Management" 
        icon={
          <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        }
        onAddNew={() => {
          setEditingExam(null);
          setShowForm(!showForm);
        }}
      />

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
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">Create New Exam Schedule</h2>
            
            <ExamForm onCancel={() => setShowForm(false)} />

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
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">Edit Exam Schedule</h2>
            
            <ExamForm onCancel={() => setEditingExam(null)} editingExam={editingExam} />

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

        {/* Exam Schedules Grid */}
        <div className="space-y-6">
          {Object.entries(
            exams.reduce((grouped: any, exam) => {
              const examTitle = exam.exam_name || exam.exam_type;
              if (!grouped[examTitle]) {
                grouped[examTitle] = [];
              }
              grouped[examTitle].push(exam);
              return grouped;
            }, {})
          ).map(([examTitle, examSubjects]) => {
            const subjects = examSubjects as any[];
            return (
            <div key={examTitle} className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                    {examTitle}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingExam(subjects[0])}
                      className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Subjects & Schedule:</h4>
                  <div className="grid gap-3">
                    {subjects.map((exam: any) => (
                      <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="inline-block bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium px-3 py-1 rounded-full">
                              {exam.subject}
                            </span>
                            {exam.exam_date && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                📅 {new Date(exam.exam_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                            {exam.exam_time && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                🕐 {exam.exam_time}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            exam.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {exam.status}
                          </span>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="examId" value={exam.id} />
                            <button
                              type="submit"
                              onClick={(e) => {
                                if (!confirm(`Are you sure you want to delete ${exam.subject} from this exam schedule?`)) {
                                  e.preventDefault();
                                }
                              }}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Delete this subject"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </Form>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total subjects: {subjects.length} • Created: {formatDate(subjects[0]?.created_at)}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
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