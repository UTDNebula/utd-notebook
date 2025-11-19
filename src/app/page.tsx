import type { Metadata } from 'next';
import NavBar from '@components/NavBar';
import EmptyState from '@components/EmptyState';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

const Home = () => {
  return (
    <>
      <NavBar />
      <EmptyState />
    </>
  );
};

export default Home;
