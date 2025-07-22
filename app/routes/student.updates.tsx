import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Updates - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  const { data: dailyUpdates, error } = await supabase
    .from('daily_updates')
    .select('*')
    .eq('is_visible', true)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching updates:', error);
  }

  return json({ 
    user,
    dailyUpdates: dailyUpdates || []
  });
};

export default function StudentUpdates() {
  const { dailyUpdates } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return '🚨';
      case 'medium':
      case 'normal':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const todayUpdates = dailyUpdates.filter(update => {
    const today = new Date().toDateString();
    const updateDate = new Date(update.publish_date).toDateString();
    return today === updateDate;
  });

  const olderUpdates = dailyUpdates.filter(update => {
    const today = new Date().toDateString();
    const updateDate = new Date(update.publish_date).toDateString();
    return today !== updateDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📢 Daily Updates & Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with the latest announcements and important information
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Updates</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{dailyUpdates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{todayUpdates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {dailyUpdates.filter(u => u.priority === 'high' || u.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Updates */}
      {todayUpdates.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🗓️ Today's Updates</h2>
          <div className="space-y-4">
            {todayUpdates.map((update) => (
              <div 
                key={update.id} 
                className={`rounded-lg p-4 border-l-4 ${getPriorityColor(update.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getPriorityIcon(update.priority)}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{update.title}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{update.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>📅 {formatDate(update.publish_date)}</span>
                      <span>🕐 {formatTime(update.publish_date)}</span>
                      {update.author && <span>👤 {update.author}</span>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(update.priority).split(' ')[0]} ${getPriorityColor(update.priority).split(' ')[1]}`}>
                    {update.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previous Updates */}
      {olderUpdates.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📋 Previous Updates</h2>
          <div className="space-y-4">
            {olderUpdates.map((update) => (
              <div 
                key={update.id} 
                className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20 opacity-90"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getPriorityIcon(update.priority)}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{update.title}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{update.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>📅 {formatDate(update.publish_date)}</span>
                      <span>🕐 {formatTime(update.publish_date)}</span>
                      {update.author && <span>👤 {update.author}</span>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(update.priority).split(' ')[0]} ${getPriorityColor(update.priority).split(' ')[1]}`}>
                    {update.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Updates */}
      {dailyUpdates.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No updates available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            No announcements or updates have been posted yet. Check back later.
          </p>
        </div>
      )}
    </div>
  );
}
