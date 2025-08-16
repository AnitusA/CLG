import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, Link } from '@remix-run/react';
import { useState } from 'react';
import { authenticateStudent } from '~/lib/auth.server';
import { createUserSession, getUserId } from '~/lib/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect('/');
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const registerNumber = formData.get('registerNumber');
  const password = formData.get('password');

  if (typeof registerNumber !== 'string' || typeof password !== 'string') {
    return json({ error: 'Invalid form data' }, { status: 400 });
  }

  if (registerNumber.length === 0) {
    return json({ error: 'Register number is required' }, { status: 400 });
  }

  if (password.length === 0) {
    return json({ error: 'Password is required' }, { status: 400 });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    console.log('🔐 Login attempt:', { registerNumber, password, clientIP });
    const student = await authenticateStudent(registerNumber, password, clientIP);
    console.log('🔐 Authentication result:', { student: !!student, studentData: student });
    
    if (!student) {
      console.log('❌ Authentication failed for:', registerNumber);
      return json({ error: 'Invalid register number or password' }, { status: 400 });
    }

    console.log('✅ Authentication successful, creating session for:', registerNumber);
    return createUserSession({
      request,
      userId: student.id,
      userType: 'student',
      registerNumber: student.registerNumber,
      remember: false,
      redirectTo: '/student',
    });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }, { status: 400 });
  }
}

export default function StudentLogin() {
  const actionData = useActionData<typeof action>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen oxford-blue-space flex items-center justify-center mobile-login-container animate-fade-in relative overflow-hidden">
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
      
      <div className="w-full max-w-sm mx-auto animate-slide-in-up relative z-10 mobile-content-container px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-blue-200 hover:text-white transition-all duration-300 group transform hover:scale-105 mobile-back-button text-sm"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to login options</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6 mobile-login-header">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-2xl relative overflow-hidden group hover:glow-intense-blue animate-bounce-slow mobile-logo">
            {/* Header sparkles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
              <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-blue-200 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-3 left-6 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-2 right-3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
            </div>
            <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 mobile-title" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            filter: 'brightness(1.0)',
            fontWeight: '700'
          }}>Welcome Back</h1>
          <p className="text-sm text-blue-100 font-medium mobile-subtitle" style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
            filter: 'brightness(1.0)'
          }}>Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-blue-800/30 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-blue-500/30 relative group hover:shadow-blue-400/40 transition-all duration-500 hover:glow-intense-blue animate-shimmer transform hover:scale-102 mobile-login-card">
          {/* Card sparkles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-4 left-4 w-0.5 h-0.5 bg-blue-400 rounded-full animate-twinkle"></div>
            <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-indigo-400 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute bottom-12 left-8 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{animationDelay: '0.6s'}}></div>
            <div className="absolute bottom-4 right-4 w-0.5 h-0.5 bg-blue-300 rounded-full animate-twinkle" style={{animationDelay: '0.9s'}}></div>
            <div className="absolute top-16 left-1/2 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-twinkle" style={{animationDelay: '1.2s'}}></div>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4 relative overflow-hidden">
            {/* Header sparkles */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1 left-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
              <div className="absolute top-2 right-6 w-0.5 h-0.5 bg-blue-200 rounded-full animate-twinkle" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute bottom-1 left-8 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-twinkle" style={{animationDelay: '1.4s'}}></div>
            </div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center animate-borderPulse">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Student Portal</h2>
            </div>
          </div>

          {/* Error Message */}
          {actionData?.error && (
            <div className="mx-4 mt-4 p-3 bg-red-900/50 border-l-4 border-red-400 rounded-r-lg backdrop-blur-sm animate-shake">
              <div className="flex">
                <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-200 text-sm">{actionData.error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="p-4 relative z-10 mobile-login-form">
            <Form method="post" className="space-y-6">
              <div className="group animate-slide-in-left">
                <label htmlFor="registerNumber" className="block text-sm font-semibold text-blue-200 mb-2">
                  Register Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2" />
                    </svg>
                  </div>
                  <input
                    id="registerNumber"
                    name="registerNumber"
                    type="text"
                    required
                    placeholder="Enter your register number"
                    className="block w-full pl-10 pr-3 py-3 border-2 border-blue-500/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 bg-blue-900/30 focus:bg-blue-800/50 hover:border-blue-400/50 text-base placeholder-blue-300 text-white backdrop-blur-sm mobile-login-input"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              <div className="group animate-slide-in-right">
                <label htmlFor="password" className="block text-sm font-semibold text-blue-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className="block w-full pl-12 py-4 border-2 border-blue-500/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 bg-blue-900/30 focus:bg-blue-800/50 hover:border-blue-400/50 text-lg placeholder-blue-300 text-white backdrop-blur-sm md:transform md:focus:scale-105 mobile-login-input password-input-mobile"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-mobile hover:bg-blue-600/30 rounded-r-2xl transition-all duration-200 touch-manipulation text-blue-400 hover:text-blue-300 flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden group hover:glow-intense-blue animate-pulse-slow active:scale-95 mobile-submit-button"
              >
                {/* Button sparkles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 left-8 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
                  <div className="absolute top-3 right-12 w-0.5 h-0.5 bg-blue-200 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-2 left-16 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
                </div>
                
                <svg className="w-6 h-6 mr-3 relative z-10 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="relative z-10">Sign in as Student</span>
              </button>
            </Form>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-blue-800/40 to-indigo-800/40 px-8 py-6 relative overflow-hidden backdrop-blur-sm">
            {/* Help section sparkles */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 left-8 w-0.5 h-0.5 bg-blue-400 rounded-full animate-twinkle"></div>
              <div className="absolute bottom-2 right-12 w-0.5 h-0.5 bg-indigo-400 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-blue-200 relative z-10">
              <div className="w-8 h-8 bg-blue-600/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Use your student register number and password to login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
