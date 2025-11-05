import type { Metadata } from 'next';
import NavBar from '@components/NavBar';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

const Home = () => {
  return (
    <>
      <NavBar />
    </>
  );
};

export default Home;
