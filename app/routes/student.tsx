import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useLocation, Form } from '@remix-run/react';
import { useState } from 'react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';
import { destroySession } from '~/lib/session.server'; // Assuming you have a session destruction utility

// Define types for TypeScript
interface User {
  name?: string;
  id?: string;
}

interface Data {
  user: User | null;
  homework: any[];
  assignments: any[];
  tests: any[];
  updates: any[];
  seminars: any[];
  syllabusItems: any[];
  birthdays: any[];
}

export const meta: MetaFunction = () => [{ title: 'Student Dashboard - CLG Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  try {
    const [homeworkRes, assignmentsRes, testsRes, updatesRes, seminarsRes, syllabusRes, birthdaysRes, recordsRes] = await Promise.all([
      supabase.from('homework').select('*'),
      supabase.from('assignments').select('*'),
      supabase.from('tests').select('*'),
      supabase.from('updates').select('*'),
      supabase.from('seminars').select('*'),
      supabase.from('syllabus').select('*'),
      supabase.from('birthdays').select('*'),
      supabase.from('records').select('*'),
    ]);

    const logErr = (name: string, { error }: { error: any }) => {
      if (error) console.error(`Error fetching ${name}:`, error.message || error);
    };
    logErr('homework', homeworkRes);
    logErr('assignments', assignmentsRes);
    logErr('tests', testsRes);
    logErr('updates', updatesRes);
    logErr('seminars', seminarsRes);
    logErr('syllabus', syllabusRes);
    logErr('birthdays', birthdaysRes);
    logErr('records', recordsRes);

    return json({
      user,
      homework: homeworkRes.data || [],
      assignments: assignmentsRes.data || [],
      tests: testsRes.data || [],
      updates: updatesRes.data || [],
      seminars: seminarsRes.data || [],
      syllabusItems: syllabusRes.data || [],
      birthdays: birthdaysRes.data || [],
      records: recordsRes.data || [],
    });
  } catch (error) {
    console.error('Loader error:', error);
    return json({ user, homework: [], assignments: [], tests: [], updates: [], seminars: [], syllabusItems: [], birthdays: [] }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await requireStudent(request);
  const sessionCookie = await destroySession(session);
  return redirect('/login', {
    headers: {
      'Set-Cookie': sessionCookie,
    },
  });
};

export default function StudentDashboard() {
  const { user, homework, assignments, tests, updates, seminars, syllabusItems, birthdays, records } = useLoaderData<any>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isNestedRoute = location.pathname !== '/student';
  const currentDate = new Date().toISOString();

  // --- Navigation Items ---
  const navigationItems = [
    { name: 'Dashboard', href: '/student', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" /></svg> },
    { name: 'Homework', href: '/student/homework', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { name: 'Assignments', href: '/student/assignments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, count: assignments.length },
    { name: 'Exams', href: '/student/exams', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9V5z" /></svg> },
    { name: 'Seminars', href: '/student/seminars', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" /></svg>, count: seminars.length },
    { name: 'Calendar', href: '/student/calendar', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4M16 2v4M3 10h18" /></svg> },
    { name: 'Events', href: '/student/events', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" /></svg> },
    { name: 'Record', href: '/student/record', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>, count: records.length },
  ];

  // --- Student Feature Quick Links ---
  const studentFeatures = [
    { name: 'Homework', description: 'Manage your homework assignments', icon: navigationItems[1].icon, href: '/student/homework', iconBg: 'bg-green-500', count: homework.length },
    { name: 'Record', description: 'View your academic records', icon: navigationItems[7].icon, href: '/student/record', iconBg: 'bg-purple-500', count: 0 },
    { name: 'Seminar', description: 'Discover upcoming seminars', icon: navigationItems[4].icon, href: '/student/seminars', iconBg: 'bg-violet-500', count: seminars.length },
    { name: 'Exam Schedules', description: 'View upcoming exam schedules', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4M16 2v4M4 10h16" /></svg>, href: '/student/exams', iconBg: 'bg-red-500', count: tests.length },
    { name: 'Calendar View', description: 'View academic calendar', icon: navigationItems[5].icon, href: '/student/calendar', iconBg: 'bg-teal-500', count: 0 },
    { name: 'Events', description: 'Stay updated with college events', icon: navigationItems[6].icon, href: '/student/events', iconBg: 'bg-orange-500', count: updates.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-slate-900/90 border-r border-gray-200 dark:border-slate-700
            transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0
          `}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="flex flex-col h-full">
            {/* LOGO */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🧑‍🎓</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Student Portal</span>
              </div>
            </div>
            {/* NAVIGATION */}
            <nav className="flex-1 px-2 py-6 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md font-medium text-[15px] transition-colors
                      ${isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                      }
                      space-x-3
                    `}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            {/* User Profile */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.[0]?.toUpperCase() ?? 'ST'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Student</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Portal User</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8" style={{ backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center justify-between h-16">
                {/* Hamburger for mobile */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                    aria-label="Toggle sidebar"
                    aria-expanded={sidebarOpen}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Student Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CLG Student Portal</p>
                  </div>
                </div>
                {/* Current User and Logout - right zone */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Student</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(currentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{user?.name?.[0]?.toUpperCase() ?? 'ST'}</span>
                    </div>
                  </div>
                  <Form method="post" action="/logout" className="ml-2">
                    <button
                      type="submit"
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-all duration-300"
                      aria-label="Logout"
                    >
                      <svg className="w-6 h-6 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          </header>
          {/* MAIN CONTENT ROUTER OUTLET */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isNestedRoute ? (
              <Outlet />
            ) : (
              <>
                {/* Welcome Section */}
                <div className="mb-6">
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.name || 'Student'}! 👋
                      </h2>
                      <p className="mt-1 text-gray-600 dark:text-gray-300 text-base">
                        Stay organized and track your academic progress with our student portal.
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
                {/* Buttons Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                  <Link
                    to="/student/homework"
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-transform duration-200 hover:scale-105 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Homework</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your homework assignments</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{homework.length}</span>
                  </Link>
                  <Link
                    to="/student/assignments"
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-transform duration-200 hover:scale-105 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Assignments</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your assignments</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</span>
                  </Link>
                  <Link
                    to="/student/seminars"
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-transform duration-200 hover:scale-105 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Seminars</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Discover upcoming seminars</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{seminars.length}</span>
                  </Link>
                  <Link
                    to="/student/record"
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-transform duration-200 hover:scale-105 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Record</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View your academic records</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{records.length}</span>
                  </Link>
                  <Link
                    to="/student/exams"
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-transform duration-200 hover:scale-105 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Exam Schedules</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View upcoming exam schedules</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</span>
                  </Link>
                  <Link
                    to="/student/events"
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-transform duration-200 hover:scale-105 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Events</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stay updated with college events</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{updates.length}</span>
                  </Link>
                </div>
                {/* Quick Access Grid (excluding Calendar) 
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {studentFeatures.filter(feature => feature.name !== 'Calendar View').map((feature) => (
                    <Link
                      key={feature.name}
                      to={feature.href}
                      className={`group block p-5 bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-transform duration-200 hover:scale-105`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${feature.iconBg} flex items-center justify-center`}>{feature.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                        {feature.count > 0 && (
                          <div className="text-right min-w-[2.2rem]">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{feature.count}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">items</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                */}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}