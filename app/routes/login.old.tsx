import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import { useState } from 'react';

import { authenticateStudent, authenticateAdmin } from '~/lib/auth.server';
import { createUserSession, getUser } from '~/lib/session.server';

export const meta: MetaFunction = () => [{ title: 'Login' }];

type ActionData = {
  errors?: {
    registerNumber?: string | null;
    password?: string | null;
    passKey?: string | null;
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
  const loginType = formData.get('loginType');
  const redirectTo = formData.get('redirectTo') || '/';

  if (loginType === 'student') {
    const registerNumber = formData.get('registerNumber');
    const password = formData.get('password');
    const remember = formData.get('remember');

    if (
      typeof registerNumber !== 'string' ||
      typeof password !== 'string' ||
      typeof redirectTo !== 'string'
    ) {
      return json(
        { errors: { registerNumber: null, password: null, form: 'Form not submitted correctly.' } },
        { status: 400 }
      );
    }

    if (registerNumber.length === 0) {
      return json(
        { errors: { registerNumber: 'Register number is required', password: null, form: null } },
        { status: 400 }
      );
    }

    if (password.length === 0) {
      return json(
        { errors: { registerNumber: null, password: 'Password is required', form: null } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return json(
        { errors: { registerNumber: null, password: 'Password is too short', form: null } },
        { status: 400 }
      );
    }

    const student = await authenticateStudent(registerNumber, password);
    if (!student) {
      return json(
        { errors: { registerNumber: null, password: null, form: 'Invalid register number or password' } },
        { status: 400 }
      );
    }

    return createUserSession({
      redirectTo: '/student',
      remember: remember === 'on',
      request,
      userId: student.id,
      userType: 'student',
      registerNumber: student.registerNumber,
    });
  } else if (loginType === 'admin') {
    const passKey = formData.get('passKey');

    if (typeof passKey !== 'string' || typeof redirectTo !== 'string') {
      return json(
        { errors: { passKey: null, form: 'Form not submitted correctly.' } },
        { status: 400 }
      );
    }

    if (passKey.length === 0) {
      return json(
        { errors: { passKey: 'Pass key is required', form: null } },
        { status: 400 }
      );
    }

    const isValidAdmin = authenticateAdmin(passKey);
    if (!isValidAdmin) {
      return json(
        { errors: { passKey: null, form: 'Invalid pass key' } },
        { status: 400 }
      );
    }

    return createUserSession({
      redirectTo: '/admin',
      remember: false,
      request,
      userId: 'admin',
      userType: 'admin',
    });
  }

  return json(
    { errors: { form: 'Invalid login type' } },
    { status: 400 }
  );
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const actionData = useActionData<ActionData>();
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>
        </div>

        {/* Login Type Selector */}
        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setLoginType('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'student'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Admin Login
            </button>
          </div>
        </div>

        <Form method="post" className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="loginType" value={loginType} />

          {loginType === 'student' ? (
            <>
              <div>
                <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Register Number
                </label>
                <div className="mt-1">
                  <input
                    id="registerNumber"
                    name="registerNumber"
                    type="text"
                    autoComplete="username"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    aria-invalid={actionData?.errors?.registerNumber ? true : undefined}
                    aria-describedby="registerNumber-error"
                  />
                  {actionData?.errors?.registerNumber ? (
                    <div className="pt-1 text-red-700 dark:text-red-400" id="registerNumber-error">
                      {actionData.errors.registerNumber}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    aria-invalid={actionData?.errors?.password ? true : undefined}
                    aria-describedby="password-error"
                  />
                  {actionData?.errors?.password ? (
                    <div className="pt-1 text-red-700 dark:text-red-400" id="password-error">
                      {actionData.errors.password}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="passKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin Pass Key
              </label>
              <div className="mt-1">
                <input
                  id="passKey"
                  name="passKey"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  aria-invalid={actionData?.errors?.passKey ? true : undefined}
                  aria-describedby="passKey-error"
                />
                {actionData?.errors?.passKey ? (
                  <div className="pt-1 text-red-700 dark:text-red-400" id="passKey-error">
                    {actionData.errors.passKey}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {actionData?.errors?.form ? (
            <div className="pt-1 text-red-700 dark:text-red-400" id="form-error">
              {actionData.errors.form}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign in
          </button>

          {loginType === 'student' && (
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline"
                  to="/register"
                >
                  Sign up
                </Link>
              </span>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
