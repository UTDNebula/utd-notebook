import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@src/server/auth';
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

const Home = async () => {
  const session = await getServerAuthSession();

  // If not logged in, go to login page
  if (!session?.user) {
    redirect('/');
  }
  return <></>;
};

export default Home;
