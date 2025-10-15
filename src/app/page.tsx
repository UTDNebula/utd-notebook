import type { Metadata } from 'next';
import FileCardGrid from "./FileCard";

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

const Home = () => {
  return <FileCardGrid />;
};

export default Home;
