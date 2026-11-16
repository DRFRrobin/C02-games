/*
 * Intégration de la liste des jeux C02 sur un autre site (WordPress, etc.).
 *
 *   <div data-mini-jeux></div>
 *   <script src="https://drfrrobin.github.io/C02-games/embed.js" async></script>
 *
 * La liste est lue dans games.json à chaque affichage : un jeu ajouté au dépôt
 * apparaît tout seul. Options (attributs du <div>) :
 *   data-colonnes="2"        nombre de colonnes fixe (sinon automatique)
 *   data-ouverture="onglet"  "onglet" (défaut) ou "meme" (même onglet)
 */
(function () {
  var script = document.currentScript;
  var base = new URL('.', script.src).href;

  // Même charte que c02.app (fenêtres de navigateur, rouge, Playfair + Inter).
  var css =
    '.mj-grille{display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),400px));justify-content:center;margin:30px auto;padding:0;list-style:none}' +
    '.mj-grille>li{margin:0;padding:0;list-style:none}' +
    '.mj-fenetre{display:flex;flex-direction:column;height:100%;background:#2b292c;border:1px solid #3c393e;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5);color:#fff;text-decoration:none!important;transition:transform .3s ease,box-shadow .3s ease}' +
    '.mj-fenetre:hover,.mj-fenetre:focus-visible{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.6);outline:none}' +
    '.mj-barre{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#1e1d1f;border-bottom:1px solid #3c393e}' +
    '.mj-point{width:12px;height:12px;border-radius:50%;flex:none}' +
    '.mj-url{margin-left:10px;flex:1;min-width:0;background:#2b292c;color:#a09d9f;border:1px solid #3c393e;border-radius:6px;padding:3px 12px;font:13px Inter,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.mj-vignette{aspect-ratio:16/9;display:grid;place-items:center;font-size:4rem;line-height:1}' +
    '.mj-vignette img{width:38%;height:auto;border-radius:22%;box-shadow:0 8px 24px rgba(0,0,0,.45);margin:0}' +
    '.mj-contenu{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:22px 22px 26px;font-family:Inter,sans-serif}' +
    '.mj-badge{display:inline-block;background:#e74c3c;color:#fff;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:1px;padding:4px 12px;border-radius:20px;line-height:1.5}' +
    '.mj-titre{margin:4px 0 0!important;font-family:"Playfair Display",serif!important;font-weight:600;font-size:1.9rem;line-height:1.1;letter-spacing:-.5px;color:#ff3333!important}' +
    '.mj-desc{margin:0!important;flex:1;color:#ff4d4d;font-size:.98rem;line-height:1.5}' +
    '.mj-bouton{display:inline-block;margin-top:8px;background:#ff3333;color:#fff;padding:11px 28px;font-size:15px;font-weight:500;border-radius:30px;box-shadow:0 4px 15px rgba(255,51,51,.3);transition:background .3s ease,box-shadow .3s ease}' +
    '.mj-fenetre:hover .mj-bouton{background:#e60000;box-shadow:0 6px 20px rgba(255,51,51,.5)}' +
    '.mj-msg{text-align:center;color:#a09d9f;font-family:Inter,sans-serif}';

  function ajouterStyle() {
    if (document.getElementById('mj-style')) return;
    if (!document.querySelector('link[href*="Playfair+Display"]')) {
      var f = document.createElement('link');
      f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500&display=swap';
      document.head.appendChild(f);
    }
    var s = document.createElement('style');
    s.id = 'mj-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function el(tag, classe, texte) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte) n.textContent = texte;
    return n;
  }

  function point(couleur) {
    var p = el('span', 'mj-point');
    p.style.background = couleur;
    return p;
  }

  function rendre(cible, jeux) {
    cible.textContent = '';
    if (!jeux.length) {
      cible.appendChild(el('p', 'mj-msg', 'Aucun jeu pour le moment.'));
      return;
    }
    var ul = el('ul', 'mj-grille');
    var col = parseInt(cible.getAttribute('data-colonnes'), 10);
    if (col > 0) ul.style.gridTemplateColumns = 'repeat(' + col + ', minmax(0, 1fr))';
    var memeOnglet = cible.getAttribute('data-ouverture') === 'meme';

    jeux.forEach(function (jeu) {
      var url = new URL(jeu.chemin, base);
      var a = el('a', 'mj-fenetre');
      a.href = url.href;
      if (!memeOnglet) { a.target = '_blank'; a.rel = 'noopener'; }

      var barre = el('div', 'mj-barre');
      barre.appendChild(point('#ff5f56'));
      barre.appendChild(point('#ffbd2e'));
      barre.appendChild(point('#27c93f'));
      barre.appendChild(el('span', 'mj-url', url.host + url.pathname.replace(/\/$/, '')));

      var v = el('div', 'mj-vignette');
      v.style.backgroundColor = jeu.couleur;
      if (jeu.image) {
        var img = el('img');
        img.src = new URL(jeu.image, base).href;
        img.alt = '';
        img.loading = 'lazy';
        v.appendChild(img);
      } else {
        v.textContent = jeu.icone;
      }

      var c = el('div', 'mj-contenu');
      c.appendChild(el('span', 'mj-badge', jeu.badge || 'Jeu'));
      c.appendChild(el('p', 'mj-titre', jeu.titre));
      c.appendChild(el('p', 'mj-desc', jeu.description));
      c.appendChild(el('span', 'mj-bouton', 'Jouer 🚀'));

      a.appendChild(barre);
      a.appendChild(v);
      a.appendChild(c);
      var li = document.createElement('li');
      li.appendChild(a);
      ul.appendChild(li);
    });
    cible.appendChild(ul);
  }

  function lancer() {
    var cibles = document.querySelectorAll('[data-mini-jeux]:not([data-mj-pret])');
    if (!cibles.length) return;
    ajouterStyle();
    cibles.forEach(function (c) {
      c.setAttribute('data-mj-pret', '');
      c.appendChild(el('p', 'mj-msg', 'Chargement des jeux…'));
    });
    fetch(base + 'games.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        cibles.forEach(function (c) { rendre(c, data.jeux || []); });
      })
      .catch(function (err) {
        console.error('[mini-jeux]', err);
        cibles.forEach(function (c) {
          c.textContent = '';
          c.appendChild(el('p', 'mj-msg', 'Impossible de charger la liste des jeux.'));
        });
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lancer);
  else lancer();
})();
