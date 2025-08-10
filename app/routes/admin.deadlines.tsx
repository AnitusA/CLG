import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';
import { AdminPageHeader } from '~/components/AdminPageHeader';

export const meta: MetaFunction = () => [{ title: 'Deadline Management - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*')
    .order('deadline_date', { ascending: true });

  if (error) {
    console.error('Error fetching deadlines:', error);
  }

  return json({ deadlines: deadlines || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const deadlineDate = formData.get('deadlineDate') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;

    const { error } = await supabase
      .from('deadlines')
      .insert({
        title,
        description,
        deadline_date: deadlineDate,
        category,
        priority,
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/deadlines');
  }

  if (intent === 'delete') {
    const deadlineId = formData.get('deadlineId') as string;
    
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', deadlineId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/deadlines');
  }

  if (intent === 'toggle') {
    const deadlineId = formData.get('deadlineId') as string;
    const currentStatus = formData.get('currentStatus') as string;
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    
    const { error } = await supabase
      .from('deadlines')
      .update({ status: newStatus })
      .eq('id', deadlineId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/deadlines');
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function DeadlineManagement() {
  const { deadlines } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);

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
      <AdminPageHeader 
        title="Deadline Management" 
        icon={
          <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        }
        onAddNew={() => setShowForm(!showForm)}
      />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Create Deadline Form */}
        {showForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Set New Deadline</h2>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter deadline title..."
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="assignment">Assignment Submission</option>
                    <option value="project">Project Deadline</option>
                    <option value="exam">Exam Registration</option>
                    <option value="application">Application Deadline</option>
                    <option value="fee">Fee Payment</option>
                    <option value="event">Event Registration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="deadlineDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="deadlineDate"
                    name="deadlineDate"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description & Instructions
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter deadline description and any special instructions..."
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
                  {isSubmitting ? 'Creating...' : 'Set Deadline'}
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

        {/* Deadlines List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Deadlines</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {deadlines.length} deadline{deadlines.length !== 1 ? 's' : ''} tracked
            </span>
          </div>

          {deadlines.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deadlines set</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Set your first deadline to start tracking important dates.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Set First Deadline
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline) => {
                const timeRemaining = getTimeRemaining(deadline.deadline_date);
                return (
                  <div 
                    key={deadline.id} 
                    className={`bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all ${
                      deadline.status === 'completed' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className={`text-lg font-semibold ${
                            deadline.status === 'completed' 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {deadline.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            deadline.priority === 'urgent' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : deadline.priority === 'high'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                              : deadline.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {deadline.priority}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {deadline.category}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {deadline.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(deadline.deadline_date).toLocaleString()}
                            </span>
                            <span className={`font-medium ${timeRemaining.color}`}>
                              {timeRemaining.text}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="toggle" />
                              <input type="hidden" name="deadlineId" value={deadline.id} />
                              <input type="hidden" name="currentStatus" value={deadline.status} />
                              <button 
                                type="submit"
                                className={`p-2 rounded-lg transition-colors ${
                                  deadline.status === 'completed'
                                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                title={deadline.status === 'completed' ? 'Mark as active' : 'Mark as completed'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </Form>

                            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="delete" />
                              <input type="hidden" name="deadlineId" value={deadline.id} />
                              <button 
                                type="submit"
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                onClick={(e) => {
                                  if (!confirm('Are you sure you want to delete this deadline?')) {
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
