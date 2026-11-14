// Light/dark theme helpers shared across the app.
// Dark is the default; "light" adds the `.light-theme` class to <html>, which swaps
// the CSS-variable ramp used by all `mine-shaft` Tailwind colors (see index.css).

export type Scheme = "light" | "dark";

const STORAGE_KEY = "theme";

export const getStoredScheme = (): Scheme =>
    (localStorage.getItem(STORAGE_KEY) as Scheme) || "dark";

// Apply the scheme to the Tailwind layer (html class) and persist the choice.
export const applyTailwindScheme = (scheme: Scheme) => {
    const html = document.documentElement;
    if (scheme === "light") html.classList.add("light-theme");
    else html.classList.remove("light-theme");
    localStorage.setItem(STORAGE_KEY, scheme);
};
