import { createCookieSessionStorage, redirect } from '@remix-run/node';

type SessionData = {
  userId: string;
  userType: 'student' | 'admin';
  registerNumber?: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secrets: ['your-hardcoded-secret-key-here'],
      secure: false, // Set to true in production
    },
  });

export { getSession, commitSession, destroySession };

export async function createUserSession({
  request,
  userId,
  userType,
  registerNumber,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  userType: 'student' | 'admin';
  registerNumber?: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request.headers.get('Cookie'));
  session.set('userId', userId);
  session.set('userType', userType);
  if (registerNumber) {
    session.set('registerNumber', registerNumber);
  }

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  return userId;
}

export async function getUser(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  const userType = session.get('userType');
  const registerNumber = session.get('registerNumber');

  if (!userId || !userType) return null;

  return {
    id: userId,
    type: userType,
    registerNumber,
  };
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireStudent(request: Request) {
  const user = await getUser(request);
  if (!user || user.type !== 'student') {
    throw redirect('/login');
  }
  return user;
}

export async function requireAdmin(request: Request) {
  const user = await getUser(request);
  if (!user || user.type !== 'admin') {
    throw redirect('/login');
  }
  return user;
}
