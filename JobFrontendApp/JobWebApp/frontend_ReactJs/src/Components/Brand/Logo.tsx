/**
 * oneKampus Jobs brand. The mark is onekampus.com's hire icon (brand/onekampus-hire-icon.svg),
 * recoloured to this site's yellow accent; the wordmark follows the oneKampus Shop style.
 */
export const HireIcon = ({ className = "h-9 w-9" }: { className?: string }) => (
    <svg viewBox="0 0 1024 1024" className={`shrink-0 ${className}`} aria-hidden="true">
        <rect width="1024" height="1024" rx="228" fill="#161826" />
        <g transform="translate(512 512) scale(0.857) translate(-512 -512)" fill="none" strokeWidth="65" strokeLinecap="round" strokeLinejoin="round">
            <path d="M328 336H584A64 64 0 0 1 648 400V624A64 64 0 0 1 584 688H328A64 64 0 0 1 264 624V400A64 64 0 0 1 328 336Z" stroke="#e9e9ed" />
            <path d="M360 432h0" stroke="#ffe08a" />
            <path d="M712 448L768 408V616L712 576Z" stroke="#ffbd20" />
        </g>
    </svg>
);

const SIZES = {
    sm: { icon: "h-7 w-7", text: "text-xl" },
    md: { icon: "h-9 w-9 xs-mx:h-7 xs-mx:w-7", text: "text-3xl bs-mx:text-2xl xs-mx:text-lg" },
    lg: { icon: "h-12 w-12 md-mx:h-10 md-mx:w-10", text: "text-4xl md-mx:text-3xl" },
};

/** Icon + "oneKampus Jobs" wordmark. `hideTextOnSmall` keeps only the icon on very small screens. */
const Logo = ({ size = "md", hideTextOnSmall = false }: { size?: keyof typeof SIZES; hideTextOnSmall?: boolean }) => (
    <span className="inline-flex items-center gap-2 select-none" aria-label="oneKampus Jobs">
        <HireIcon className={SIZES[size].icon} />
        <span className={`${SIZES[size].text} ${hideTextOnSmall ? "xs-mx:hidden" : ""} font-semibold tracking-tight leading-none whitespace-nowrap text-mine-shaft-100`}>
            oneKampus<span className="text-bright-sun-400 font-medium"> Jobs</span>
        </span>
    </span>
);

export default Logo;
