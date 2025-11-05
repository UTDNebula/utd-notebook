import { Bai_Jamjuree } from 'next/font/google';
import NebulaLogo from 'src/app/nebula-logo';

const baiJamjuree = Bai_Jamjuree({ subsets: ['latin'], weight: '700' });

export default function Footer() {
  return (
    <footer className="flex w-full flex-col gap-10 border-none py-4 text-center">
      <div className="mb-2 flex flex-row items-center justify-center gap-4">
        <NebulaLogo className="h-14 w-14" />
        <div
          className={`align-bottom text-4xl text-white ${baiJamjuree.className}`}
        >
          NEBULA LABS NOTEBOOK
        </div>
      </div>
      <div className="mb-2 ml-20 flex flex-row items-center justify-center gap-30">
        <a
          href=""
          className="text-decoration-underline text-1xl cursor-pointer font-bold text-white"
        >
          About Us
        </a>

        <a
          href="https://github.com/UTDNebula/utd-notebook"
          className="text-decoration-underline text-1xl cursor-pointer font-bold text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>

        <a
          href="https://www.utdnebula.com/contact"
          className="text-decoration-underline text-1xl cursor-pointer font-bold text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact
        </a>
      </div>
      <div className="mx-auto h-0.5 w-6/13 rounded-full bg-white"></div>
      <div className="mb-2 text-sm text-white">
        © 2023-2025 Nebula Labs Maintainers. Open-source under the MIT License.
      </div>
    </footer>
  );
}
