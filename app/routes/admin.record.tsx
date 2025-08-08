import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import React from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Records Management - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const { data: records, error } = await supabase
    .from('records')
    .select('*')
    .order('record_date', { ascending: true });

  if (error) {
    console.error('Error fetching deadlines:', error);
  }

  return json({ records: records || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const recordDate = formData.get('dueDate') as string;

    // Validate required fields
    if (!subject || !description || !recordDate) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('records')
      .insert({
        subject,
        description,
        record_date: recordDate
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: 'Record created successfully!' });
  }

  if (intent === 'delete') {
    const recordId = formData.get('recordId') as string;
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', recordId);
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ success: 'Record deleted successfully!' });
  }

  if (intent === 'toggle') {
    const recordId = formData.get('recordId') as string;
    const currentStatus = formData.get('currentStatus') as string;
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    const { error } = await supabase
      .from('records')
      .update({ status: newStatus })
      .eq('id', recordId);
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ success: 'Record status updated successfully!' });
  }

  if (intent === 'edit') {
    const recordId = formData.get('recordId') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const recordDate = formData.get('dueDate') as string;

    if (!subject || !description || !recordDate) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('records')
      .update({
        subject,
        description,
        record_date: recordDate
      })
      .eq('id', recordId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ success: 'Record updated successfully!' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function DeadlineManagement() {
  const { records } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ subject: string; description: string; record_date: string } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle success responses
  React.useEffect(() => {
    if (navigation.state === 'idle' && actionData?.success) {
      setShowForm(false);
      setEditId(null);
      setEditValues(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  }, [navigation.state, actionData]);

  // Clear success message when opening forms
  React.useEffect(() => {
    if (showForm || editId) {
      setShowSuccessMessage(false);
    }
  }, [showForm, editId]);

  // Reset editId after successful edit
  React.useEffect(() => {
    if (navigation.state === 'idle' && editId !== null) {
      setEditId(null);
    }
  }, [navigation.state]);

  const isSubmitting = navigation.state === 'submitting';

  const getTimeRemaining = (deadlineDate: string) => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const timeDiff = deadline.getTime() - now.getTime();
    
    if (timeDiff < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400' };
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    if (days > 7) return { text: `${days} days left`, color: 'text-green-600 dark:text-green-400' };
    if (days > 3) return { text: `${days} days left`, color: 'text-yellow-600 dark:text-yellow-400' };
    if (days > 0) return { text: `${days} days left`, color: 'text-orange-600 dark:text-orange-400' };
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    return { text: `${hours} hours left`, color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                📅 Records Management
              </h1>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Record
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && actionData?.success && (
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
        {actionData?.error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">{actionData.error}</p>
            </div>
          </div>
        )}

        {/* Create Deadline Form */}
        {showForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New Record</h2>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter description and requirements..."
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Record'}
                </button>
              </div>
            </Form>

            {actionData?.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{actionData.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Records List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Records</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {records.length} record{records.length !== 1 ? 's' : ''} tracked
            </span>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No records set</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Set your first record to start tracking important deadlines.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Set First Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const timeRemaining = getTimeRemaining(record.record_date);
                // If editing this record, show edit form
                if (editId === record.id) {
                  // Format date for HTML input type="date"
                  let dateValue = record.record_date;
                  if (dateValue && typeof dateValue === 'string' && dateValue.length > 10) {
                    dateValue = dateValue.slice(0, 10);
                  }
                  return (
                    <div key={record.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20">
                      <Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="edit" />
                        <input type="hidden" name="recordId" value={record.id} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="edit-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                            <input
                              type="text"
                              id="edit-subject"
                              name="subject"
                              required
                              defaultValue={record.subject}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                            <input
                              type="date"
                              id="edit-dueDate"
                              name="dueDate"
                              required
                              defaultValue={dateValue}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                          <textarea
                            id="edit-description"
                            name="description"
                            rows={4}
                            required
                            defaultValue={record.description}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setEditId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                          >
                            Save Changes
                          </button>
                        </div>
                      </Form>
                    </div>
                  );
                }
                // Default record card
                return (
                  <div 
                    key={record.id} 
                    className={`bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all ${
                      record.status === 'completed' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className={`text-lg font-semibold ${
                            record.status === 'completed' 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {record.subject}
                          </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {record.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(record.record_date).toLocaleDateString()}
                            </span>
                            <span className={`font-medium ${timeRemaining.color}`}>
                              {timeRemaining.text}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="toggle" />
                              <input type="hidden" name="recordId" value={record.id} />
                              <input type="hidden" name="currentStatus" value={record.status} />
                              <button 
                                type="submit"
                                className={`p-2 rounded-lg transition-colors ${
                                  record.status === 'completed'
                                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                title={record.status === 'completed' ? 'Mark as active' : 'Mark as completed'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </Form>

                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              onClick={() => {
                                setEditId(record.id);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="delete" />
                              <input type="hidden" name="recordId" value={record.id} />
                              <button 
                                type="submit"
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                onClick={(e) => {
                                  if (!confirm('Are you sure you want to delete this record?')) {
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