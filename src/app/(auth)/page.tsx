import LoginButtons from '@src/components/LoginButtons';
import { getServerAuthSession } from '@src/server/auth';
import { redirect } from 'next/navigation';

const Login = async () => {
  const session = await getServerAuthSession();

  // If logged in, go straight to homepage
  if (session?.user) {
    redirect('/homepage');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold text-white">UTD Notebook</h1>
      <p className="text-white">Sign in to continue</p>

      <LoginButtons />
    </main>
  );
};

export default Login;
