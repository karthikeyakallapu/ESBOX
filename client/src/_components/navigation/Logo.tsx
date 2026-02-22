import { Link } from "react-router-dom";

interface LogoImageProps {
  outerHeight?: number;
  outerWidth?: number;
  innerHeight?: number;
  innerWidth?: number;
}

export const LogoImage = ({
  outerHeight,
  outerWidth,
  innerHeight,
  innerWidth,
}: LogoImageProps) => {
  return (
    <div className={`relative h-${outerHeight} w-${outerWidth}`}>
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-600 via-sky-500 to-indigo-700 shadow-card ring-1 ring-blue-200/60 transition-transform duration-300 group-hover:scale-[1.03]" />
      <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white/25 blur-[0.5px]" />
      <svg
        viewBox="0 0 24 24"
        className={`absolute inset-0 m-auto h-${innerHeight} w-${innerWidth} text-white`}
        fill="currentColor"
      >
        <path d="M6.8 18c-2.6 0-4.8-2.1-4.8-4.7 0-2.3 1.7-4.2 3.9-4.6C6.6 5.9 9.1 4 12 4c3.7 0 6.7 2.7 7.2 6.3 1.7.5 2.8 2.1 2.8 3.9 0 2.1-1.7 3.8-3.8 3.8H6.8Z" />
      </svg>
    </div>
  );
};

export default function Logo() {
  return (
    <Link to="/">
      <div className="group flex items-center gap-3 select-none">
        <div>
          <LogoImage
            innerHeight={5}
            innerWidth={5}
            outerHeight={9}
            outerWidth={9}
          />
        </div>

        <span className="text-lg font-semibold  bungee-regular tracking-[0.01em] font-brand text-text-primary">
          <span className="text-3xl bungee-regular text-[#303133]">ESBox</span>
        </span>
      </div>
    </Link>
  );
}
