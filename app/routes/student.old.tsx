import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { useState } from 'react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Student Dashboard - CSEB Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  // Fetch all student-relevant data
  const [
    { data: assignments },
    { data: homework },
    { data: tests },
    { data: dailyUpdates },
    { data: syllabus },
    { data: seminars },
    { data: upcomingBirthdays }
  ] = await Promise.all([
    supabase
      .from('assignments')
      .select('*')
      .in('status', ['pending', 'completed'])
      .order('due_date', { ascending: true })
      .limit(5),
    
    supabase
      .from('homework')
      .select('*')
      .in('status', ['pending', 'completed'])
      .order('due_date', { ascending: true })
      .limit(5),
    
    supabase
      .from('tests')
      .select('*')
      .in('status', ['scheduled', 'ongoing'])
      .order('test_date', { ascending: true })
      .limit(5),
    
    supabase
      .from('daily_updates')
      .select('*')
      .eq('is_visible', true)
      .order('publish_date', { ascending: false })
      .limit(5),
    
    supabase
      .from('syllabus')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('seminars')
      .select('*')
      .in('status', ['scheduled'])
      .order('seminar_date', { ascending: true })
      .limit(3),
    
    supabase
      .from('birthdays')
      .select('*')
      .eq('status', 'active')
      .order('birth_date', { ascending: true })
      .limit(5)
  ]);

  return json({ 
    user,
    assignments: assignments || [],
    homework: homework || [],
    tests: tests || [],
    dailyUpdates: dailyUpdates || [],
    syllabus: syllabus || [],
    seminars: seminars || [],
    upcomingBirthdays: upcomingBirthdays || []
  });
};

export default function StudentDashboard() {
  const { 
    user, 
    assignments, 
    homework, 
    tests, 
    dailyUpdates, 
    syllabus, 
    seminars, 
    upcomingBirthdays 
  } = useLoaderData<typeof loader>();
  
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if we're on a nested route (not just /student)
  const isNestedRoute = location.pathname !== '/student';

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/student',
      icon: '🏠',
      description: 'Overview of all activities'
    },
    {
      name: 'Homework',
      href: '/student/homework',
      icon: '📚',
      description: 'View assigned homework'
    },
    {
      name: 'Assignments',
      href: '/student/assignments',
      icon: '📝',
      description: 'Track your assignments'
    },
    {
      name: 'Tests',
      href: '/student/tests',
      icon: '📊',
      description: 'Upcoming tests and results'
    },
    {
      name: 'Updates',
      href: '/student/updates',
      icon: '📢',
      description: 'Daily announcements'
    },
    {
      name: 'Seminars',
      href: '/student/seminars',
      icon: '🎓',
      description: 'Upcoming seminars'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user.registerNumber}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-lg dark:bg-slate-800/60 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-3">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isNestedRoute ? (
          <Outlet />
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Homework Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{homework.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Updates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dailyUpdates.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Assignments */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">📝 Recent Assignments</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">Due Soon</span>
              </div>
              
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-start space-x-4 p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {assignment.subject} • Due: {formatDate(assignment.due_date)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assignment.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : assignment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {assignment.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No active assignments</p>
                </div>
              )}
            </div>

            {/* Upcoming Tests */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">🎯 Upcoming Tests</h2>
              </div>
              
              {tests.length > 0 ? (
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div key={test.id} className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {test.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {test.subject} • {formatDate(test.test_date)} at {test.start_time}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Duration: {test.duration_minutes} mins
                          {test.total_marks && ` • Total Marks: ${test.total_marks}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming tests</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Daily Updates */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">📢 Daily Updates</h2>
              
              {dailyUpdates.length > 0 ? (
                <div className="space-y-4">
                  {dailyUpdates.map((update) => (
                    <div key={update.id} className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-white/20">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {update.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                          {update.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {update.category} • {formatDate(update.publish_date)}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {update.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No recent updates</p>
                </div>
              )}
            </div>

            {/* Homework */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">📚 Homework</h2>
              
              {homework.length > 0 ? (
                <div className="space-y-3">
                  {homework.map((hw) => (
                    <div key={hw.id} className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-white/20">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {hw.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {hw.subject} • Due: {formatDate(hw.due_date)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hw.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {hw.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          hw.difficulty === 'hard'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : hw.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {hw.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No homework assigned</p>
                </div>
              )}
            </div>

            {/* Upcoming Seminars */}
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">🎓 Upcoming Seminars</h2>
              
              {seminars.length > 0 ? (
                <div className="space-y-4">
                  {seminars.map((seminar) => (
                    <div key={seminar.id} className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-white/20">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {seminar.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Speaker: {seminar.speaker}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(seminar.seminar_date)} • {seminar.start_time} - {seminar.end_time}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        📍 {seminar.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming seminars</p>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
