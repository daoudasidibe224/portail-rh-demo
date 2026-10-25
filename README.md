# Portail RH · Télétravail

Nouvelle version de l'interface de demande de télétravail (formulaire TT-07b de l'ancien portail RH). L'ancien formulaire demandait sept étapes et une vingtaine de champs. Ici, un jour de télétravail se pose en deux clics depuis l'accueil, et un manager valide une demande en un clic.

Maquette Figma : https://www.figma.com/design/pMdBtB4FklCsKyJ4YPGPar

## Lancer le projet

Node 22.18 ou 24.12 minimum.

```bash
npm install
npm run dev
```

L'application s'ouvre sur http://localhost:5173 avec un jeu de données de démonstration : Camille Martin, responsable support, manager de trois personnes. Les dates se calculent à partir du jour d'ouverture. Tout est gardé dans le `localStorage` du navigateur, il n'y a pas de serveur. Le lien « Réinitialiser la démo » en bas de page remet les données de départ.

Autres commandes : `npm run build`, `npm run type-check`, `npm run lint`.

## Ce que contient l'application

- **Accueil** : statut du jour, demande rapide pour le prochain jour ouvré, dernières actualités, services RH.
- **Mon télétravail** : semaine en cours, solde, liste des demandes (filtres, tri, période).
- **Nouvelle demande** : type (occasionnel, régulier, exceptionnel), calendrier, message, justificatif, charte. Le récapitulatif montre la durée et le solde restant avant l'envoi. Le brouillon est enregistré au fil de la saisie.
- **Détail d'une demande** : suivi, annulation, impression.
- **Mon équipe** (manager) : demandes à valider avec tri, filtres et validation en lot, planning de présence avec export CSV.
- **Actualités, annuaire, charte du télétravail, plan du site, mentions légales, déclaration d'accessibilité.**
- **Services RH** (bulletins, congés, mutuelle…) : pages de démonstration avec des données fictives.

## Choix techniques

- Vue 3, TypeScript, Vite, Pinia, Vue Router.
- Tailwind CSS 4. Les couleurs, rayons et durées d'animation sont définis dans `src/assets/main.css`.
- Reka UI pour le calendrier, les dialogues, les onglets et les notifications : la bibliothèque n'impose aucun style et gère le clavier et le focus. Le reste est en HTML natif.
- IBM Plex Sans, servie en local.
- Icônes Lucide.

## Organisation du code

```
src/
  domain/       règles métier sans Vue : dates, solde, validation, libellés
    seed/       données de démonstration
  services/     accès au localStorage
  stores/       portal (collaborateurs, demandes), draft (brouillon), preferences
  composables/  petits outils réutilisables (pagination, titre de page, média)
  components/   ui, layout, request, team, home, news, directory, dashboard
  views/        une vue par page
  router/       routes
```

Les règles RH (8 jours occasionnels par an, 14 jours de prévenance pour le régulier, 2 jours par semaine au plus, charte v5) sont regroupées dans `src/domain/rules.ts`. Elles viennent de l'ancien portail et restent à confirmer avec les RH.

## Limites

- Pas de serveur : pas d'authentification, pas d'e-mail, le justificatif n'est pas envoyé (seuls son nom et sa taille sont gardés).
- Les services RH autres que le télétravail sont des démonstrations.
