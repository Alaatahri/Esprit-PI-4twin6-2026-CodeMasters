# Plugin Cursor — `vercel/vercel-plugin`

Ce dépôt utilise la commande officielle pour ajouter le [plugin Vercel](https://github.com/vercel/vercel-plugin) (skills, commandes, hooks MCP) dans **Cursor**.

## Installation (recommandée, même machine que Cursor)

À la racine du monorepo :

```bash
npm run plugins:add-vercel
```

Équivalent explicite :

```bash
npx plugins add vercel/vercel-plugin --target cursor --scope project -y
```

| Option | Rôle |
|--------|------|
| `--target cursor` | Installe pour Cursor si la détection automatique échoue (CI, SSH, etc.). |
| `--scope project` | Fichiers du plugin dans le **projet** (à committer si vous versionnez `.cursor/`). |
| `-y` | Pas de prompt interactif. |

Sans `--target`, l’outil exige une détection de `cursor`, `claude` ou `codex` sur le `PATH`.

## Après l’installation

- Redémarrer Cursor ou recharger les outils agent (message affiché par le CLI).
- Si un dossier **`.cursor/`** apparaît à la racine, décidez en équipe de le **committer** ou de l’**ignorer** selon votre politique.

## Branche `main`

Le script `plugins:add-vercel` est défini dans `package.json` sur `main` pour que toute l’équipe utilise la même commande.
