import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireStudent(request);
  
  // Fetch student profile data
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('register_number', user.registerNumber)
    .single();

  if (error) {
    console.error('Error fetching student profile:', error);
    return json({ student: null, registerNumber: user.registerNumber });
  }

  return json({ student, registerNumber: user.registerNumber });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireStudent(request);
  const formData = await request.formData();
  const action = formData.get('action');

  console.log('Profile action called:', { action, registerNumber: user.registerNumber });

  if (action === 'updateProfile') {
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');

    console.log('Update profile data:', { name, email, phone });

    if (typeof name !== 'string' || typeof email !== 'string' || typeof phone !== 'string') {
      console.log('Invalid form data types');
      return json({ error: 'Invalid form data', success: false }, { status: 400 });
    }

    console.log('Attempting to update student:', user.registerNumber);
    const { error } = await supabase
      .from('students')
      .update({
        name: name.trim(),
        email_id: email.trim(),
        mobile_number: phone.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('register_number', user.registerNumber);

    if (error) {
      console.error('Error updating profile:', error);
      return json({ error: 'Failed to update profile', success: false }, { status: 500 });
    }

    console.log('Profile updated successfully');
    return json({ success: true, message: 'Profile updated successfully!' });
  }

  if (action === 'changePassword') {
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
      return json({ error: 'Invalid form data', success: false }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return json({ error: 'New passwords do not match', success: false }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return json({ error: 'Password must be at least 8 characters long', success: false }, { status: 400 });
    }

    // Verify current password
    const { data: student } = await supabase
      .from('students')
      .select('password')
      .eq('register_number', user.registerNumber)
      .single();

    if (!student || student.password !== currentPassword) {
      return json({ error: 'Current password is incorrect', success: false }, { status: 400 });
    }

    // Update password
    const { error } = await supabase
      .from('students')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('register_number', user.registerNumber);

    if (error) {
      console.error('Error updating password:', error);
      return json({ error: 'Failed to update password', success: false }, { status: 500 });
    }

    return json({ success: true, message: 'Password updated successfully!' });
  }

  return json({ error: 'Invalid action', success: false }, { status: 400 });
}

export default function StudentProfile() {
  const { student, registerNumber } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  // Clear password form when password change is successful
  useEffect(() => {
    if (actionData?.success && activeTab === 'password') {
      if (passwordFormRef.current) {
        passwordFormRef.current.reset();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    }
  }, [actionData, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Success/Error Messages */}
        {actionData?.success && 'message' in actionData && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {actionData.message}
          </div>
        )}
        {actionData && 'error' in actionData && actionData.error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {actionData.error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'password'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Profile Information
            </h2>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="action" value="updateProfile" />
              
              {/* Register Number (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Register Number
                </label>
                <input
                  type="text"
                  value={registerNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Register number cannot be changed
                </p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={student?.name || ''}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={student?.email_id || ''}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={student?.mobile_number || ''}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Update Profile
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Change Password
            </h2>
            <Form ref={passwordFormRef} method="post" className="space-y-6">
              <input type="hidden" name="action" value="changePassword" />
              
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full px-3 py-2 pr-12 sm:pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white password-input-mobile mobile-input-focus text-base"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center password-toggle-mobile mobile-password-toggle w-10 h-10 sm:w-auto sm:h-auto justify-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <svg className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showCurrentPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    className="w-full px-3 py-2 pr-12 sm:pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white password-input-mobile mobile-input-focus text-base"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center password-toggle-mobile mobile-password-toggle w-10 h-10 sm:w-auto sm:h-auto justify-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <svg className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showNewPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-3 py-2 pr-12 sm:pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white password-input-mobile mobile-input-focus text-base"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center password-toggle-mobile mobile-password-toggle w-10 h-10 sm:w-auto sm:h-auto justify-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Change Password
                </button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
