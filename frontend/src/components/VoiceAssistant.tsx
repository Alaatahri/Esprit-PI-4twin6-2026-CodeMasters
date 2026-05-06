"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- reconnaissance vocale navigateur (API hétérogène) */

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { getStoredUser } from "@/lib/auth";
import { normalizeVoiceText, speechRecognitionLang } from "@/lib/voice-intent";

export function VoiceAssistant() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const speakBack = useCallback(
    (text: string, forceLang?: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = forceLang || lang;
        utterance.lang = targetLang;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find((v) => v.lang.startsWith(targetLang.substring(0, 2)));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
      }
    },
    [lang],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    setIsSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const handleCommand = useCallback(
    (spokenRaw: string, routerInstance: ReturnType<typeof useRouter>) => {
      const raw = spokenRaw.trim();
      const t = normalizeVoiceText(raw);

      const isLangCommand =
        t.includes("langue") ||
        t.includes("language") ||
        raw.includes("لغة") ||
        raw.includes("تغيير") ||
        raw.includes("بدل");
      if (
        isLangCommand ||
        t.includes("arabe") ||
        t.includes("francais") ||
        t.includes("anglais") ||
        raw.includes("عرب") ||
        raw.includes("فرنس") ||
        raw.includes("انجليز")
      ) {
        if (t.includes("arabe") || t.includes("arabic") || raw.includes("عرب")) {
          setLang("ar-SA");
          speakBack("تم تغيير اللغة إلى العربية", "ar-SA");
          return;
        }
        if (t.includes("francais") || t.includes("french") || raw.includes("فرنس")) {
          setLang("fr-FR");
          speakBack("Changement de langue en français", "fr-FR");
          return;
        }
        if (t.includes("anglais") || t.includes("english") || raw.includes("إنجليز") || raw.includes("انجليز")) {
          setLang("en-US");
          speakBack("Language changed to English", "en-US");
          return;
        }
      }

      const isCreateIntent =
        t.includes("creer") ||
        t.includes("nouveau") ||
        t.includes("ajoute") ||
        t.includes("create") ||
        t.includes("new") ||
        t.includes("add") ||
        t.includes("veux") ||
        t.includes("voudrais") ||
        t.includes("souhaite") ||
        t.includes("aimerais") ||
        t.includes("want") ||
        t.includes("like to") ||
        t.includes("would like") ||
        raw.includes("إنشاء") ||
        raw.includes("جديد") ||
        raw.includes("اضافة") ||
        raw.includes("زيد") ||
        raw.includes("أريد") ||
        raw.includes("بدي");

      const mentionsProject =
        t.includes("projet") ||
        t.includes("chantier") ||
        t.includes("project") ||
        raw.includes("مشروع") ||
        raw.includes("مشاريع") ||
        t.includes("bâti") ||
        t.includes("bati");

      /* Création de projet : prioritaire — clients → formulaire nouveau projet */
      if (isCreateIntent && mentionsProject) {
        const user = getStoredUser();
        const role = user?.role || "client";
        speakBack(
          lang === "fr-FR"
            ? "Ouverture de la création de projet"
            : lang === "ar-SA"
              ? "فتح إنشاء مشروع"
              : "Opening project creation",
        );
        if (role === "client") {
          routerInstance.push("/espace/client/nouveau-projet");
        } else {
          routerInstance.push(`/espace/${role}`);
        }
        return;
      }

      if (
        t.includes("inscription") ||
        t.includes("register") ||
        t.includes("signup") ||
        raw.includes("حساب جديد") ||
        raw.includes("سجل")
      ) {
        speakBack(
          lang === "fr-FR" ? "Page d'inscription" : lang === "ar-SA" ? "صفحة التسجيل" : "Registration page",
        );
        routerInstance.push("/inscription");
        return;
      }
      if (t.includes("connexion") || t.includes("login") || raw.includes("تسجيل الدخول") || raw.includes("دخول")) {
        speakBack(lang === "fr-FR" ? "Page de connexion" : lang === "ar-SA" ? "صفحة الدخول" : "Login page");
        routerInstance.push("/login");
        return;
      }

      if (
        t.includes("contact") ||
        t.includes("support") ||
        t.includes("aide") ||
        raw.includes("اتصل") ||
        raw.includes("مساعدة") ||
        raw.includes("دعم")
      ) {
        speakBack(lang === "fr-FR" ? "Page de contact" : lang === "ar-SA" ? "صفحة الاتصال" : "Contact page");
        routerInstance.push("/contact");
        return;
      }

      if (
        t.includes("profil") ||
        t.includes("compte") ||
        t.includes("profile") ||
        t.includes("account") ||
        raw.includes("حسابي") ||
        raw.includes("ملفي") ||
        raw.includes("بروفايل")
      ) {
        speakBack(lang === "fr-FR" ? "Votre profil" : lang === "ar-SA" ? "الملف الشخصي" : "Your profile");
        routerInstance.push("/espace/profil");
        return;
      }

      if (t.includes("admin") || t.includes("administrateur") || raw.includes("ادارة") || raw.includes("مدير")) {
        speakBack(
          lang === "fr-FR" ? "Espace Administrateur" : lang === "ar-SA" ? "مساحة الإدارة" : "Admin Space",
        );
        routerInstance.push("/espace/admin");
        return;
      }
      if (t.includes("expert") || raw.includes("خبير")) {
        speakBack(lang === "fr-FR" ? "Espace Expert" : lang === "ar-SA" ? "مساحة الخبير" : "Expert Space");
        routerInstance.push("/espace/expert");
        return;
      }
      if (t.includes("artisan") || raw.includes("صنايعي") || raw.includes("حرفي")) {
        speakBack(lang === "fr-FR" ? "Espace Artisan" : lang === "ar-SA" ? "مساحة الحرفي" : "Artisan Space");
        routerInstance.push("/espace/artisan");
        return;
      }
      if (t.includes("fournisseur") || t.includes("supplier") || raw.includes("مزود") || raw.includes("مورد")) {
        speakBack(
          lang === "fr-FR" ? "Espace Fournisseur" : lang === "ar-SA" ? "مساحة المزود" : "Supplier Space",
        );
        routerInstance.push("/espace/fournisseur");
        return;
      }

      const isGoCommand =
        /\bva\b/.test(t) ||
        t.includes("aller") ||
        t.includes("ouvre") ||
        t.includes("go ") ||
        t.includes("open ") ||
        t.includes("take me") ||
        t.includes("show me") ||
        raw.includes("إذهب") ||
        raw.includes("افتح") ||
        raw.includes("اذهب") ||
        raw.includes("امشي") ||
        raw.includes("وريني") ||
        raw.includes("اعرض") ||
        raw.includes("هزني") ||
        raw.includes("صفحة");

      const naturalNav =
        t.includes("je veux") ||
        t.includes("j aimerais") ||
        t.includes("j'aimerais") ||
        t.includes("i want") ||
        t.includes("i would like") ||
        raw.includes("أريد") ||
        raw.includes("بدي");

      const openModules =
        isGoCommand ||
        naturalNav ||
        raw.includes("الرئيسية") ||
        raw.includes("مشاريع") ||
        raw.includes("فواتير") ||
        raw.includes("سوق") ||
        t.includes("chantier") ||
        t.includes("devis") ||
        t.includes("facture") ||
        t.includes("marketplace") ||
        t.includes("projet") ||
        t.includes("project") ||
        raw.includes("مشروع");

      if (openModules) {
        if (
          t.includes("chantier") ||
          t.includes("projet") ||
          t.includes("project") ||
          raw.includes("مشاريع") ||
          raw.includes("مشروع") ||
          raw.includes("ورشة")
        ) {
          speakBack(
            lang === "fr-FR"
              ? "Ouverture de la gestion de chantier"
              : lang === "ar-SA"
                ? "فتح إدارة الموقع"
                : "Opening site management",
          );
          routerInstance.push("/gestion-chantier");
          return;
        }
        if (
          t.includes("devis") ||
          t.includes("facturation") ||
          t.includes("facture") ||
          t.includes("quote") ||
          t.includes("invoice") ||
          raw.includes("فاتورة") ||
          raw.includes("فواتير")
        ) {
          speakBack(
            lang === "fr-FR"
              ? "Devis et facturation"
              : lang === "ar-SA"
                ? "العروض والفواتير"
                : "Quotes and invoices",
          );
          routerInstance.push("/gestion-devis-facturation");
          return;
        }
        if (
          t.includes("marketplace") ||
          t.includes("boutique") ||
          t.includes("magasin") ||
          t.includes("store") ||
          raw.includes("متجر") ||
          raw.includes("سوق") ||
          raw.includes("منتجات") ||
          t.includes("shopping")
        ) {
          speakBack(
            lang === "fr-FR"
              ? "Accès au marketplace"
              : lang === "ar-SA"
                ? "السوق"
                : "Opening marketplace",
          );
          routerInstance.push("/gestion-marketplace");
          return;
        }
        if (
          t.includes("espace") ||
          t.includes("client") ||
          t.includes("accueil") ||
          t.includes("home") ||
          t.includes("dashboard") ||
          raw.includes("الرئيسية") ||
          raw.includes("دار") ||
          raw.includes("أكوي")
        ) {
          const user = getStoredUser();
          const targetRole = user?.role || "client";
          speakBack(
            lang === "fr-FR"
              ? "Retour à votre espace"
              : lang === "ar-SA"
                ? "العودة إلى مساحتك"
                : "Returning to your space",
          );
          routerInstance.push(`/espace/${targetRole}`);
          return;
        }
      }

      speakBack(
        lang === "fr-FR"
          ? "Je n'ai pas compris. Essayez « nouveau projet », « ouvre devis » ou « marketplace »."
          : lang === "ar-SA"
            ? "لم أفهم. جرّب « مشروع جديد » أو « افتح الفواتير »."
            : "I didn't catch that. Try « new project », « open quotes », or « marketplace ».",
      );
    },
    [lang, setLang, speakBack],
  );

  const toggleListen = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setIsListening(false);
      setSupportText("");
      return;
    }

    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor() as any;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = speechRecognitionLang(lang);

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const transcript = (last[0]?.transcript ?? "").trim();
      setSupportText(transcript || "…");
      if (transcript) handleCommand(transcript, router);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      setTimeout(() => setSupportText(""), 5000);
    };

    recognition.onerror = (e: { error: string }) => {
      console.warn("SpeechRecognition:", e.error);
      setIsListening(false);
      recognitionRef.current = null;
      const msg =
        e.error === "not-allowed"
          ? lang === "fr-FR"
            ? "Micro refusé — autorisez le micro dans le navigateur."
            : lang === "ar-SA"
              ? "تم رفض الميكروفون من المتصفح."
              : "Microphone blocked — allow access in the browser."
          : e.error === "no-speech"
            ? lang === "fr-FR"
              ? "Pas entendu — réessayez."
              : lang === "ar-SA"
                ? "لم أسمع شيئًا."
                : "No speech heard — try again."
            : lang === "fr-FR"
              ? "Erreur micro — réessayez."
              : lang === "ar-SA"
                ? "خطأ في الميكروفون."
                : "Mic error — try again.";
      setSupportText(msg);
    };

    try {
      recognitionRef.current = recognition;
      setSupportText(
        lang === "fr-FR" ? "Écoute…" : lang === "ar-SA" ? "جاري الاستماع…" : "Listening…",
      );
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("SpeechRecognition start:", err);
      setSupportText(
        lang === "fr-FR"
          ? "Micro indisponible — recliquez."
          : lang === "ar-SA"
            ? "الميكروفون غير متاح."
            : "Mic unavailable — click again.",
      );
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  if (!isSupported) return null;

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={toggleListen}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-red-500/50"
            : "bg-gradient-to-r from-yellow-400 to-amber-600 text-gray-900 shadow-amber-500/40 hover:shadow-amber-500/60"
        }`}
        aria-label={
          lang === "fr-FR" ? "Assistant vocal" : lang === "ar-SA" ? "المساعد الصوتي" : "Voice assistant"
        }
        title={
          lang === "fr-FR"
            ? "Dictez une commande (ex. nouveau projet, ouvre devis)"
            : lang === "ar-SA"
              ? "أمر صوتي"
              : "Say a command (e.g. new project, open quotes)"
        }
      >
        {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-gray-800" />}
      </button>
      {supportText && (
        <div
          className="absolute right-[calc(100%+16px)] top-1/2 z-[120] max-w-[min(280px,70vw)] translate-y-[-50%] whitespace-normal rounded-2xl border border-white/20 bg-gray-900/95 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-xl"
          dir={lang === "ar-SA" ? "rtl" : "ltr"}
        >
          {supportText}
        </div>
      )}
    </div>
  );
}
