import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { getUserId } from '~/lib/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect('/');
  return json({});
}

export default function LoginSelection() {
  return (
    <div className="min-h-screen oxford-blue-space flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      {/* Stars Field */}
      <div className="stars-field"></div>
      
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
      
      {/* Satellite */}
      <div className="space-satellite"></div>
      
      <div className="w-full max-w-2xl animate-slide-in-up relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group hover:glow-intense-blue animate-pulse-slow">
            {/* Header sparkles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
              <div className="absolute top-6 right-6 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-4 left-8 w-0.5 h-0.5 bg-blue-200 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-2 right-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
            </div>
            <svg className="w-16 h-16 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-white mb-5" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            filter: 'brightness(1.0)',
            fontWeight: '700'
          }}>Welcome Back</h1>
          <p className="text-2xl text-blue-100 font-medium" style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
            filter: 'brightness(1.0)'
          }}>Sign in to access your account</p>
        </div>

        {/* Login Options Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Login Section */}
          <div className="space-y-6 animate-slide-in-left">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-indigo-300 mb-2">Student Portal</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <Link
              to="/login/student"
              className="block w-full group"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-indigo-500/30 transition-all duration-700 transform hover:scale-101 border border-indigo-400/20 overflow-hidden relative hover:glow-intense-purple">
                {/* Student sparkles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500">
                  <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-twinkle"></div>
                  <div className="absolute top-12 right-8 w-0.5 h-0.5 bg-purple-300 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute bottom-8 left-12 w-0.5 h-0.5 bg-blue-300 rounded-full animate-twinkle" style={{animationDelay: '0.6s'}}></div>
                  <div className="absolute bottom-4 right-6 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-twinkle" style={{animationDelay: '0.9s'}}></div>
                  <div className="absolute top-20 left-1/2 w-0.5 h-0.5 bg-purple-200 rounded-full animate-twinkle" style={{animationDelay: '1.2s'}}></div>
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="p-10 relative z-10">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-indigo-400/50 transition-all duration-700 hover:scale-105">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                        Student Login
                      </h3>
                      <p className="text-blue-200 leading-relaxed">
                        Access your student portal with register number and password
                      </p>
                    </div>
                    <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors transform group-hover:translate-x-2 duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Admin Login Section */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-emerald-300 mb-2">Admin Portal</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto rounded-full"></div>
            </div>
            
            <Link
              to="/login/admin"
              className="block w-full group"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-emerald-500/30 transition-all duration-700 transform hover:scale-101 border border-emerald-400/20 overflow-hidden relative hover:glow-intense-green">
                {/* Admin sparkles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500">
                  <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-twinkle"></div>
                  <div className="absolute top-12 right-8 w-0.5 h-0.5 bg-green-300 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute bottom-8 left-12 w-0.5 h-0.5 bg-teal-300 rounded-full animate-twinkle" style={{animationDelay: '0.6s'}}></div>
                  <div className="absolute bottom-4 right-6 w-0.5 h-0.5 bg-emerald-200 rounded-full animate-twinkle" style={{animationDelay: '0.9s'}}></div>
                  <div className="absolute top-20 left-1/2 w-0.5 h-0.5 bg-green-200 rounded-full animate-twinkle" style={{animationDelay: '1.2s'}}></div>
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 to-green-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="p-10 relative z-10">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-emerald-400/50 transition-all duration-700 hover:scale-105">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                        Admin Login
                      </h3>
                      <p className="text-blue-200 leading-relaxed">
                        Access administrative dashboard with pass key
                      </p>
                    </div>
                    <div className="text-emerald-400 group-hover:text-emerald-300 transition-colors transform group-hover:translate-x-2 duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="relative">
            <p className="text-sm text-blue-300 mb-4">
              Secure access to your educational portal
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}