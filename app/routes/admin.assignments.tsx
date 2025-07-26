import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Assignment Management - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  // Fetch existing assignments
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments:', error);
  }

  return json({ assignments: assignments || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const subject = formData.get('subject') as string;

    // Validate required fields (description is optional)
    if (!title || !dueDate || !subject) {
      return json({ error: 'Assignment topic, subject, and due date are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('assignments')
      .insert({
        title,
        description: description || '', // Optional field
        due_date: dueDate,
        subject,
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Assignment created successfully' });
  }

  if (intent === 'delete') {
    const assignmentId = formData.get('assignmentId') as string;
    
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Assignment deleted successfully' });
  }

  if (intent === 'updateStatus') {
    const assignmentId = formData.get('assignmentId') as string;
    const status = formData.get('status') as string;

    const { error } = await supabase
      .from('assignments')
      .update({ status })
      .eq('id', assignmentId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Assignment status updated successfully' });
  }

  if (intent === 'update') {
    const assignmentId = formData.get('assignmentId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const subject = formData.get('subject') as string;

    // Validate required fields (description is optional)
    if (!title || !dueDate || !subject) {
      return json({ error: 'Assignment topic, subject, and due date are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('assignments')
      .update({
        title,
        description: description || '', // Optional field
        due_date: dueDate,
        subject,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true, message: 'Assignment updated successfully' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function AssignmentManagement() {
  const { assignments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Hide forms after successful submission
  useEffect(() => {
    if (navigation.state === 'idle' && !('error' in (actionData || {}))) {
      setShowForm(false);
      setEditingAssignment(null);
      
      // Show success message briefly
      if (actionData && 'success' in actionData) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  }, [navigation.state, actionData]);

  // Clear success message when opening forms
  useEffect(() => {
    if (showForm || editingAssignment) {
      setShowSuccessMessage(false);
    }
  }, [showForm, editingAssignment]);

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                Assignment Management
              </h1>
            </div>
            
            <button
              onClick={() => {
                setEditingAssignment(null);
                setShowForm(!showForm);
              }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Assignment
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

        {/* Create Assignment Form */}
        {showForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New Assignment</h2>
            
            <Form method="post" className="space-y-6" key="create-form">
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignment Topic
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter assignment topic..."
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter subject name..."
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter assignment description and requirements (optional)..."
                />
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Assignment'}
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

        {/* Edit Assignment Form */}
        {editingAssignment && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Assignment</h2>
            
            <Form method="post" className="space-y-6" key={`edit-form-${editingAssignment.id}`}>
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="assignmentId" value={editingAssignment.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignment Topic
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    defaultValue={editingAssignment.title}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter assignment topic..."
                  />
                </div>

                <div>
                  <label htmlFor="edit-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="edit-subject"
                    name="subject"
                    defaultValue={editingAssignment.subject}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter subject name..."
                  />
                </div>

                <div>
                  <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="edit-dueDate"
                    name="dueDate"
                    defaultValue={editingAssignment.due_date}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  defaultValue={editingAssignment.description}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter assignment description and requirements..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Assignment'}
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

        {/* Status Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {assignments.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {assignments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {new Set(assignments.map(a => a.subject)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Assignments</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} total
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first assignment to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <div key={assignment.id} className={`bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                  editingAssignment?.id === assignment.id 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/20' 
                    : 'border-white/20'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {assignment.subject}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {assignment.description}
                  </p>

                  <div className="mb-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      assignment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      assignment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(assignment.created_at).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setShowForm(false);
                          setEditingAssignment(assignment);
                        }}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                        title="Edit Assignment"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                        <button 
                          type="submit"
                          className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                          title="Delete Assignment"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this assignment?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
