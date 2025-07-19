import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';

import { createStudent } from '~/lib/auth.server';
import { createUserSession, getUser } from '~/lib/session.server';

export const meta: MetaFunction = () => [{ title: 'Sign Up' }];

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

  if (registerNumber.length === 0) {
    return json<ActionData>(
      { errors: { registerNumber: 'Register number is required' } },
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
      { errors: { password: 'Password is too short (minimum 6 characters)' } },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return json<ActionData>(
      { errors: { confirmPassword: 'Passwords do not match' } },
      { status: 400 }
    );
  }

  try {
    const student = await createStudent(registerNumber, password);
    
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

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Student Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please fill in your details to register
          </p>
        </div>

        <Form method="post" className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />

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
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                aria-invalid={actionData?.errors?.confirmPassword ? true : undefined}
                aria-describedby="confirmPassword-error"
              />
              {actionData?.errors?.confirmPassword ? (
                <div className="pt-1 text-red-700 dark:text-red-400" id="confirmPassword-error">
                  {actionData.errors.confirmPassword}
                </div>
              ) : null}
            </div>
          </div>

          {actionData?.errors?.form ? (
            <div className="pt-1 text-red-700 dark:text-red-400" id="form-error">
              {actionData.errors.form}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Account
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline"
                to="/login"
              >
                Sign in
              </Link>
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
}
