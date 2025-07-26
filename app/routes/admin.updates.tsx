import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Daily Updates - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const { data: updates, error } = await supabase
    .from('daily_updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching updates:', error);
  }

  return json({ updates: updates || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;

    const { error } = await supabase
      .from('daily_updates')
      .insert({
        title,
        content,
        category,
        is_visible: visibility === 'visible',
        publish_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/updates');
  }

  if (intent === 'delete') {
    const updateId = formData.get('updateId') as string;
    
    const { error } = await supabase
      .from('daily_updates')
      .delete()
      .eq('id', updateId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/updates');
  }

  if (intent === 'toggle') {
    const updateId = formData.get('updateId') as string;
    const currentStatus = formData.get('currentStatus') as string;
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    const { error } = await supabase
      .from('daily_updates')
      .update({ status: newStatus })
      .eq('id', updateId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/updates');
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function DailyUpdates() {
  const { updates } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  const getTodaysUpdates = () => {
    const today = new Date().toISOString().split('T')[0];
    return updates.filter(update => 
      new Date(update.created_at).toISOString().split('T')[0] === today
    );
  };

  const getUpdatesByCategory = (category: string) => {
    return updates.filter(update => update.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-orange-900/20 dark:to-slate-900">
      {/* Header */}
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                📢 Daily Updates
              </h1>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Update
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Updates</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{getTodaysUpdates().length}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {updates.filter(u => u.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Announcements</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getUpdatesByCategory('announcement').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Updates</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{updates.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Update Form */}
        {showForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New Update</h2>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Update Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter update title..."
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="academic">📚 Academic</option>
                    <option value="event">🎉 Event</option>
                    <option value="schedule">📅 Schedule Change</option>
                    <option value="reminder">⏰ Reminder</option>
                    <option value="news">📰 News</option>
                    <option value="emergency">🚨 Emergency</option>
                    <option value="general">ℹ️ General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Students</option>
                    <option value="class1">Class 1 Only</option>
                    <option value="class2">Class 2 Only</option>
                    <option value="seniors">Senior Students</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter detailed update content. Use clear and concise language..."
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
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Update'}
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

        {/* Updates List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Updates</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {updates.length} update{updates.length !== 1 ? 's' : ''} total
            </span>
          </div>

          {updates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No updates posted yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first daily update to keep students informed.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Create First Update
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className={`bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all ${
                  update.status === 'draft' ? 'opacity-70' : ''
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {update.title}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {update.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          update.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {update.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>By Admin</span>
                        <span>•</span>
                        <span>{new Date(update.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>Category: {update.category}</span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {update.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="updateId" value={update.id} />
                        <input type="hidden" name="currentStatus" value={update.status} />
                        <button 
                          type="submit"
                          className={`p-2 rounded-lg transition-colors ${
                            update.status === 'published'
                              ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={update.status === 'published' ? 'Move to draft' : 'Publish update'}
                        >
                          {update.status === 'published' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </Form>

                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="updateId" value={update.id} />
                        <button 
                          type="submit"
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this update?')) {
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
