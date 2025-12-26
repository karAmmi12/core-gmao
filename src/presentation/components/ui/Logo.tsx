import clsx from 'clsx';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={clsx("inline-flex items-center gap-2", className)}>
      {/* L'Icône SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 text-neutral-900" // Couleur principale
      >
        {/* L'Hexagone extérieur */}
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        {/* Le Cœur intérieur (Orange) */}
        <circle cx="12" cy="12" r="3" className="fill-primary-600 stroke-none" />
      </svg>

      {/* Le Texte */}
      {showText && (
        <div className="leading-none">
          <span className="block text-xl font-extrabold text-neutral-900 tracking-tight">CORE</span>
          <span className="block text-[0.65rem] font-bold text-primary-600 tracking-widest uppercase">GMAO Solutions</span>
        </div>
      )}
    </div>
  );
};