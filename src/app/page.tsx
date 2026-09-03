import Header from '@src/components/header/Header';
import SearchBar from '@src/components/header/SearchBar';
import { HOME_PAGE_GRADIENT_CLASS } from '@src/constants/gradients';
import NebulaLogo from '@src/icons/NebulaLogo';

const Home = () => {
  return (
    <main className="relative">
      <div className="absolute inset-0 z-0">
        <div className="relative h-screen">
          <div className={`absolute inset-0 ${HOME_PAGE_GRADIENT_CLASS}`} />
          <div className="dark:bg-slightly-darken absolute inset-0" />
        </div>
      </div>

      <div className="relative inset-0 z-20 bg-transparent">
        <Header
          transparent
          shadow
          disableSticky
          className="lg:fixed"
          itemVisibility={{ search: false }}
          color="light"
        />
        <section className="h-screen">
          <div className="flex h-full w-full flex-col items-center justify-center overflow-visible">
            <h2 className="mb-3 flex items-center gap-1 text-sm font-semibold tracking-wider text-white text-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]">
              <span className="leading-none">POWERED BY</span>
              <a
                href="https://www.utdnebula.com/"
                target="_blank"
                rel="noopener"
                className="group flex items-center gap-1"
              >
                <NebulaLogo className="h-4 w-auto fill-white drop-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]" />
                <span className="border-y-2 border-transparent leading-none transition group-hover:border-b-inherit group-hover:underline">
                  NEBULA LABS
                </span>
              </a>
            </h2>

            <h1 className="font-display mb-4 max-w-3xl px-5 text-center text-6xl font-extrabold text-white text-shadow-[0_0_16px_rgb(0_0_0_/_0.4)]">
              UTD NOTEBOOK
            </h1>

            <p className="mb-10 text-center text-base text-white text-shadow-[0_0_4px_rgb(0_0_0_/_0.4)] md:text-lg">
              Share and access course notes. By students, for students.
            </p>
            <SearchBar autoFocus />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
