import { ArrowUpIcon } from '@heroicons/react/solid';

const Footer = () => {
  return (
    <footer className="w-screen block z-40 bg-kyso-600 text-white px-8">
      <div className="flex justify-between items-center text-sm" style={{ height: '70px' }}>
        <div className="">
          <a href="https://docs.kyso.io/" target="_blank" className="mx-4" rel="noreferrer">
            Documentation
          </a>
          <a href="https://about.kyso.io/about" target="_blank" className="mx-4" rel="noreferrer">
            About
          </a>
          <a href="https://about.kyso.io/pricing" target="_blank" className="mx-4" rel="noreferrer">
            Prices
          </a>
          <a href="https://about.kyso.io/privacy" target="_blank" className="mx-4" rel="noreferrer">
            Privacy
          </a>
        </div>
        <div
          className="border border-white cursor-pointer p-1 mr-4"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
          }}
        >
          <ArrowUpIcon className="w-4 h-4" />
        </div>
      </div>
    </footer>
  );
};

export { Footer };
