// Génère games.json à partir de chaque games/<dossier>/game.json.
// Usage : node scripts/build.mjs
//
// Un jeu est soit hébergé ici (games/<dossier>/index.html), soit ailleurs :
// dans ce cas game.json contient "lien": "https://…" et pas besoin d'index.html.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gamesDir = join(root, 'games');
const games = [];

for (const entry of readdirSync(gamesDir, { withFileTypes: true })) {
  // Les dossiers commençant par "_" (ex. _modele) sont ignorés.
  if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
  const dir = join(gamesDir, entry.name);
  const metaPath = join(dir, 'game.json');
  if (!existsSync(metaPath)) {
    console.warn(`! ${entry.name} : pas de game.json, ignoré`);
    continue;
  }
  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch (err) {
    console.error(`x ${entry.name}/game.json invalide : ${err.message}`);
    process.exit(1);
  }
  if (meta.publie === false) continue;

  const externe = typeof meta.lien === 'string' && /^https:\/\//.test(meta.lien);
  if (!externe && !existsSync(join(dir, 'index.html'))) {
    console.warn(`! ${entry.name} : ni index.html ni "lien", ignoré`);
    continue;
  }
  if (meta.image && !existsSync(join(dir, meta.image))) {
    console.warn(`! ${entry.name} : image "${meta.image}" introuvable`);
    meta.image = null;
  }

  games.push({
    slug: entry.name,
    titre: String(meta.titre || entry.name),
    description: String(meta.description || ''),
    badge: String(meta.badge || 'Jeu'),
    icone: String(meta.icone || '🎮'),
    couleur: /^#[0-9a-fA-F]{6}$/.test(meta.couleur || '') ? meta.couleur : '#2b292c',
    image: meta.image ? `games/${entry.name}/${meta.image}` : null,
    date: String(meta.date || ''),
    chemin: externe ? meta.lien : `games/${entry.name}/`,
    externe,
  });
}

// Les plus récents d'abord, puis ordre alphabétique.
games.sort((a, b) => b.date.localeCompare(a.date) || a.titre.localeCompare(b.titre, 'fr'));

writeFileSync(join(root, 'games.json'), JSON.stringify({ jeux: games }, null, 2) + '\n');
console.log(`games.json : ${games.length} jeu(x)`);
