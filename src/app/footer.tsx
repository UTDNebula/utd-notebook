import { Bai_Jamjuree, Inter } from 'next/font/google';
import NebulaLogo from 'src/app/nebula-logo';

const baiJamjuree = Bai_Jamjuree({ subsets: ['latin'], weight: '700' });

export default function Footer() {
    return (
        <footer className="w-full border-none bg-orange-400 rounded-t-3xl py-4 text-center flex flex-col gap-10"> 
            <div className="flex flex-row justify-center items-center gap-4 mb-2">
                <NebulaLogo className="w-14 h-14" />
                <div className={`text-4xl text-white align-bottom ${baiJamjuree.className}`}>NEBULA LABS NOTEBOOK</div>
            </div>
            <div className="flex flex-row justify-center items-center gap-30 mb-2 ml-20">
                <a href= ""
                className="text-white text-decoration-underline cursor-pointer text-2xl font-bold">About Us
                </a>

                <a href= "https://github.com/UTDNebula/utd-notebook"
                className="text-white text-decoration-underline cursor-pointer text-2xl font-bold" target="_blank" rel="noopener noreferrer">GitHub
                </a>

                <a href= "https://www.utdnebula.com/contact"
                className="text-white text-decoration-underline cursor-pointer text-2xl font-bold" target="_blank" rel="noopener noreferrer">Contact
                </a>
            </div>
            <div className="bg-white h-0.5 w-6/13 mx-auto rounded-full"></div>
            <div className="text-white text-sm mb-2">© 2023-2025 Nebula Labs Maintainers. Open-source under the MIT License.</div>
        </footer>
    );
}