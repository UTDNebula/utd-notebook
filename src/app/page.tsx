import type { Metadata } from 'next';
import DemoCardClient from '@src/components/DemoCardClient';

const Page = () => {
  return <DemoCardClient />;
};

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

export default Page;
