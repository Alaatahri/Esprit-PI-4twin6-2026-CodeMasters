"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import { Globe } from "lucide-react";
import { BMP_LANG_STORAGE_KEY } from "@/lib/lang-storage";

export type LangCode = "fr-FR" | "en-US" | "ar-SA";

export const translations = {
  "fr-FR": {
    espace_client: "Espace client",
    connectez_vous: "Connectez-vous pour créer et suivre vos projets.",
    aller_connexion: "Aller à la connexion",
    espace_reserve: "Espace réservé aux clients",
    connecte_en_tant_que: "Vous êtes connecté en tant que",
    ecran_dedie: "Cet écran est dédié aux clients qui créent des projets.",
    bonjour: "Bonjour",
    inspirez_vous:
      "Inspirez-vous de projets déjà réalisés et découvrez des idées de produits pour vos travaux.",
    nouveau_projet: "Nouveau projet",
    projets_realises: "Projets réalisés via BMP.tn",
    inspiration: "Inspiration",
    quelques_projets:
      "Quelques projets menés avec des experts et artisans via BMP.tn, avec leur budget, durée et avis.",
    mes_projets_recents: "Mes projets récents",
    aucun_projet:
      "Vous n'avez pas encore créé de projet. Remplissez le formulaire à gauche pour commencer.",
    terminé: "Terminé",
    en_cours: "En cours",
    en_attente: "En attente",
    avancement: "avancement",
    produits_populaires: "Produits populaires du marketplace",
    marketplace: "Marketplace",
    quelques_produits:
      "Quelques produits fréquemment commandés pour les projets de construction et rénovation.",
    creer_nouveau_projet: "Créer un nouveau projet",
    decrivez_besoin:
      "Décrivez votre besoin (construction, rénovation, extension…) pour que les experts et artisans puissent vous accompagner.",
    titre_projet: "Titre du projet",
    placeholder_titre:
      "Ex: Construction maison familiale, Extension chambre, Rénovation cuisine…",
    description: "Description",
    placeholder_desc:
      "Décrivez votre besoin, la surface, le budget estimé, les délais souhaités, etc.",
    date_debut: "Date de début souhaitée",
    date_fin: "Date de fin prévue",
    budget: "Budget estimé (TND)",
    placeholder_budget: "Ex: 50000",
    creer_projet: "Créer le projet",
    creation_en_cours: "Création en cours...",
    succes_creation: "Projet créé avec succès.",
    erreur_creation: "Erreur lors de la création du projet.",
    assistant_vocal: "Assistant Vocal",
    ecoute: "Écoute en cours...",
    dicter: "Appuyez pour dicter",
    non_supporte: "Microphone non supporté par votre navigateur.",
    mon_espace: "Mon espace",
    gestion_chantier: "Gestion de Chantier",
    devis_facturation: "Devis & Facturation",
    contact: "Contact",
    mes_projets: "Mes projets",
    connexion: "Connexion",
    deconnexion: "Déconnexion",
    nouveau_projet_plus: "Nouveau projet +",
    nav_chantier: "Chantier",
    nav_devis: "Devis",
    nav_suivi_mes_projets: "Suivi de mes projets",
    nav_plus_nouveau_projet: "+ Nouveau projet",
    nav_tous_les_projets: "Tous les projets",
    nav_projets: "Projets",
    nav_invitations: "Invitations",
    nav_messages: "Messages",
    tagline_plateforme: "PLATEFORME",
    mobile_menu: "Menu",
    changer_langue: "Changer de langue",
    aria_fermer_menu: "Fermer le menu",
    aria_fermer: "Fermer",
    title_suivi_photos: "Voir le taux d'avancement et les photos de chantier",
    nav_dashboard: "Tableau de bord",
    nav_stats: "Statistiques",
    theme_light_title: "Mode clair",
    theme_dark_title: "Mode sombre",
    aria_theme_to_light: "Activer le mode clair",
    aria_theme_to_dark: "Activer le mode sombre",
    badge_new: "NOUVEAU",
    footer_desc:
      "La plateforme qui relie clients, experts et artisans — suivi, devis et marketplace au même endroit.",
    footer_location: "Tunisie · projets sur tout le territoire",
    footer_support: "Support du lundi au vendredi",
    footer_section_account: "Compte & accès",
    footer_section_tools: "Outils BMP",
    footer_sign_up: "S'inscrire",
    footer_copyright: "Construction digitale. Tous droits réservés.",
    footer_legal: "Mentions légales",
    footer_privacy: "Confidentialité",
    footer_cookies: "Cookies",
    footer_aria_legal: "Informations légales",
    espace_welcome_prefix: "Bienvenue sur",
    espace_subtitle_guest:
      "La plateforme qui connecte clients, experts et artisans pour des chantiers suivis de bout en bout.",
    espace_subtitle_user:
      "Accédez à vos outils de gestion de chantier, devis et marketplace depuis un seul espace.",
    espace_cta_register: "Commencer gratuitement",
    espace_section_guest: "Découvrez les outils BMP.tn",
    espace_section_user: "Nos modules",
    mod_chantier_title: "Gestion de Chantier",
    mod_chantier_desc: "Planification, suivi des projets et avancement en temps réel.",
    mod_chantier_btn: "Accéder",
    mod_devis_title: "Devis & Facturation",
    mod_devis_desc: "Devis et facturation assistés par IA pour vos chantiers.",
    mod_devis_btn: "Accéder",
    mod_market_title: "Marketplace",
    mod_market_desc: "Matériaux et équipements de construction. Commandez en ligne.",
    mod_market_btn: "Voir le catalogue",
    quick_chantier_title: "Gestion de Chantier",
    quick_chantier_sub: "Projets & suivi",
    quick_devis_title: "Devis & Facturation",
    quick_devis_sub: "Devis IA",
    quick_market_title: "Marketplace",
    quick_market_sub: "Catalogue B2B",
    espace_loading: "Chargement…",
    espace_redirecting: "Redirection vers votre espace…",
    access_title: "Accessibilité universelle",
    access_standard: "Mode standard",
    access_malvoyant_label: "Malvoyant",
    access_malvoyant_desc: "Grand texte, contraste fort",
    access_daltonien_label: "Daltonien",
    access_daltonien_desc: "Couleurs adaptées, contrastes purs",
    access_dyslexique_label: "Dyslexique",
    access_dyslexique_desc: "Police espacée, lignes claires",
    access_mobilite_label: "Mobilité réduite",
    access_mobilite_desc: "Navigation clavier, gros focus",
    access_senior_label: "Senior",
    access_senior_desc: "Texte lisible, simplifié",
    access_concentration_label: "Concentration",
    access_concentration_desc: "Masque de lecture, sans animations",
  },
  "en-US": {
    espace_client: "Client Space",
    connectez_vous: "Log in to create and track your projects.",
    aller_connexion: "Go to login",
    espace_reserve: "Client reserved space",
    connecte_en_tant_que: "You are logged in as",
    ecran_dedie: "This screen is dedicated to clients creating projects.",
    bonjour: "Hello",
    inspirez_vous:
      "Get inspired by completed projects and discover product ideas for your work.",
    nouveau_projet: "New Project",
    projets_realises: "Projects completed via BMP.tn",
    inspiration: "Inspiration",
    quelques_projets:
      "Some projects carried out with experts and craftsmen via BMP.tn, with their budget, duration and reviews.",
    mes_projets_recents: "My recent projects",
    aucun_projet:
      "You haven't created a project yet. Fill out the form to get started.",
    terminé: "Completed",
    en_cours: "In progress",
    en_attente: "Pending",
    avancement: "progress",
    produits_populaires: "Popular marketplace products",
    marketplace: "Marketplace",
    quelques_produits:
      "Some frequently ordered products for construction and renovation projects.",
    creer_nouveau_projet: "Create a new project",
    decrivez_besoin:
      "Describe your needs (construction, renovation, extension...) so that experts and craftsmen can assist you.",
    titre_projet: "Project Title",
    placeholder_titre:
      "Ex: Family home construction, Room extension, Kitchen renovation...",
    description: "Description",
    placeholder_desc:
      "Describe your need, surface area, estimated budget, desired deadlines, etc.",
    date_debut: "Desired start date",
    date_fin: "Estimated end date",
    budget: "Estimated budget (TND)",
    placeholder_budget: "Ex: 50000",
    creer_projet: "Create project",
    creation_en_cours: "Creating...",
    succes_creation: "Project successfully created.",
    erreur_creation: "Error creating project.",
    assistant_vocal: "Voice Assistant",
    ecoute: "Listening...",
    dicter: "Press to dictate",
    non_supporte: "Microphone not supported by your browser.",
    mon_espace: "My Space",
    gestion_chantier: "Site Management",
    devis_facturation: "Quotes & Invoicing",
    contact: "Contact",
    mes_projets: "My Projects",
    connexion: "Login",
    deconnexion: "Logout",
    nouveau_projet_plus: "New Project +",
    nav_chantier: "Sites",
    nav_devis: "Quotes",
    nav_suivi_mes_projets: "Project tracking",
    nav_plus_nouveau_projet: "+ New project",
    nav_tous_les_projets: "All projects",
    nav_projets: "Projects",
    nav_invitations: "Invitations",
    nav_messages: "Messages",
    tagline_plateforme: "PLATFORM",
    mobile_menu: "Menu",
    changer_langue: "Change language",
    aria_fermer_menu: "Close menu",
    aria_fermer: "Close",
    title_suivi_photos: "View progress and site photos",
    nav_dashboard: "Dashboard",
    nav_stats: "Statistics",
    theme_light_title: "Light mode",
    theme_dark_title: "Dark mode",
    aria_theme_to_light: "Turn on light mode",
    aria_theme_to_dark: "Turn on dark mode",
    badge_new: "NEW",
    footer_desc:
      "The platform connecting clients, experts and contractors — tracking, quotes and marketplace in one place.",
    footer_location: "Tunisia · projects nationwide",
    footer_support: "Support Monday to Friday",
    footer_section_account: "Account & access",
    footer_section_tools: "BMP tools",
    footer_sign_up: "Sign up",
    footer_copyright: "Digital construction. All rights reserved.",
    footer_legal: "Legal",
    footer_privacy: "Privacy",
    footer_cookies: "Cookies",
    footer_aria_legal: "Legal information",
    espace_welcome_prefix: "Welcome to",
    espace_subtitle_guest:
      "The platform connecting clients, experts and contractors for end-to-end site tracking.",
    espace_subtitle_user:
      "Access site management, quotes and marketplace tools from one place.",
    espace_cta_register: "Get started free",
    espace_section_guest: "Explore BMP.tn tools",
    espace_section_user: "Our modules",
    mod_chantier_title: "Site management",
    mod_chantier_desc: "Planning, project tracking and real-time progress.",
    mod_chantier_btn: "Open",
    mod_devis_title: "Quotes & invoicing",
    mod_devis_desc: "AI-assisted quotes and invoicing for your sites.",
    mod_devis_btn: "Open",
    mod_market_title: "Marketplace",
    mod_market_desc: "Construction materials and equipment. Order online.",
    mod_market_btn: "Browse catalogue",
    quick_chantier_title: "Site management",
    quick_chantier_sub: "Projects & tracking",
    quick_devis_title: "Quotes & invoicing",
    quick_devis_sub: "AI quotes",
    quick_market_title: "Marketplace",
    quick_market_sub: "B2B catalogue",
    espace_loading: "Loading…",
    espace_redirecting: "Redirecting to your space…",
    access_title: "Accessibility",
    access_standard: "Standard mode",
    access_malvoyant_label: "Low vision",
    access_malvoyant_desc: "Large text, strong contrast",
    access_daltonien_label: "Colour blindness",
    access_daltonien_desc: "Adjusted colours, pure contrast",
    access_dyslexique_label: "Dyslexia",
    access_dyslexique_desc: "Spaced font, clear lines",
    access_mobilite_label: "Reduced mobility",
    access_mobilite_desc: "Keyboard navigation, large focus",
    access_senior_label: "Senior",
    access_senior_desc: "Readable text, simplified UI",
    access_concentration_label: "Focus",
    access_concentration_desc: "Reading mask, no animations",
  },
  "ar-SA": {
    espace_client: "مساحة العميل",
    connectez_vous: "سجل الدخول لإنشاء وتتبع مشاريعك.",
    aller_connexion: "الذهاب لتسجيل الدخول",
    espace_reserve: "مساحة مخصصة للعملاء",
    connecte_en_tant_que: "لقد قمت بتسجيل الدخول كـ",
    ecran_dedie: "هذه الشاشة مخصصة للعملاء الذين ينشئون مشاريع.",
    bonjour: "مرحباً",
    inspirez_vous:
      "استلهم من المشاريع المنجزة واكتشف أفكارًا لمنتجات لأعمالك.",
    nouveau_projet: "مشروع جديد",
    projets_realises: "المشاريع المنجزة عبر BMP.tn",
    inspiration: "إلهام",
    quelques_projets:
      "بعض المشاريع المنفذة مع الخبراء والحرفيين عبر BMP.tn، مع ميزانيتها ومدتها والآراء.",
    mes_projets_recents: "مشاريعي الأخيرة",
    aucun_projet: "لم تقم بإنشاء مشروع بعد. املأ النموذج للبدء.",
    terminé: "مكتمل",
    en_cours: "قيد التنفيذ",
    en_attente: "قيد الانتظار",
    avancement: "تقدم",
    produits_populaires: "المنتجات الأكثر رواجاً في السوق",
    marketplace: "السوق",
    quelques_produits:
      "بعض المنتجات المطلوبة بشكل متكرر لمشاريع البناء والتجديد.",
    creer_nouveau_projet: "إنشاء مشروع جديد",
    decrivez_besoin:
      "صف حاجتك (بناء، تجديد، توسعة...) حتى يتمكن الخبراء والحرفيون من مرافقتك.",
    titre_projet: "عنوان المشروع",
    placeholder_titre: "مثال: بناء منزل عائلي، توسيع غرفة، تجديد المطبخ...",
    description: "الوصف",
    placeholder_desc:
      "صف حاجتك، المساحة، الميزانية المقدرة، المواعيد النهائية المطلوبة، إلخ.",
    date_debut: "تاريخ البدء المطلوب",
    date_fin: "تاريخ الانتهاء المقدر",
    budget: "الميزانية المقدرة (TND)",
    placeholder_budget: "مثال: 50000",
    creer_projet: "إنشاء المشروع",
    creation_en_cours: "جاري الإنشاء...",
    succes_creation: "تم إنشاء المشروع بنجاح.",
    erreur_creation: "خطأ أثناء إنشاء المشروع.",
    assistant_vocal: "المساعد الصوتي",
    ecoute: "جاري الاستماع...",
    dicter: "اضغط للإملاء",
    non_supporte: "الميكروفون غير مدعوم في متصفحك.",
    mon_espace: "مساحتي",
    gestion_chantier: "إدارة الموقع",
    devis_facturation: "عروض الأسعار والفواتير",
    contact: "اتصل بنا",
    mes_projets: "مشاريعي",
    connexion: "تسجيل الدخول",
    deconnexion: "تسجيل الخروج",
    nouveau_projet_plus: "مشروع جديد +",
    nav_chantier: "الموقع",
    nav_devis: "عروض الأسعار",
    nav_suivi_mes_projets: "متابعة مشاريعي",
    nav_plus_nouveau_projet: "+ مشروع جديد",
    nav_tous_les_projets: "كل المشاريع",
    nav_projets: "المشاريع",
    nav_invitations: "الدعوات",
    nav_messages: "الرسائل",
    tagline_plateforme: "المنصة",
    mobile_menu: "القائمة",
    changer_langue: "تغيير اللغة",
    aria_fermer_menu: "إغلاق القائمة",
    aria_fermer: "إغلاق",
    title_suivi_photos: "عرض نسبة الإنجاز وصور الموقع",
    nav_dashboard: "لوحة التحكم",
    nav_stats: "الإحصائيات",
    theme_light_title: "الوضع الفاتح",
    theme_dark_title: "الوضع الداكن",
    aria_theme_to_light: "تفعيل الوضع الفاتح",
    aria_theme_to_dark: "تفعيل الوضع الداكن",
    badge_new: "جديد",
    footer_desc:
      "المنصة التي تربط العملاء والخبراء والحرفيين — المتابعة والعروض والسوق في مكان واحد.",
    footer_location: "تونس · مشاريع على كامل التراب",
    footer_support: "الدعم من الإثنين إلى الجمعة",
    footer_section_account: "الحساب والوصول",
    footer_section_tools: "أدوات BMP",
    footer_sign_up: "إنشاء حساب",
    footer_copyright: "البناء الرقمي. جميع الحقوق محفوظة.",
    footer_legal: "قانوني",
    footer_privacy: "الخصوصية",
    footer_cookies: "ملفات تعريف الارتباط",
    footer_aria_legal: "معلومات قانونية",
    espace_welcome_prefix: "مرحبًا بك في",
    espace_subtitle_guest:
      "المنصة التي تربط العملاء والخبراء والحرفيين لمتابعة المشاريع من البداية إلى النهاية.",
    espace_subtitle_user:
      "الوصول إلى أدوات إدارة الموقع والعروض والسوق من مكان واحد.",
    espace_cta_register: "ابدأ مجانًا",
    espace_section_guest: "اكتشف أدوات BMP.tn",
    espace_section_user: "وحداتنا",
    mod_chantier_title: "إدارة الموقع",
    mod_chantier_desc: "التخطيط ومتابعة المشاريع والتقدم في الوقت الفعلي.",
    mod_chantier_btn: "دخول",
    mod_devis_title: "العروض والفواتير",
    mod_devis_desc: "عروض وفواتير مدعومة بالذكاء الاصطناعي لمواقعك.",
    mod_devis_btn: "دخول",
    mod_market_title: "السوق",
    mod_market_desc: "مواد ومعدات البناء. اطلب عبر الإنترنت.",
    mod_market_btn: "عرض الكتالوج",
    quick_chantier_title: "إدارة الموقع",
    quick_chantier_sub: "المشاريع والمتابعة",
    quick_devis_title: "العروض والفواتير",
    quick_devis_sub: "عروض ذكية",
    quick_market_title: "السوق",
    quick_market_sub: "كتالوج B2B",
    espace_loading: "جاري التحميل…",
    espace_redirecting: "إعادة التوجيه إلى مساحتك…",
    access_title: "إمكانية الوصول",
    access_standard: "الوضع القياسي",
    access_malvoyant_label: "ضعف البصر",
    access_malvoyant_desc: "نص كبير وتباين قوي",
    access_daltonien_label: "عمى الألوان",
    access_daltonien_desc: "ألوان مناسبة وتباين نقي",
    access_dyslexique_label: "عسر القراءة",
    access_dyslexique_desc: "خط متباعد وأسطر واضحة",
    access_mobilite_label: "تقليل الحركة",
    access_mobilite_desc: "تصفح لوحة المفاتيح وتركيز كبير",
    access_senior_label: "كبار السن",
    access_senior_desc: "نص مقروء وواجهة مبسطة",
    access_concentration_label: "التركيز",
    access_concentration_desc: "قناع قراءة، بدون حركات",
  },
};

export type TranslationKeys = keyof (typeof translations)["fr-FR"];

interface LangContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LangContextType>({
  lang: "fr-FR",
  setLang: () => {},
  t: (key) => translations["fr-FR"][key] || key,
});

function applyDocumentLang(code: LangCode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-bmp-lang", code);
  document.documentElement.dir = code === "ar-SA" ? "rtl" : "ltr";
  document.documentElement.lang = code === "ar-SA" ? "ar" : code === "en-US" ? "en" : "fr";
}

function readInitialLang(): LangCode {
  if (typeof window === "undefined") return "fr-FR";
  try {
    const fromDom = document.documentElement.getAttribute("data-bmp-lang");
    if (fromDom === "fr-FR" || fromDom === "en-US" || fromDom === "ar-SA") {
      return fromDom;
    }
    const raw = localStorage.getItem(BMP_LANG_STORAGE_KEY);
    if (raw === "fr-FR" || raw === "en-US" || raw === "ar-SA") return raw;
  } catch {
    /* ignore */
  }
  return "fr-FR";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  /** Toujours fr au 1er rendu (SSR + hydratation) pour éviter tout décalage avec le HTML serveur. */
  const [lang, setLangState] = useState<LangCode>("fr-FR");

  useLayoutEffect(() => {
    const next = readInitialLang();
    setLangState(next);
    applyDocumentLang(next);
    // Sync unique après montage : le script boot peut déjà avoir mis data-bmp-lang sur <html>.
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== BMP_LANG_STORAGE_KEY || !e.newValue) return;
      const next = e.newValue as LangCode;
      if (next === "fr-FR" || next === "en-US" || next === "ar-SA") {
        setLangState(next);
        applyDocumentLang(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSetLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem(BMP_LANG_STORAGE_KEY, newLang);
    applyDocumentLang(newLang);
    try {
      window.dispatchEvent(new CustomEvent("bmp:lang-change", { detail: newLang }));
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKeys) =>
      translations[lang][key] || translations["fr-FR"][key] || String(key),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang: handleSetLang, t }),
    [lang, handleSetLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

export function LanguageSwitcher({
  onMenuOpenChange,
}: {
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 shadow-lg transition-transform hover:scale-105"
        title={t("changer_langue")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("changer_langue")}
      >
        <Globe className="w-5 h-5" />
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-900">
          {lang === "fr-FR" ? "FR" : lang === "ar-SA" ? "AR" : "EN"}
        </span>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+12px)] right-0 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-2 flex flex-col gap-1 w-36">
          <button
            type="button"
            onClick={() => {
              setLang("fr-FR");
              setOpen(false);
            }}
            className={`px-4 py-2.5 text-left text-sm rounded-lg hover:bg-white/10 transition-colors ${
              lang === "fr-FR"
                ? "text-amber-400 font-bold bg-white/5"
                : "text-gray-300"
            }`}
          >
            Français
          </button>
          <button
            type="button"
            onClick={() => {
              setLang("en-US");
              setOpen(false);
            }}
            className={`px-4 py-2.5 text-left text-sm rounded-lg hover:bg-white/10 transition-colors ${
              lang === "en-US"
                ? "text-amber-400 font-bold bg-white/5"
                : "text-gray-300"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => {
              setLang("ar-SA");
              setOpen(false);
            }}
            dir="rtl"
            className={`px-4 py-2.5 text-right text-sm rounded-lg hover:bg-white/10 transition-colors ${
              lang === "ar-SA"
                ? "text-amber-400 font-bold bg-white/5"
                : "text-gray-300"
            }`}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );
}
