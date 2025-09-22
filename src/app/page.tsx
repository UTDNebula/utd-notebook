import type { Metadata } from 'next';
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};


const Home = () => {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="absolute inset-0 bg-haiti/70" />

      {/* <header className="absolute top-0 right-0 z-20 p-4 sm:p-6">
        <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20">
          My Profile
        </button>
      </header> */}

      <main className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-cornflower-200">
          powered by Nebula labs
        </p>

        <h1 className="text-5xl uppercase font-bold tracking-tight sm:text-7xl" style={{ fontFamily: 'var(--font-display)' }}>
          utd notebook
        </h1>

        <p className="max-w-xl text-lg text-cornflower-100/90">
          Share and access course notes. By students, for students.
        </p>

        <div className="flex w-full max-w-lg items-center gap-2 rounded-lg border border-white/20 bg-white/5 p-1.5 backdrop-blur-sm transition-all focus-within:border-white/50">
          <input
            type="text"
            placeholder="Search for a course. e.g., CS 2337"
            className="w-full bg-transparent p-2 text-lg text-white placeholder-gray-400 focus:outline-none"
          />
          <button className="flex items-center gap-2 rounded-md bg-cornflower-400 px-5 py-2 font-semibold text-white transition hover:bg-cornflower-500">
            <FaSearch size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <button className="flex items-center justify-center gap-3 rounded-md bg-white px-6 py-2.5 font-semibold text-gray-800 shadow-md transition hover:bg-gray-200">
            <FcGoogle />
            <span>Sign in with Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 rounded-md bg-[#5865F2] px-6 py-2.5 font-semibold text-white shadow-md transition hover:bg-[#4f5bda]">
            <FaDiscord />
            <span>Sign in with Discord</span>
          </button>
        </div>
      </main>

      <footer className="absolute bottom-0 right-0 z-20 p-4 sm:p-6">
          <button className="rounded-full bg-gray-900/50 px-4 py-2 text-sm font-semibold text-gray-300 backdrop-blur-sm transition hover:bg-gray-900/80">
            Report a Bug
          </button>
      </footer>
    </div>
  );
};

export default Home;