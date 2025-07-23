import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { useState } from 'react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Student Dashboard - CLG Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  // Get statistics from database
  const { data: homework, error: homeworkError } = await supabase
    .from('homework')
    .select('*');

  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*');

  const { data: tests, error: testsError } = await supabase
    .from('tests')
    .select('*');

  const { data: updates, error: updatesError } = await supabase
    .from('updates')
    .select('*');

  const { data: seminars, error: seminarsError } = await supabase
    .from('seminars')
    .select('*');

  const { data: syllabusItems, error: syllabusError } = await supabase
    .from('syllabus')
    .select('*');

  const { data: birthdays, error: birthdaysError } = await supabase
    .from('birthdays')
    .select('*');

  if (homeworkError) console.error('Error fetching homework:', homeworkError);
  if (assignmentsError) console.error('Error fetching assignments:', assignmentsError);
  if (testsError) console.error('Error fetching tests:', testsError);
  if (updatesError) console.error('Error fetching updates:', updatesError);
  if (seminarsError) console.error('Error fetching seminars:', seminarsError);
  if (syllabusError) console.error('Error fetching syllabus:', syllabusError);
  if (birthdaysError) console.error('Error fetching birthdays:', birthdaysError);

  return json({ 
    user,
    homework: homework || [],
    assignments: assignments || [],
    tests: tests || [],
    updates: updates || [],
    seminars: seminars || [],
    syllabusItems: syllabusItems || [],
    birthdays: birthdays || [],
    currentDate: new Date().toISOString()
  });
};

export default function StudentDashboard() {
  const { user, homework, assignments, tests, updates, seminars, syllabusItems, birthdays, currentDate } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== '/student';

  const studentFeatures = [
    {
      name: 'Homework',
      description: 'View your homework assignments',
      icon: '📚',
      href: '/student/homework',
      color: 'from-green-600 to-green-800',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500',
      count: homework.length
    },
    {
      name: 'Assignments',
      description: 'Track your assignment submissions',
      icon: '📝',
      href: '/student/assignments',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      count: assignments.length
    },
    {
      name: 'Tests',
      description: 'View upcoming tests and results',
      icon: '📋',
      href: '/student/tests',
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-500',
      count: tests.length
    },
    {
      name: 'Updates',
      description: 'Stay updated with announcements',
      icon: '📢',
      href: '/student/updates',
      color: 'from-orange-600 to-orange-800',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      count: updates.length
    },
    {
      name: 'Seminars',
      description: 'Discover upcoming seminars',
      icon: '🎓',
      href: '/student/seminars',
      color: 'from-violet-600 to-violet-800',
      bgColor: 'bg-violet-50',
      iconBg: 'bg-violet-500',
      count: seminars.length
    },
    {
      name: 'Syllabus',
      description: 'Access course curriculum',
      icon: '📖',
      href: '/student/syllabus',
      color: 'from-teal-600 to-teal-800',
      bgColor: 'bg-teal-50',
      iconBg: 'bg-teal-500',
      count: syllabusItems.length
    },
    {
      name: 'Birthdays',
      description: 'Celebrate with classmates',
      icon: '🎂',
      href: '/student/birthdays',
      color: 'from-pink-600 to-pink-800',
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500',
      count: birthdays.length
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 ${sidebarExpanded ? 'w-64' : 'w-20'} bg-white/90 backdrop-blur-lg dark:bg-slate-900/90 shadow-xl border-r border-white/20 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {sidebarExpanded && (
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                Student Portal
              </span>
            )}
          </div>
        </div>
        
        <nav className="mt-5 px-2 flex-1">
          <div className="space-y-1">
            {studentFeatures.map((feature) => (
              <Link
                key={feature.name}
                to={feature.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${!sidebarExpanded ? 'justify-center w-12 h-12 mx-auto' : 'w-full'} ${location.pathname === feature.href ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''}`}
                title={!sidebarExpanded ? `${feature.name} - ${feature.description}` : ''}
              >
                <span className={`text-xl ${!sidebarExpanded ? 'mx-0' : 'mr-3'} flex-shrink-0`}>{feature.icon}</span>
                {sidebarExpanded && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{feature.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {feature.description}
                      </div>
                    </div>
                    {feature.count > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {feature.count}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button in Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Form action="/logout" method="post" className="w-full">
            <button
              type="submit"
              className={`w-full flex items-center justify-center px-3 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl ${!sidebarExpanded ? 'w-12 h-12 mx-auto' : ''}`}
              title={!sidebarExpanded ? 'Logout' : ''}
            >
              <svg className={`w-4 h-4 ${sidebarExpanded ? 'mr-2' : ''} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarExpanded && <span className="whitespace-nowrap">Logout</span>}
            </button>
          </Form>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden="true">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarExpanded ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Student Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CLG Student Portal</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Student</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(currentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">ST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isNestedRoute ? (
            <Outlet />
          ) : (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, Student! 👋
                      </h2>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Stay organized and track your academic progress with our student portal
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-500">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Homework</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{homework.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-500">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignments</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{assignments.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-red-500">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tests</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{tests.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-500">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Updates</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{updates.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Access Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentFeatures.map((feature) => (
                  <Link
                    key={feature.name}
                    to={feature.href}
                    className={`group block p-6 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${feature.iconBg}`}>
                        <span className="text-2xl">{feature.icon}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                      {feature.count > 0 && (
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {feature.count}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">items</p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
