import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Check if we're on a nested route (not just /admin)
  const isNestedRoute = location.pathname !== '/admin';

  // Helper function to get color classes
  const getColorClasses = (feature: typeof adminFeatures[0], isActive: boolean) => {
    const baseColors = {
      'Assignments': {
        gradient: 'from-blue-600 to-blue-800',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'bg-blue-500',
        text: 'text-blue-600',
        hover: 'hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30'
      },
      'Daily Homework': {
        gradient: 'from-green-600 to-green-800',
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'bg-green-500',
        text: 'text-green-600',
        hover: 'hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30'
      },
      'Record': {
        gradient: 'from-purple-600 to-purple-800',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'bg-purple-500',
        text: 'text-purple-600',
        hover: 'hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30'
      },
      'Seminars': {
        gradient: 'from-violet-600 to-violet-800',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        icon: 'bg-violet-500',
        text: 'text-violet-600',
        hover: 'hover:from-violet-100 hover:to-violet-200 dark:hover:from-violet-900/30 dark:hover:to-violet-800/30'
      },
      'Exam Schedule': {
        gradient: 'from-red-600 to-red-800',
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: 'bg-red-500',
        text: 'text-red-600',
        hover: 'hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30'
      },
      'Calendar': {
        gradient: 'from-indigo-600 to-indigo-800',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        icon: 'bg-indigo-500',
        text: 'text-indigo-600',
        hover: 'hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30'
      },
      'Event': {
        gradient: 'from-cyan-600 to-cyan-800',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        icon: 'bg-cyan-500',
        text: 'text-cyan-600',
        hover: 'hover:from-cyan-100 hover:to-cyan-200 dark:hover:from-cyan-900/30 dark:hover:to-cyan-800/30'
      }
    };
    return baseColors[feature.name as keyof typeof baseColors] || baseColors['Assignments'];
  };

  const adminFeatures = [
    {
      name: 'Assignments',
      description: 'Assignment topic, subject, due date, description',
      icon: '📝 ',
      href: '/admin/assignments',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500'
    },
    {
      name: 'Daily Homework',
      description: 'Subject and description for daily homework',
      icon: '📚',
      href: '/admin/homework',
      color: 'from-green-600 to-green-800',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500'
    },
    {
      name: 'Record',
      description: 'Subject, date and description for records',
      icon: '📋',
      href: '/admin/record',
      color: 'from-purple-600 to-purple-800',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500'
    },
    {
      name: 'Seminars',
      description: 'Title, subject, date and description',
      icon: '🎓',
      href: '/admin/seminars',
      color: 'from-violet-600 to-violet-800',
      bgColor: 'bg-violet-50',
      iconBg: 'bg-violet-500'
    },
    {
      name: 'Exam Schedule',
      description: 'Exam title, subject and date',
      icon: '📊',
      href: '/admin/exams',
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-500'
    },
    {
      name: 'Calendar',
      description: 'View all dates and events (except daily homework)',
      icon: '📅',
      href: '/admin/calendar',
      color: 'from-indigo-600 to-indigo-800',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-500'
    },
    {
      name: 'Event',
      description: 'Event title, description and date',
      icon: '🎪',
      href: '/admin/events',
      color: 'from-cyan-600 to-cyan-800',
      bgColor: 'bg-cyan-50',
      iconBg: 'bg-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex relative overflow-hidden portrait-mobile-fix landscape-mobile-fix">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0 mobile-sidebar-open' : '-translate-x-full mobile-sidebar-fix'} fixed inset-y-0 left-0 z-50 ${sidebarExpanded ? 'w-64 mobile-sidebar-width' : 'w-20'} bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-blue-900/95 backdrop-blur-xl shadow-2xl border-r border-slate-700/50 transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col relative group portrait-sidebar mobile-sidebar-container xs-mobile-sidebar`}>
        {/* Sidebar Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg -m-1"></div>
        
        <div className="flex items-center h-16 px-4 border-b border-slate-600/70 bg-gradient-to-r from-blue-800/20 to-slate-700/20 relative z-10 mobile-header mobile-sidebar-header">
          <div className="flex items-center space-x-3 mobile-flex-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110 animate-pulse mobile-icon-lg mobile-no-scale border border-blue-400/30">
              <span className="text-white font-bold text-lg drop-shadow-sm">A</span>
            </div>
            {sidebarExpanded && (
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent whitespace-nowrap animate-fade-in mobile-text-lg mobile-overflow-fix">
                  Admin Panel
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  CLG Management
                </span>
              </div>
            )}
          </div>
        </div>
        
        <nav className="mt-5 px-2 flex-1 relative z-10 mobile-nav-container mobile-sidebar-nav">
          <div className="space-y-2 mobile-space-y-2">
            {adminFeatures.map((feature, index) => {
              const isActive = location.pathname === feature.href;
              const colors = getColorClasses(feature, isActive);
              
              return (
                <Link
                  key={feature.name}
                  to={feature.href}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when item is clicked
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden mobile-nav-item mobile-touch-target mobile-no-scale animate-slide-in-left ${!sidebarExpanded ? 'justify-center w-12 h-12 mx-auto' : 'w-full'} ${
                    isActive 
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg shadow-${colors.icon.replace('bg-', '')}-500/30` 
                      : `text-slate-200 hover:bg-gradient-to-r ${colors.hover} hover:text-white`
                  }`}
                  title={!sidebarExpanded ? `${feature.name} - ${feature.description}` : ''}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Active state indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 rounded-r-full"></div>
                  )}
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 ${colors.gradient} transition-opacity duration-500 rounded-xl mobile-bg-fix`}></div>
                  
                  <div className={`${!sidebarExpanded ? 'mx-0' : 'mr-3'} flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 relative z-10 mobile-icon mobile-no-scale flex items-center justify-center w-8 h-8 rounded-lg ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm text-white' 
                      : `${colors.bg} ${colors.text} group-hover:${colors.icon} group-hover:text-white bg-slate-700/30 border border-slate-600/30`
                  }`}>
                    <span className={`text-lg font-medium`}>
                      {feature.icon}
                    </span>
                  </div>
                  {sidebarExpanded && (
                    <div className="flex-1 min-w-0 relative z-10 mobile-nav-text">
                      <div className={`text-sm font-semibold truncate transition-colors duration-300 mobile-overflow-fix xs-mobile-text ${
                        isActive 
                          ? 'text-white' 
                          : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {feature.name}
                      </div>
                      <div className={`text-xs truncate transition-colors duration-300 mobile-overflow-fix ${
                        isActive 
                          ? 'text-white/80' 
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {feature.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button in Sidebar */}
        <div className="p-4 border-t border-slate-600/50 relative z-10 mobile-logout-container mobile-sidebar-footer">
          <Form action="/logout" method="post" className="w-full">
            <button
              type="submit"
              className={`w-full flex items-center justify-center px-3 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transform hover:scale-105 group relative overflow-hidden mobile-btn mobile-touch-target mobile-no-scale ${!sidebarExpanded ? 'w-12 h-12 mx-auto' : ''}`}
              title={!sidebarExpanded ? 'Logout' : ''}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 to-pink-400/0 group-hover:from-red-400/20 group-hover:to-pink-400/20 transition-all duration-500 rounded-xl"></div>
              
              <svg className={`w-4 h-4 ${sidebarExpanded ? 'mr-2' : ''} flex-shrink-0 relative z-10 transform group-hover:rotate-12 transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarExpanded && <span className="whitespace-nowrap relative z-10">Logout</span>}
            </button>
          </Form>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden mobile-overlay" aria-hidden="true">
          <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-blue-900/95 backdrop-blur-lg shadow-lg border-b border-slate-700/50 mobile-backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 mobile-header landscape-header">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mobile-touch-target transition-colors duration-200"
                >
                  <svg className="h-6 w-6 mobile-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:block p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                  title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarExpanded ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mobile-text-xl">
                    Dashboard
                  </h1>
                  <p className="text-sm text-slate-300 xs-mobile-text">CSE-B Admin</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-200 xs-mobile-text">Administrator</p>
                    <p className="text-xs text-slate-400">
                      {new Date(currentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mobile-icon-lg shadow-lg">
                    <span className="text-white text-sm font-semibold">AD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 relative mobile-content-wrapper mobile-scroll portrait-content landscape-content mobile-main-fix">
          {/* Content background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none mobile-bg-fix"></div>
          
          {isNestedRoute ? (
            <div className="relative z-10 mobile-container-fix">
              <Outlet />
            </div>
          ) : (
            <div className="relative z-10 mobile-container-fix">
              {/* Welcome Section */}
              <div className="mb-8 animate-fade-in mobile-welcome mobile-container-fix">
                <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden group hover:shadow-blue-500/10 transition-all duration-500 transform hover:scale-[1.01] mobile-backdrop-blur xs-mobile-padding mobile-shadow-md mobile-rounded mobile-no-scale">
                  {/* Subtle sparkling overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-700 mobile-bg-fix">
                    <div className="absolute top-8 right-16 w-0.5 h-0.5 bg-blue-300/60 rounded-full animate-twinkle"></div>
                    <div className="absolute bottom-12 left-20 w-0.5 h-0.5 bg-purple-300/60 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-20 left-1/3 w-0.5 h-0.5 bg-cyan-300/60 rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
                  </div>
                  
                  {/* Subtle card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10 space-y-4 lg:space-y-0 mobile-flex-col mobile-space-y-4">
                    <div className="animate-slide-in-left mobile-container-fix">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white animate-gradient-text mobile-text-2xl">
                        Welcome back, Administrator! 👋
                      </h2>
                      <p className="mt-2 md:mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300 mobile-text-lg xs-mobile-text">
                        Manage your educational platform with powerful administrative tools
                      </p>
                    </div>
                    
                    {/* Mobile Stats */}
                    <div className="lg:hidden grid grid-cols-2 gap-4 animate-slide-in-up mobile-grid-2 mobile-container-fix">
                      <div className="text-center bg-blue-500/10 rounded-lg p-3 xs-mobile-padding mobile-rounded">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mobile-text-xl">{studentCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Students</div>
                      </div>
                      <div className="text-center bg-green-500/10 rounded-lg p-3 xs-mobile-padding mobile-rounded">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mobile-text-xl">9</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Active Modules</div>
                      </div>
                    </div>
                    
                    {/* Desktop Stats */}
                    <div className="hidden lg:block animate-slide-in-right">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 mobile-grid mobile-stats mobile-container-fix">
                <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-4 md:p-6 relative group hover-glow-blue transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles mobile-backdrop-blur mobile-feature-card xs-mobile-padding mobile-shadow mobile-rounded mobile-no-scale" style={{animationDelay: '0.2s'}}>
                  {/* Card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-blue"></div>
                  
                  {/* Sparkling overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mobile-bg-fix">
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-twinkle"></div>
                    <div className="absolute top-4 left-4 w-1 h-1 bg-cyan-300 rounded-full animate-sparkle" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-3 right-6 w-1.5 h-1.5 bg-blue-300 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/50 transform group-hover:scale-110 transition-all duration-300 animate-pulse-slow group-hover:animate-neon-pulse mobile-icon-lg">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white mobile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 md:ml-4 min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate xs-mobile-text mobile-overflow-fix">Active Students</p>
                      <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white animate-pulse group-hover:animate-neon-pulse mobile-text-xl">{studentCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-4 md:p-6 relative group hover-glow-green transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles" style={{animationDelay: '0.4s'}}>
                  {/* Card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-green"></div>
                  
                  {/* Sparkling overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
                    <div className="absolute top-6 left-3 w-1 h-1 bg-emerald-300 rounded-full animate-sparkle" style={{animationDelay: '0.8s'}}></div>
                    <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-green-300 rounded-full animate-twinkle" style={{animationDelay: '1.2s'}}></div>
                  </div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg group-hover:shadow-green-500/50 transform group-hover:scale-110 transition-all duration-300 animate-pulse-slow group-hover:animate-neon-pulse" style={{animationDelay: '0.5s'}}>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 md:ml-4 min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 truncate">System Status</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse group-hover:animate-neon-pulse">Online</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 p-4 md:p-6 relative group hover-glow-purple transform hover:scale-105 transition-all duration-500 animate-fade-in sparkles sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.6s'}}>
                  {/* Card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl glow-intense-purple"></div>
                  
                  {/* Sparkling overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 right-4 w-2 h-2 bg-purple-400 rounded-full animate-twinkle" style={{animationDelay: '0.6s'}}></div>
                    <div className="absolute top-5 left-2 w-1 h-1 bg-pink-300 rounded-full animate-sparkle" style={{animationDelay: '1.1s'}}></div>
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
                  </div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/50 transform group-hover:scale-110 transition-all duration-300 animate-pulse-slow group-hover:animate-neon-pulse" style={{animationDelay: '1s'}}>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-3 md:ml-4 min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">Features</p>
                      <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white group-hover:animate-neon-pulse">9 Modules</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Features Grid */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 animate-fade-in animate-gradient-text">Administrative Modules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {adminFeatures.map((feature, index) => {
                    const colors = getColorClasses(feature, false);
                    return (
                      <Link
                        key={feature.name}
                        to={feature.href}
                        className="group relative overflow-hidden bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 sparkles animate-fade-in"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {/* Card glow effect with individual colors */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                        
                        {/* Sparkling overlay with feature-specific colors */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className={`absolute top-2 right-2 w-2 h-2 ${colors.icon} opacity-60 rounded-full animate-twinkle`} style={{animationDelay: `${index * 0.2}s`}}></div>
                          <div className={`absolute top-4 left-4 w-1 h-1 ${colors.icon} opacity-40 rounded-full animate-sparkle`} style={{animationDelay: `${index * 0.3}s`}}></div>
                          <div className={`absolute bottom-3 right-6 w-1.5 h-1.5 ${colors.icon} opacity-50 rounded-full animate-twinkle`} style={{animationDelay: `${index * 0.4}s`}}></div>
                        </div>
                        
                        <div className="p-4 md:p-6 relative z-10">
                          <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 ${colors.bg} rounded-xl flex items-center justify-center text-lg md:text-2xl shadow-lg group-hover:${colors.icon} group-hover:text-white transform group-hover:scale-110 transition-all duration-300 animate-pulse-slow group-hover:animate-neon-pulse`} style={{animationDelay: `${index * 0.1}s`}}>
                              <span className={`${colors.text} group-hover:text-white transition-colors duration-300`}>
                                {feature.icon}
                              </span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                              <svg className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:${colors.text} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                          <h3 className={`text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:${colors.text} transition-colors duration-300 group-hover:animate-neon-pulse`}>
                            {feature.name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 group-hover:h-2 group-hover:shadow-lg group-hover:shadow-${colors.icon.replace('bg-', '')}-500/50`}></div>
                        
                        {/* Shimmer effect overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 animate-shimmer transition-opacity duration-500 rounded-2xl"></div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}