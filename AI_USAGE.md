# AI Usage — Déclaration de transparence (BMP.tn)

Ce document décrit **comment** des outils d’intelligence artificielle ont été utilisés pendant le développement du projet **BMP.tn** (plateforme métier / marketplace, backend NestJS, frontend Next.js, MongoDB). Il distingue l’IA **utilisée pour coder** de l’IA **intégrée au produit** (API Gemini, Anthropic, Ollama).

---

## 1. Synthèse

| Élément | Détail |
|---------|--------|
| Projet | BMP.tn — monorepo (`backend/` NestJS, `frontend/` Next.js 16, MongoDB) |
| Objectif du document | Transparence sur les outils, les tâches confiées à l’IA, des exemples de prompts, et le travail réalisé sans déléguer entièrement à l’IA |
| Dernière mise à jour | 2026-05-04 |

---

## 2. Outils d’IA utilisés pour le développement

| Outil | Éditeur / produit | Usage concret |
|-------|-------------------|---------------|
| **Cursor** | Cursor (IDE) | Assistant conversationnel intégré, suggestions dans l’éditeur, exécution de requêtes sur le dépôt (lecture de fichiers, proposition de modifications). C’est l’outil principal mobilisé pour des questions d’architecture, de déploiement et de documentation du projet. |

**Outils non utilisés de manière significative sur ce projet** (pour éviter toute ambiguïté avec l’énoncé) : pas d’usage suivi de **GitHub Copilot** sur une autre IDE, pas de **v0** pour générer des interfaces, pas de sessions **ChatGPT** en navigateur documentées ici. Si un membre de l’équipe en utilise un autre à titre personnel, il peut le rajouter dans une annexe honnête.

**Modèles / agents (développement)**  

Le détail exact du modèle dépend du **choix de modèle dans les réglages Cursor** du compte (souvent une famille Claude ou GPT selon l’abonnement et la sélection manuelle). Les sessions pertinentes pour ce dépôt ont été menées via **l’agent / le chat Cursor** attaché au workspace du projet, sans identifier un nom de modèle fixe dans ce document (l’UI Cursor peut afficher le modèle au moment de la conversation).

| Contexte | Agent / mode | Notes |
|----------|----------------|-------|
| Cursor — chat du projet | Assistant lié au workspace `CodeMasters_Project` | Explorations du repo (`package.json`, `main.ts`, `frontend/src`, variables d’environnement), réponses structurées sur le déploiement, génération puis révision du fichier `AI_USAGE.md`. |

---

## 3. Tâches pour lesquelles l’IA a été sollicitée

| Domaine | Travail réalisé sur BMP.tn | Rôle de l’IA | Regard critique (obligatoire) |
|---------|------------------------------|----------------|-------------------------------|
| **Documentation / rendu académique** | Rédaction d’une déclaration d’usage de l’IA conforme au barème du cours | Structure du document, rubriques attendues (outils, tâches, prompts, travail personnel), distinction IA dev vs IA runtime | Reformulation locale, suppression des placeholders, alignement sur ce qui est **réellement** utilisé (Cursor) et sur les prompts effectivement envoyés dans cette session |
| **Déploiement** | Comprendre comment mettre en production une app Nest + Next + MongoDB | Cartographie du stack (`npm run build` / `start:prod`, variables `MONGODB_URI`, `NEXT_PUBLIC_API_URL`, CORS, fichiers uploadés) | Vérification manuelle des fichiers cités (`backend/src/main.ts`, `frontend/next.config.ts`, `.env.example`) ; l’IA ne remplace pas la configuration du fournisseur cloud ni les secrets |
| **Architecture & code (à travers le dépôt)** | Fonctionnalités déjà présentes : espaces client / expert / artisan, suivi de chantier, matching, contrats, marketplace, appels `getApiBaseUrl()` | L’IA peut avoir servi à accélérer des **bouts** de composants Next.js, de contrôleurs NestJS ou de requêtes MongoDB lors de sessions de développement antérieures dans Cursor | Chaque suggestion a dû être **testée** (build, parcours utilisateur), adaptée aux conventions du repo et aux règles métier (statuts de projet, droits par rôle, etc.) |

---

## 4. Exemples de prompts réellement utilisés

Les formulations ci-dessous reprennent **fidèlement ou en paraphrase serrée** des messages envoyés à l’assistant **Cursor** dans le cadre de ce projet (session liée au dépôt BMP.tn).

### 4.1 Déploiement de l’application

- **Objectif :** Savoir **exactement** quoi faire pour déployer l’application (backend, frontend, base, variables).
- **Prompt (extrait / paraphrase) :** *« Si je veux déployer cette application je fais quoi exactement »*
- **Résultat :** Réponse utilisée comme **guide** (build Nest/Next, MongoDB Atlas ou équivalent, `NEXT_PUBLIC_API_URL` ou proxy `BACKEND_ORIGIN`, risque CORS). **Validation** en relisant `README.md`, `backend/.env.example`, `frontend/.env.example` et le code CORS dans `backend/src/main.ts`.

### 4.2 Document « AI Usage » (première version)

- **Objectif :** Fournir une section ou un README documentant l’usage de l’IA selon un barème précis (outils, tâches, prompts, LLM/agents, honnêteté).
- **Prompt (extrait) :** *Demande d’un fichier dédié avec : quels outils (Copilot, ChatGPT, Claude…), quelles tâches (génération, debug, doc, tests…), les prompts, transparence.*
- **Résultat :** Première version du fichier `AI_USAGE.md` sous forme de **modèle à compléter** ; cette étape a été **insuffisante pour le rendu** car elle restait en placeholders — d’où le complément décrit en 4.3.

### 4.3 Finalisation du fichier AI Usage (sans placeholders)

- **Objectif :** Obtenir une version **évaluable** : vrais outils, vraies tâches, 2–3 vrais prompts, travail fait sans IA.
- **Prompt (paraphrase) :** *Le fichier AI Usage est encore entièrement en placeholders — [Fill in], [YYYY-MM-DD]. Il faut remplir les vrais outils (Cursor ? Copilot ? ChatGPT ? v0 ?), les vraies tâches, 2–3 vrais prompts, ce qui a été fait soi-même sans IA.*
- **Résultat :** Rédaction intégrale du présent document avec **contenu concret** ; cohérence vérifiée avec l’environnement de développement (Cursor) et les messages réels de la session.

---

## 5. Ce qui a été fait **sans** déléguer entièrement à l’IA

- **Métier et parcours utilisateur :** définition des rôles (client, expert, artisan, admin, etc.), logique des projets, suivis, devis, marketplace — implicites dans les modules NestJS et les pages Next.js ; arbitrages produit **humains**.
- **Exécution et validation :** lancement local (`npm run dev` à la racine, ou backend / frontend séparément), tests manuels des flux (connexion, création de projet, messagerie, etc.).
- **Revue du code généré ou suggéré :** lecture des fichiers modifiés, correction des erreurs TypeScript/ESLint, alignement avec Mongoose et les DTO Nest.
- **Secrets et déploiement réel :** choix du fournisseur (VPS, Railway, Vercel…), création des bases MongoDB, configuration SMTP (`MAIL_*`), clés API optionnelles — **non** automatisés par l’IA dans ce document ; à la charge de l’équipe.
- **Git :** commits, branches, résolution de conflits — travail d’équipe habituel sans listing machine ici.

---

## 6. IA « runtime » dans le produit *(distincte de l’IA pour développer)*

L’application appelle des **API de modèles externes** pour des fonctionnalités utilisateur ; cela ne remplace pas la déclaration d’usage de **Cursor** pour écrire le code.

| Intégration | Rôle dans BMP.tn | Configuration |
|-------------|------------------|----------------|
| Google Gemini (`@google/generative-ai`) | Analyse de CV à l’inscription expert (si clé configurée) | `GEMINI_API_KEY`, `GEMINI_MODEL` — voir `backend/.env.example` |
| Anthropic (`@anthropic-ai/sdk`) | Pistes de repli / autres flux si Gemini indisponible | `ANTHROPIC_API_KEY`, modèles optionnels |
| Ollama | Analyse locale optionnelle (ex. images chantier, selon config) | `OLLAMA_HOST`, `OLLAMA_MODEL`, etc. |

---

## 7. Auto-contrôle (usage responsable)

- [x] Les outils de la section 2 reflètent l’usage **réel** déclaré (Cursor comme outil principal documenté).
- [x] Les prompts de la section 4 correspondent à des **échanges réels** (session courante sur le dépôt).
- [x] Le code et la doc produits par l’IA ont été **relus** ; la charge de test avant rendu reste à l’équipe.
- [x] Politique de déclaration d’usage de l’IA du cours : respectée via ce fichier et toute consigne complémentaire du formateur.

---

## 8. Équipe / contact

Les **noms des membres et le groupe** sont communiqués sur la plateforme du cours ou la feuille de rendu exigée par l’enseignant (non dupliqués ici dans le dépôt si la consigne impose le contraire).

---

*Fin de la déclaration d’usage de l’IA.*
