# Déploiement BMP.tn — front (Vercel) + API (Railway ou équivalent)

Ce guide décrit le schéma **recommandé** pour éviter les erreurs du type *DNS_HOSTNAME_RESOLVED_PRIVATE* ou API injoignable : **Next.js sur Vercel**, **NestJS + MongoDB** sur un hébergeur conçu pour une API Node longue durée (ex. **Railway**, Render, Fly.io, VPS).

---

## 1. Pourquoi séparer le backend de Vercel (option courante)

| Sujet | Nest sur Railway / VPS | Nest uniquement sur Vercel Services |
|--------|-------------------------|-------------------------------------|
| Fichiers `public/uploads` | Disque persistant ou volume possible | Stockage éphémère côté fonction — à migrer vers S3 / Blob |
| MongoDB | Connexion TCP classique | Idem mais cold starts / timeouts à gérer |
| Simplicité | `npm run start:prod` comme en local | Config multi-services + chemins `/_/backend` |

Les deux sont possibles ; ce document se concentre sur **Vercel (front) + Railway (API)**.

---

## 2. Backend sur Railway

1. Créer un projet **Railway** → *New service* → déployer depuis le **même dépôt Git**.
2. **Root directory** : `backend` (monorepo).
3. **Build** : `npm install` puis `npm run build` (Railway peut inférer `npm run build` si `package.json` du dossier contient le script).
4. **Start command** : `npm run start:prod` (exécute `node dist/main`).
5. **Variables d’environnement** (minimum) :

| Variable | Exemple / rôle |
|----------|----------------|
| `MONGODB_URI` | URI **MongoDB Atlas** (réseau : autoriser les IP Railway ou `0.0.0.0/0` en test uniquement). |
| `NODE_ENV` | `production` |
| `PORT` | Souvent injecté par Railway — ne pas fixer en dur si la plateforme le fournit. |
| `CORS_ORIGINS` | URL **exacte** du site Next déployé, ex. `https://bmp-tn-xxx.vercel.app` (sans `/` final). Plusieurs origines : séparées par des virgules. |
| `FRONTEND_URL` | Même URL ou domaine public — sert aux **liens dans les e-mails** et est **aussi** prise en compte pour CORS. |
| `MAIL_*` | Pour l’envoi réel des mails en production. |

6. Noter l’URL publique HTTPS du service (ex. `https://bmp-tn-api-production.up.railway.app`).

**Uploads** : en production, prévoir un stockage objet (S3, Vercel Blob, etc.) ; le disque du conteneur Railway peut être réinitialisé au redéploiement.

---

## 3. Frontend sur Vercel

1. Importer le dépôt ; **Root Directory** : `frontend` (ou laisser la racine si le projet Vercel pointe déjà sur `frontend`).
2. Variables d’environnement **pour le build et le runtime** :

| Variable | Valeur |
|----------|--------|
| `BACKEND_ORIGIN` | URL HTTPS du Nest **sans** slash final, ex. `https://xxxx.up.railway.app` |

Les rewrites dans `next.config.ts` envoient `/api/*` vers `${BACKEND_ORIGIN}/api/*`.

**Option** : si tu préfères que le navigateur appelle l’API en absolu :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://xxxx.up.railway.app/api` |

Dans ce cas, aligner `CORS_ORIGINS` / `FRONTEND_URL` sur l’URL du déploiement Vercel.

3. Erreur **DNS_HOSTNAME_RESOLVED_PRIVATE** : en général une variable pointe vers un **hostname interne** (privé). Vérifie que `BACKEND_ORIGIN` et `NEXT_PUBLIC_API_URL` ne contiennent que des **URL publiques** visibles depuis ton navigateur.

---

## 4. Développement local (rappel)

1. Terminal backend : `cd backend` → `npm run start:dev`
2. MongoDB local ou Atlas avec `MONGODB_URI` dans `backend/.env`
3. `frontend/.env.local` :

```env
BACKEND_ORIGIN=http://127.0.0.1:3001
```

---

## 5. Vercel multi-services (tout sur Vercel)

Si tu utilises `vercel.json` avec `experimentalServices` (front + Nest sous `/_/backend`) :

- **Sans variable** `BACKEND_ORIGIN` sur Vercel, le relais utilise **`https://${VERCEL_URL}/_/backend`** (variable système Vercel), **pas** l’`Host` de la requête — sinon erreur **`DNS_HOSTNAME_RESOLVED_PRIVATE`** sur les `fetch` serverless. Voir `src/lib/server-backend-origin.ts`.
- Si l’API est **ailleurs** (Railway), définir `BACKEND_ORIGIN` comme en section 3.
- **CORS** côté Nest : inclure l’URL du site (ex. `https://esprit-pi-4twin6-2026-code-masters.vercel.app`) dans `CORS_ORIGINS` ou `FRONTEND_URL`.

---

## 6. Fichiers modifiés côté code

- `backend/src/cors-origins.ts` — construction de la liste CORS à partir de `CORS_ORIGINS` et `FRONTEND_URL`
- `backend/src/main.ts` — utilise cette liste ; en prod sans configuration, log d’avertissement

---

*Document interne projet CodeMasters / BMP.tn.*
