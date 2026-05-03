/** Clé localStorage pour le thème BMP.tn (persisté + lu par le script inline dans layout). */
export const BMP_THEME_STORAGE_KEY = "bmp-theme";

export type BMPThemeMode = "dark" | "light";

/**
 * Script synchrone injecté dans <head> pour appliquer dark/light avant le premier paint
 * (évite le flash et aligne le SSR avec la préférence utilisateur).
 */
export const BMP_THEME_BOOT_SCRIPT = `(()=>{try{var k=${JSON.stringify(BMP_THEME_STORAGE_KEY)};var h=document.documentElement;var s=localStorage.getItem(k);var m='dark';if(s==='light'||s==='dark')m=s;else if(window.matchMedia('(prefers-color-scheme: light)').matches)m='light';h.classList.remove('dark','light');if(m==='dark')h.classList.add('dark');else h.classList.add('light');}catch(e){}})();`;
