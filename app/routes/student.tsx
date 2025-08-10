import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useLocation, Form } from '@remix-run/react';
import { useState } from 'react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';
import { destroySession, getSession } from '~/lib/session.server';

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
    const [homeworkRes, assignmentsRes, testsRes, updatesRes, seminarsRes, syllabusRes, birthdaysRes, recordsRes, eventsRes] = await Promise.all([
      // Homework: Only homework updated within the last 24 hours
      supabase.from('homework')
        .select('*')
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      // Assignments: Only active (not past due date)
      supabase.from('assignments')
        .select('*')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .eq('status', 'active'),
      supabase.from('tests').select('*'),
      supabase.from('updates').select('*'),
      // Seminars: Only active and scheduled (not past date)
      supabase.from('seminars')
        .select('*')
        .gte('seminar_date', new Date().toISOString().split('T')[0])
        .in('status', ['active', 'scheduled']),
      supabase.from('syllabus').select('*'),
      supabase.from('birthdays').select('*'),
      // Records: Only future dates (not filtered by status)
      supabase.from('records')
        .select('*')
        .gte('record_date', new Date().toISOString().split('T')[0])
        .order('record_date', { ascending: true }),
      // Events: Only active (not past date)
      supabase.from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .eq('status', 'active'),
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
    logErr('events', eventsRes);

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
      events: eventsRes.data || [],
    });
  } catch (error) {
    console.error('Loader error:', error);
    return json({ user, homework: [], assignments: [], tests: [], updates: [], seminars: [], syllabusItems: [], birthdays: [], records: [], events: [] }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const sessionCookie = await destroySession(session);
  return redirect('/login', {
    headers: {
      'Set-Cookie': sessionCookie,
    },
  });
};

export default function StudentDashboard() {
  const { user, homework, assignments, tests, updates, seminars, syllabusItems, birthdays, records, events } = useLoaderData<any>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isNestedRoute = location.pathname !== '/student';
  const currentDate = new Date().toISOString();

  // --- Navigation Items ---
  const navigationItems = [
    { name: 'Dashboard', href: '/student', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" /></svg> },
    { name: 'Homework', href: '/student/homework', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, count: homework.length },
    { name: 'Assignments', href: '/student/assignments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, count: assignments.length },
    { name: 'Exams', href: '/student/exams', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9V5z" /></svg> },
    { name: 'Seminars', href: '/student/seminars', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" /></svg>, count: seminars.length },
    { name: 'Calendar', href: '/student/calendar', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4M16 2v4M3 10h18" /></svg> },
    { name: 'Events', href: '/student/events', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" /></svg>, count: events?.length || 0 },
    { name: 'Record', href: '/student/record', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>, count: records.length },
  ];

  // --- Student Feature Quick Links ---
  const studentFeatures = [
    { name: 'Homework', description: 'Manage your homework assignments (posted >24h ago)', icon: navigationItems[1].icon, href: '/student/homework', iconBg: 'bg-red-500', count: homework.length },
    { name: 'Record', description: 'View your academic records', icon: navigationItems[7].icon, href: '/student/record', iconBg: 'bg-red-600', count: records.length },
    { name: 'Seminar', description: 'Discover upcoming seminars', icon: navigationItems[4].icon, href: '/student/seminars', iconBg: 'bg-red-700', count: seminars.length },
    { name: 'Exam Schedules', description: 'View upcoming exam schedules', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4M16 2v4M4 10h16" /></svg>, href: '/student/exams', iconBg: 'bg-red-600', count: tests.length },
    { name: 'Calendar View', description: 'View academic calendar', icon: navigationItems[5].icon, href: '/student/calendar', iconBg: 'bg-red-700', count: 0 },
    { name: 'Events', description: 'Stay updated with college events', icon: navigationItems[6].icon, href: '/student/events', iconBg: 'bg-red-500', count: events?.length || 0 },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="flex h-screen overflow-hidden relative z-10">
        {/* SIDEBAR */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-slate-900/90 border-r border-gray-200 dark:border-slate-700
            transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0
            backdrop-blur-xl group hover-glow-red student-mobile-sidebar
          `}
        >
          <div className="flex flex-col h-full">
            {/* LOGO */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-700 animate-fade-in">
              <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg hover:shadow-red-500/25 transform hover:scale-110 transition-all duration-300">
                  <span className="text-white font-bold text-sm">🧑‍🎓</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Student Portal</span>
              </div>
            </div>
            {/* NAVIGATION */}
            <nav className="flex-1 px-2 py-6 space-y-1">
              {navigationItems.map((item, index) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 group
                      ${isActive
                        ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/50 dark:to-rose-900/50 dark:text-red-300 shadow-lg hover-glow-red'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:text-gray-300 dark:hover:from-slate-800 dark:hover:to-slate-700'
                      }
                      space-x-3 hover:scale-105 hover:translate-x-2 animate-slide-in-left
                    `}
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{item.icon}</span>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg group-hover:shadow-red-500/25 animate-pulse">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            {/* User Profile */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700 animate-fade-in" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-red-500/25">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.[0]?.toUpperCase() ?? 'ST'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Student</p>
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
          <header className="bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30 backdrop-blur-xl animate-fade-in student-mobile-header">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left side - Hamburger and Title */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 lg:hidden transform hover:scale-110 transition-all duration-300 student-mobile-hamburger"
                    aria-label="Toggle sidebar"
                    aria-expanded={sidebarOpen}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  <div className="group student-header-group flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent animate-gradient-text group-hover:scale-105 transition-transform duration-300 student-mobile-title truncate">
                      Student Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300 student-mobile-subtitle truncate">Focus on career growth</p>
                  </div>
                </div>
                
                {/* Right side - User info and Logout */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="text-right group">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Student</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(currentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{user?.name?.[0]?.toUpperCase() ?? 'ST'}</span>
                    </div>
                  </div>
                  
                  {/* Logout Button - Edge right position on mobile */}
                  <Form method="post" action="/logout" className="ml-auto">
                    <button
                      type="submit"
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 mobile-logout-edge"
                      aria-label="Logout"
                      title="Logout"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT ROUTER OUTLET */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 student-mobile-main">
            {isNestedRoute ? (
              <Outlet />
            ) : (
              <>
                {/* Welcome Section */}
                <div className="mb-6">
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:justify-between student-mobile-welcome">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.name || 'Student'}! 👋
                      </h2>
                      <p className="mt-1 text-gray-600 dark:text-gray-300 text-base">
                        Stay organized and track your academic progress with our student portal.
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Buttons Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 student-mobile-grid">
                  <Link
                    to="/student/homework"
                    className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-6 relative group hover-glow-red transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles"
                    style={{animationDelay: '0.2s'}}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-red"></div>
                    
                    {/* Sparkling overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-twinkle"></div>
                      <div className="absolute top-4 left-4 w-1 h-1 bg-rose-300 rounded-full animate-sparkle" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-3 right-6 w-1.5 h-1.5 bg-red-300 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg group-hover:shadow-red-500/50 transform group-hover:scale-110 transition-all duration-300 group-hover:animate-neon-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Homework</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your homework assignments</p>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-red-600 dark:text-red-400 animate-pulse group-hover:animate-neon-pulse">{homework.length}</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/student/assignments"
                    className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-6 relative group hover-glow-pink transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles"
                    style={{animationDelay: '0.4s'}}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-pink"></div>
                    
                    {/* Sparkling overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-3 right-3 w-2 h-2 bg-pink-400 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
                      <div className="absolute top-6 left-3 w-1 h-1 bg-rose-300 rounded-full animate-sparkle" style={{animationDelay: '0.8s'}}></div>
                      <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-pink-300 rounded-full animate-twinkle" style={{animationDelay: '1.2s'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg group-hover:shadow-pink-500/50 transform group-hover:scale-110 transition-all duration-300 group-hover:animate-neon-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">Assignments</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your assignments</p>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-pink-600 dark:text-pink-400 animate-pulse group-hover:animate-neon-pulse">{assignments.length}</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/student/seminars"
                    className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-6 relative group hover-glow-cyan transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles"
                    style={{animationDelay: '0.6s'}}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg group-hover:shadow-cyan-500/25 transform group-hover:scale-110 transition-all duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">Seminars</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Discover upcoming seminars</p>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 animate-pulse">{seminars.length}</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/student/record"
                    className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-6 relative group hover-glow-green transform hover:scale-105 transition-all duration-500 animate-fade-in"
                    style={{animationDelay: '0.8s'}}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg group-hover:shadow-green-500/25 transform group-hover:scale-110 transition-all duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Record</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">View your academic records</p>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse">{records.length}</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/student/exams"
                    className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-6 relative group hover-glow-purple transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles"
                    style={{animationDelay: '1s'}}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-purple"></div>
                    
                    {/* Sparkling overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 right-4 w-2 h-2 bg-purple-400 rounded-full animate-twinkle" style={{animationDelay: '0.6s'}}></div>
                      <div className="absolute top-5 left-2 w-1 h-1 bg-violet-300 rounded-full animate-sparkle" style={{animationDelay: '1.1s'}}></div>
                      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/50 transform group-hover:scale-110 transition-all duration-300 group-hover:animate-neon-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9V5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Exam Schedules</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">View upcoming exam schedules</p>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 animate-pulse group-hover:animate-neon-pulse">{tests.length}</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/student/events"
                    className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-6 relative group hover-glow-pink transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles"
                    style={{animationDelay: '1.2s'}}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-pink"></div>
                    
                    {/* Sparkling overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-3 right-3 w-2 h-2 bg-pink-400 rounded-full animate-twinkle" style={{animationDelay: '0.4s'}}></div>
                      <div className="absolute top-6 left-5 w-1 h-1 bg-rose-300 rounded-full animate-sparkle" style={{animationDelay: '0.9s'}}></div>
                      <div className="absolute bottom-3 right-7 w-1.5 h-1.5 bg-pink-300 rounded-full animate-twinkle" style={{animationDelay: '1.3s'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg group-hover:shadow-pink-500/50 transform group-hover:scale-110 transition-all duration-300 group-hover:animate-neon-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">Events</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Stay updated with college events</p>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-pink-600 dark:text-pink-400 animate-pulse">{events?.length || 0}</span>
                    </div>
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