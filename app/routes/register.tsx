import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams, useNavigation } from '@remix-run/react';

import { createStudent } from '~/lib/auth.server';
import { createUserSession, getUser } from '~/lib/session.server';
import { validatePasswordStrength } from '~/lib/password.server';

export const meta: MetaFunction = () => [{ title: 'Student Registration - College Management' }];

type ActionData = {
  errors?: {
    registerNumber?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    form?: string | null;
  };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (user) {
    if (user.type === 'student') {
      return redirect('/student');
    } else if (user.type === 'admin') {
      return redirect('/admin');
    }
  }
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const registerNumber = formData.get('registerNumber');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const redirectTo = formData.get('redirectTo') || '/student';

  // Type validation
  if (
    typeof registerNumber !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return json<ActionData>(
      { errors: { form: 'Form not submitted correctly.' } },
      { status: 400 }
    );
  }

  // Input validation
  if (registerNumber.length === 0) {
    return json<ActionData>(
      { errors: { registerNumber: 'Register number is required' } },
      { status: 400 }
    );
  }

  if (registerNumber.length < 3) {
    return json<ActionData>(
      { errors: { registerNumber: 'Register number must be at least 3 characters long' } },
      { status: 400 }
    );
  }

  if (password.length === 0) {
    return json<ActionData>(
      { errors: { password: 'Password is required' } },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json<ActionData>(
      { errors: { password: 'Password must be at least 6 characters long' } },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return json<ActionData>(
      { errors: { confirmPassword: 'Passwords do not match' } },
      { status: 400 }
    );
  }

  // Validate password strength using the password utility
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return json<ActionData>(
      { errors: { password: passwordValidation.errors[0] } }, // Show first error
      { status: 400 }
    );
  }

  try {
    // Create student with secure password hashing
    const student = await createStudent(registerNumber, password);
    
    // Create user session
    return createUserSession({
      redirectTo,
      remember: false,
      request,
      userId: student.id,
      userType: 'student',
      registerNumber: student.register_number,
    });
  } catch (error) {
    return json<ActionData>(
      { errors: { form: error instanceof Error ? error.message : 'Failed to create account' } },
      { status: 400 }
    );
  }
};

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/student';
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Create Student Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join our college management system
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/80 backdrop-blur-lg dark:bg-slate-800/80 rounded-2xl shadow-xl border border-white/20 p-8">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            {/* Global Error */}
            {actionData?.errors?.form && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-3 text-sm text-red-800 dark:text-red-200">
                    {actionData.errors.form}
                  </p>
                </div>
              </div>
            )}

            {/* Register Number Field */}
            <div>
              <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Register Number
              </label>
              <input
                id="registerNumber"
                name="registerNumber"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your register number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                aria-invalid={actionData?.errors?.registerNumber ? true : undefined}
                aria-describedby="registerNumber-error"
              />
              {actionData?.errors?.registerNumber && (
                <p id="registerNumber-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {actionData.errors.registerNumber}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Create a strong password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              {actionData?.errors?.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {actionData.errors.password}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Password must contain at least 6 characters with uppercase, lowercase, and numbers
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                aria-invalid={actionData?.errors?.confirmPassword ? true : undefined}
                aria-describedby="confirmPassword-error"
              />
              {actionData?.errors?.confirmPassword && (
                <p id="confirmPassword-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {actionData.errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
