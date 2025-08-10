import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, Link } from '@remix-run/react';
import { useState } from 'react';
import { authenticateAdmin } from '~/lib/auth.server';
import { createUserSession, getUserId } from '~/lib/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect('/');
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const passKey = formData.get('passKey');

  if (typeof passKey !== 'string') {
    return json({ error: 'Invalid form data' }, { status: 400 });
  }

  if (passKey.length === 0) {
    return json({ error: 'Pass key is required' }, { status: 400 });
  }

  const isValidAdmin = authenticateAdmin(passKey);
  if (!isValidAdmin) {
    return json({ error: 'Invalid pass key' }, { status: 400 });
  }

  return createUserSession({
    request,
    userId: 'admin',
    userType: 'admin',
    remember: false,
    redirectTo: '/admin',
  });
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-slide-in-up">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-blue-200 hover:text-white transition-colors duration-300 hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to login options</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-2xl hover:glow-intense-green animate-pulse-slow relative overflow-hidden group">
            {/* Header sparkles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
              <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-emerald-200 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-3 left-5 w-0.5 h-0.5 bg-green-200 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
            </div>
            <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-blue-200">Enter your admin pass key to access the dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-emerald-400/20 hover:glow-intense-green relative">
          {/* Card sparkles */}
          <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-500">
            <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-twinkle"></div>
            <div className="absolute top-12 right-8 w-0.5 h-0.5 bg-green-300 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute bottom-8 left-12 w-0.5 h-0.5 bg-teal-300 rounded-full animate-twinkle" style={{animationDelay: '0.6s'}}></div>
          </div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 relative z-10">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-xl font-semibold text-white">Administrative Access</h2>
            </div>
          </div>

          {/* Error Message */}
          {actionData?.error && (
            <div className="mx-6 mt-6 p-4 bg-red-500/10 border-l-4 border-red-400 rounded-r-lg backdrop-blur-sm">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-300 text-sm">{actionData.error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="p-6 relative z-10">
            <Form method="post" className="space-y-6">
              <div>
                <label htmlFor="passKey" className="block text-sm font-medium text-white mb-2">
                  Admin Pass Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                    </svg>
                  </div>
                  <input
                    id="passKey"
                    name="passKey"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter admin pass key"
                    className="block w-full pl-10 pr-12 py-3 border border-emerald-400/20 rounded-lg bg-white/5 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-emerald-400 hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-emerald-400 hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-2xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105 hover:glow-intense-green animate-shimmer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Sign in as Admin
              </button>
            </Form>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-500/10 border-l-4 border-amber-400 mx-6 mb-6 p-4 rounded-r-lg backdrop-blur-sm">
            <div className="flex">
              <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-amber-300 text-sm font-medium">Admin access required for system management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
