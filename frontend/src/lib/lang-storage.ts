/** Clé localStorage pour la langue BMP.tn (alignée avec LanguageProvider). */
export const BMP_LANG_STORAGE_KEY = "bmp_lang";

/**
 * Applique lang/dir + data-bmp-lang avant le premier paint pour éviter le flash
 * et aligner l’hydratation avec la préférence utilisateur.
 */
export const BMP_LANG_BOOT_SCRIPT = `(()=>{try{var k=${JSON.stringify(BMP_LANG_STORAGE_KEY)};var h=document.documentElement;var L=localStorage.getItem(k);if(L==='fr-FR'||L==='en-US'||L==='ar-SA'){h.setAttribute('data-bmp-lang',L);h.lang=L==='ar-SA'?'ar':L==='en-US'?'en':'fr';h.dir=L==='ar-SA'?'rtl':'ltr';}}catch(e){}})();`;
