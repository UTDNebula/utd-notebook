import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

const Home = () => {
  return (
    <div className="p-8">
      {/* Page content goes here */}
    </div>
  );
};

export default Home;
