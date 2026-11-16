(async function () {
  const liste = document.getElementById('liste');
  const etat = document.getElementById('etat');
  const compteur = document.getElementById('compteur');

  function el(tag, classe, texte) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte) n.textContent = texte;
    return n;
  }

  // Adresse affichée dans la fausse barre d'URL.
  function adresse(url) {
    const u = new URL(url, location.href);
    return u.host + u.pathname.replace(/\/$/, '');
  }

  try {
    const rep = await fetch('games.json', { cache: 'no-cache' });
    if (!rep.ok) throw new Error('HTTP ' + rep.status);
    const { jeux } = await rep.json();

    if (!jeux.length) {
      etat.textContent = 'Aucun jeu pour le moment, revenez bientôt !';
      return;
    }

    for (const jeu of jeux) {
      const a = el('a', 'fenetre');
      a.href = jeu.chemin;

      const barre = el('div', 'fenetre-barre');
      barre.append(el('span', 'point r'), el('span', 'point j'), el('span', 'point v'),
        el('span', 'url', adresse(jeu.chemin)));

      const vignette = el('div', 'vignette');
      vignette.style.backgroundColor = jeu.couleur;
      if (jeu.image) {
        const img = el('img');
        img.src = jeu.image;
        img.alt = '';
        img.loading = 'lazy';
        vignette.append(img);
      } else {
        vignette.textContent = jeu.icone;
      }

      const contenu = el('div', 'contenu');
      contenu.append(el('span', 'badge', jeu.badge), el('h2', '', jeu.titre),
        el('p', '', jeu.description), el('span', 'bouton', 'Jouer 🚀'));

      a.append(barre, vignette, contenu);
      const li = el('li');
      li.append(a);
      liste.append(li);
    }

    etat.hidden = true;
    compteur.textContent = jeux.length + (jeux.length > 1 ? ' jeux disponibles' : ' jeu disponible');
  } catch (err) {
    etat.textContent = 'Impossible de charger la liste des jeux.';
    console.error(err);
  }
})();
