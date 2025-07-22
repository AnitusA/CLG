import { redirect, type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect to login page since registration is disabled
  return redirect('/login');
}

export default function Register() {
  // This component will never render due to the redirect in loader
  return null;
}
