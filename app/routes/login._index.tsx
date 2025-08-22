import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getUser } from '~/lib/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    // Redirect to appropriate dashboard based on user type
    if (user.type === 'admin') {
      return redirect('/admin');
    } else if (user.type === 'student') {
      return redirect('/student');
    }
  }
  return json({});
}

export default function LoginSelection() {
  return (
    <div className="min-h-screen oxford-blue-space flex items-center justify-center mobile-login-container animate-fade-in relative overflow-hidden">
      {/* Enhanced Dense Stars Field */}
      <div className="stars-field"></div>
      
      {/* Galaxies */}
      <div className="space-galaxy"></div>
      <div className="space-galaxy-2"></div>
      
      {/* Space Shuttle */}
      <div className="space-shuttle"></div>
      
      {/* Satellites */}
      <div className="satellite-1"></div>
      <div className="satellite-2"></div>
      
      {/* Floating Astronaut */}
      <div className="space-astronaut"></div>
      
      {/* Deep Space Nebula */}
      <div className="deep-space-nebula"></div>
      
      {/* Shooting Stars */}
      <div className="shooting-stars">
        <div className="shooting-star shooting-star-1"></div>
        <div className="shooting-star shooting-star-2"></div>
        <div className="shooting-star shooting-star-3"></div>
      </div>
      
      {/* Space Planets */}
      <div className="space-planet-1"></div>
      <div className="space-planet-2"></div>
      <div className="space-planet-3"></div>
      
      <div className="w-full max-w-md sm:max-w-2xl animate-slide-in-up relative z-10 mobile-content-container">
        {/* Header */}
        <div className="text-center mobile-header">
          <div className="mx-auto mobile-logo bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden group hover:glow-intense-blue animate-pulse-slow">
            {/* Header sparkles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
              <div className="absolute top-6 right-6 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-4 left-8 w-0.5 h-0.5 bg-blue-200 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-2 right-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
            </div>
            <svg className="w-6 h-6 sm:w-16 sm:h-16 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="mobile-title font-bold text-white" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            filter: 'brightness(1.0)',
            fontWeight: '700'
          }}>Welcome to CLG Portal</h1>
          <p className="mobile-subtitle text-blue-100 font-medium" style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
            filter: 'brightness(1.0)'
          }}>Choose your login method to continue</p>
        </div>

        {/* Login Options */}
        <div className="mobile-login-options flex flex-col">
          {/* Student Portal Card */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 glass-effect login-card-button mb-4" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)'}}>
            <div className="text-center p-6">
              <div className="mx-auto login-card-icon bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-2xl mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                Student Portal
              </h2>
              <p className="text-sm sm:text-base text-blue-100 mb-4" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                Focus on career growth
              </p>
              <Link
                to="/login/student"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student Login
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="text-xs text-blue-200/80 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                Access your student portal with register number and password
              </p>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 glass-effect login-card-button" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)'}}>
            <div className="text-center p-6">
              <div className="mx-auto login-card-icon bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                Admin Portal
              </h2>
              <p className="text-sm sm:text-base text-blue-100 mb-4" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                CSE-B Admin
              </p>
              <Link
                to="/login/admin"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Login
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="text-xs text-blue-200/80 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                Access admin dashboard with your pass key
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mobile-footer">
          <p className="text-xs sm:text-sm text-blue-300/60" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
            🚀 Secure login powered by modern authentication
          </p>
          <div className="flex items-center justify-center mt-3 space-x-4 text-blue-300/40">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">System Online</span>
            </div>
            <div className="w-px h-4 bg-blue-300/20"></div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
