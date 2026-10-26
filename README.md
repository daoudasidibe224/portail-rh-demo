# Portail RH : Télétravail

Nouvelle interface de la demande de télétravail (formulaire TT-07b de l'ancien portail RH). L'application fonctionne sans serveur, avec des données de démonstration.

```bash
npm install
npm run dev
```

Node 22.18 ou 24.12 minimum. L'application s'ouvre sur http://localhost:5173. Le lien « Réinitialiser la démo » en bas de page remet les données de départ.

Autres commandes : `npm run build`, `npm run lint`.

## Choix techniques

- **Vue 3 et TypeScript** : un formulaire réactif dont les règles (solde, délai, validation) sont des fonctions typées, séparées de l'interface.
- **Pinia et Vue Router** : l'état partagé entre le formulaire, la liste des demandes et la vue manager, et une page par route.
- **Tailwind CSS 4** : couleurs, polices et animations définies une fois dans `src/assets/main.css`.
- **Reka UI** : calendrier et dialogues accessibles au clavier, sans style imposé.
- **Sans serveur** : les données restent dans le navigateur (`localStorage`). Pas d'authentification, d'e-mail ni d'envoi de fichier.
- **Ergonomie** : trois étapes au lieu de sept, les informations connues du portail affichées plutôt que ressaisies, un calendrier à la place des dates à taper, la durée calculée en jours et en heures, des erreurs sous chaque champ, un brouillon enregistré à chaque modification et une page adaptée au téléphone.

## Organisation du code

```
src/
  lib/          règles métier sans Vue (listes, validation, solde, dates)
    seed/       données de démonstration
  services/     accès au navigateur (localStorage)
  stores/       état partagé : demandes et collaborateurs, brouillon
  composables/  logique du formulaire : étapes, envoi, préremplissage
  components/   éléments d'écran, rangés par page
  views/        une vue par page
  router/       routes
```

Les vues et les composants utilisent les stores et les composables, qui s'appuient sur `lib` et `services`.
