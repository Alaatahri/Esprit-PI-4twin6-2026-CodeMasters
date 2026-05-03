"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const DEFAULT_MESSAGES = [
  {
    role: "bot",
    text: "Bonjour ! Je suis l'assistant BMP.tn. Comment puis-je vous aider ?",
  },
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (
      lower.includes("login") ||
      lower.includes("connexion") ||
      lower.includes("se connecter")
    ) {
      return "Pour vous connecter, cliquez sur le bouton Login dans la barre de navigation ou allez sur la page /login.";
    }
    if (
      lower.includes("inscription") ||
      lower.includes("s'inscrire") ||
      lower.includes("créer un compte")
    ) {
      return "Pour créer un compte, rendez-vous sur la page /inscription.";
    }
    if (
      lower.includes("projet") ||
      lower.includes("chantier") ||
      lower.includes("construction")
    ) {
      return "BMP.tn propose des modules pour la gestion de chantier, les devis et facturation IA, et une marketplace B2B.";
    }
    if (lower.includes("contact") || lower.includes("aide")) {
      return "Vous pouvez nous contacter à contact@bmp.tn ou visiter la page Contact.";
    }
    if (
      lower.includes("bonjour") ||
      lower.includes("salut") ||
      lower.includes("hello")
    ) {
      return "Bonjour ! En quoi puis-je vous aider ?";
    }
    return "Merci pour votre message. Pour plus d'informations, contactez-nous à contact@bmp.tn ou explorez les pages Gestion de Chantier, Devis & Facturation, et Marketplace.";
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user" as const, text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));
    const botReply = getBotResponse(trimmed);
    setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bmp-btn-primary fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition"
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] max-h-[70vh] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-bmp-lg backdrop-blur-xl dark:bg-card/98">
          <div className="border-b border-border bg-muted/50 px-4 py-3 dark:bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bmp-icon-gradient">
                <MessageCircle className="h-4 w-4 text-gray-900" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Assistant BMP.tn</p>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    m.role === "user"
                      ? "border border-brand/25 bg-brand/15 text-foreground dark:bg-brand/20"
                      : "border border-border bg-muted/60 text-foreground dark:bg-muted/40"
                  }`}
                >
                  <p className="text-sm">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Votre message..."
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading}
                className="rounded-xl bmp-btn-primary px-4 py-2.5 font-semibold text-gray-900 opacity-100 transition-opacity disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
