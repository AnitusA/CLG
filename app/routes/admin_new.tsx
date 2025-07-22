import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { useState } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Admin Dashboard - CLG Management System' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAdmin(request);
  
  // Get statistics from Supabase
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  return json({ 
    user, 
    studentCount: studentCount || 0,
    currentDate: new Date().toISOString()
  });
};

export default function AdminDashboard() {
  const { user, studentCount, currentDate } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminFeatures = [
    {
      name: 'Assignments',
      description: 'Create and manage student assignments',
      icon: '📝',
      href: '/admin/assignments',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500'
    },
    {
      name: 'Record Ending Date',
      description: 'Set and track important deadlines',
      icon: '📅',
      href: '/admin/deadlines',
      color: 'from-purple-600 to-purple-800',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500'
    },
    {
      name: 'Daily Homework',
      description: 'Assign and track daily homework',
      icon: '📚',
      href: '/admin/homework',
      color: 'from-green-600 to-green-800',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500'
    },
    {
      name: 'Daily Updates',
      description: 'Post daily announcements and updates',
      icon: '📢',
      href: '/admin/updates',
      color: 'from-orange-600 to-orange-800',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-500'
    },
    {
      name: 'Notes',
      description: 'Manage study notes and resources',
      icon: '📋',
      href: '/admin/notes',
      color: 'from-indigo-600 to-indigo-800',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-500'
    },
    {
      name: 'Test Updates',
      description: 'Schedule and manage test announcements',
      icon: '📊',
      href: '/admin/tests',
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-500'
    },
    {
      name: 'Syllabus',
      description: 'Update and manage course syllabus',
      icon: '📖',
      href: '/admin/syllabus',
      color: 'from-teal-600 to-teal-800',
      bgColor: 'bg-teal-50',
      iconBg: 'bg-teal-500'
    },
    {
      name: 'Birthday Dates',
      description: 'Track and celebrate student birthdays',
      icon: '🎉',
      href: '/admin/birthdays',
      color: 'from-pink-600 to-pink-800',
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500'
    },
    {
      name: 'Seminars',
      description: 'Organize and schedule seminars',
      icon: '🎓',
      href: '/admin/seminars',
      color: 'from-violet-600 to-violet-800',
      bgColor: 'bg-violet-50',
      iconBg: 'bg-violet-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-lg dark:bg-slate-900/90 shadow-xl border-r border-white/20 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
        </div>
        
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {adminFeatures.map((feature) => (
              <Link
                key={feature.name}
                to={feature.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="mr-3 text-lg">{feature.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{feature.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {feature.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Form action="/logout" method="post" className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
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
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CLG Management System</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Administrator</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(currentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">AD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, Administrator! 👋
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Manage your educational platform with powerful administrative tools
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{studentCount}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">9</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Active Modules</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{studentCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Features</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">9 Modules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Features Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Administrative Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminFeatures.map((feature, index) => (
                <Link
                  key={feature.name}
                  to={feature.href}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center text-2xl shadow-lg`}>
                        {feature.icon}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
