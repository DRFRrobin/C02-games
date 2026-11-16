# C02 Jeux

Le site des jeux de la C02 Team (hébergé sur GitHub Pages), avec la charte de [c02.app](https://c02.app/), et son intégration dynamique dans WordPress.

- **Site** : https://drfrrobin.github.io/C02-games/
- **Liste des jeux (JSON)** : https://drfrrobin.github.io/C02-games/games.json

## Jeux

| Jeu | Où |
| --- | --- |
| C02 Naval | https://drfrrobin.github.io/C02-Naval/ (dépôt [C02-Naval](https://github.com/DRFRrobin/C02-Naval)) |

## Ajouter un jeu

Créer un dossier `games/mon-jeu/` avec un `game.json` :

```json
{
  "titre": "Mon jeu",
  "description": "Une phrase qui donne envie de jouer.",
  "badge": "Solo",
  "image": "icone.png",
  "couleur": "#2b292c",
  "date": "2026-11-16"
}
```

Ensuite, deux cas :

- **Jeu hébergé ailleurs** (son propre dépôt, comme C02 Naval) : ajouter `"lien": "https://…"` dans `game.json`. Rien d'autre à mettre dans le dossier, à part l'image éventuelle.
- **Jeu hébergé ici** : copier `games/_modele/` et coder le jeu dans `games/mon-jeu/index.html`.

Champs facultatifs : `image` (fichier dans le dossier du jeu), `icone` (emoji si pas d'image), `badge`, `couleur` (fond de la vignette), `"publie": false` (cache le jeu).

Puis pousser sur `main`. Une GitHub Action régénère `games.json` et le commite. Le jeu apparaît alors sur le site **et** sur WordPress.

Tester en local :

```bash
node scripts/build.mjs
```

```bash
npx serve .
```

## Intégration WordPress (c02.app)

La liste est lue en direct dans `games.json`, rien à mettre à jour côté WordPress.

### A. Sans plugin (bloc « HTML personnalisé »)

```html
<div data-mini-jeux></div>
<script src="https://drfrrobin.github.io/C02-games/embed.js" async></script>
```

### B. Avec le plugin (shortcode)

1. Télécharger [`wordpress/c02-jeux.zip`](wordpress/c02-jeux.zip) et l'installer via *Extensions → Ajouter → Téléverser*, puis l'activer.
2. Mettre `[c02_jeux]` dans une page (l'ancien `[mini_jeux]` marche aussi).

### Options

| Bloc HTML | Shortcode | Effet |
| --- | --- | --- |
| `data-colonnes="2"` | `colonnes="2"` | Nombre de colonnes fixe (automatique par défaut) |
| `data-ouverture="meme"` | `ouverture="meme"` | Ouvre le jeu dans le même onglet (nouvel onglet par défaut) |
| — | `url="https://…/"` | Autre adresse du site des jeux |

## Mise à jour du plugin WordPress

Le plugin « C02 Jeux » se met à jour depuis ce dépôt : WordPress affiche la mise à jour dans *Extensions → Mises à jour*, comme les autres plugins. La liste des jeux, elle, se met à jour toute seule sans rien réinstaller.

Pour publier une nouvelle version du plugin :

1. Changer `Version:` dans `wordpress/c02-jeux/c02-jeux.php` (par exemple `1.3.0`).
2. Reconstruire le zip : `cd wordpress && zip -qr c02-jeux.zip c02-jeux`.
3. Committer, puis créer et pousser le tag : `git tag v1.3.0 && git push origin v1.3.0`.

Le workflow `release.yml` vérifie que le tag correspond à la version, puis crée la release avec le zip. Les sites ont la mise à jour dans les 12 heures (ou immédiatement via *Extensions → Mises à jour → Vérifier à nouveau*, après avoir vidé le cache du plugin).

Les installations en version 1.1.0 ou plus ancienne ne reçoivent pas la mise à jour automatiquement : il faut une fois réinstaller le zip de cette version.

## Publication

*Settings → Pages* : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
