import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Header from '@src/components/header/Header';
import NebulaLogo from '@src/icons/NebulaLogo';

const Home = () => {
  return (
    <main className="relative">
      <div className="absolute inset-0 z-0">
        <div className="relative h-screen">
          <div className="absolute inset-0 bg-[linear-gradient(106deg,#C0C2FF_13.64%,#DDBBF3_48.08%,#FFC6C1_83.43%)]" />
          <div className="absolute inset-0 dark:bg-slightly-darken" />
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

            <p className="mb-10 text-center text-white text-base md:text-lg text-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]">
              Share and access course notes. By students, for students.
            </p>

            <TextField
              placeholder="Search for courses or professors"
              variant="outlined"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" key="search-icon">
                      <SearchIcon className="text-royal dark:text-cornflower-300" />
                    </InputAdornment>
                  ),
                  className: 'rounded-full bg-white dark:bg-neutral-800',
                },
              }}
              className="w-full max-w-xs md:max-w-sm lg:max-w-md"
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
