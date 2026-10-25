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

Autres commandes : `npm test` (règles métier, avec Vitest), `npm run build`, `npm run type-check`, `npm run lint`.

## Ce que contient l'application

- **Accueil** : statut du jour, demande rapide pour le prochain jour ouvré, dernières actualités, services RH.
- **Mon télétravail** : solde, prochain jour à distance, liste des demandes.
- **Nouvelle demande** : trois étapes courtes. 1. Type et dates (calendrier ou rythme hebdomadaire). 2. Précisions (motif, centre de coût, message, justificatif). 3. Vérification et envoi (récapitulatif, planning prévisionnel par semaine, engagements : charte, connexion stable, recontact RH, lettre RH). Chaque étape est validée en la quittant, on peut revenir en arrière sans rien perdre. Une confirmation récapitule la demande avant l'envoi. Le récapitulatif montre la durée (en jours et en heures) et le solde restant. Le brouillon est enregistré au fil de la saisie.
- **Détail d'une demande** : récapitulatif, délai de réponse annoncé, et Valider ou Refuser pour le manager.
- **Mon équipe** (manager) : liste des demandes à valider (Valider, Refuser avec un motif). Le bouton « Ajouter un télétravail pour un membre » ouvre le formulaire avec un choix « Pour qui ? » : soi, ou un membre de l'équipe (la liste propose aussi une personne saisie à la main : matricule, prénom, nom, qui rejoint alors l'équipe). La demande d'un manager est validée à l'envoi.
- **Actualités, annuaire, charte du télétravail, contact, plan du site, mentions légales, déclaration d'accessibilité.**
- **Bandeau d'information** sous l'en-tête (délai de 14 jours du télétravail régulier), refermable et mémorisé dans le navigateur. La version de l'application est affichée en pied de page.
- **Services RH** (bulletins, congés, mutuelle…) : pages de démonstration, sans contenu réel.

## Vision et choix d'ergonomie

L'ancien formulaire TT-07b demande sept étapes, une vingtaine de champs et des formats à deviner. Le principe de cette refonte : demander le moins possible, montrer tout de suite le résultat, et ne jamais faire perdre de saisie.

| Constat sur l'ancien formulaire                                                                                      | Réponse apportée                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sept étapes, une vingtaine de champs affichés d'un coup, sans aperçu du résultat                                     | Trois étapes courtes, un récapitulatif toujours visible, une vérification finale. Un jour de télétravail se pose en deux clics depuis l'accueil. |
| Matricule, nom, manager et centre de coût à ressaisir, avec un code manager à six chiffres à chercher sur l'intranet | Ces informations sont connues du portail et affichées. Seul le centre de coût peut être changé.                                                  |
| Dates au format AAAA/JJ/MM, durée en centièmes de jour, date de fin calculée par un bouton                           | Calendrier, demi-journées par jour, durée en jours et en heures calculée en direct.                                                              |
| Codes 41, 42, 43, « TTX ne pas utiliser », motifs en double                                                          | Trois types avec leur règle écrite sous le nom. Le code RH reste visible sur la demande.                                                         |
| Erreur unique « ERR_TT_042 », sans champ désigné                                                                     | Message sous chaque champ, résumé en haut avec un lien vers chaque erreur.                                                                       |
| Boutons de confirmation inversés, « Effacer tout » sans confirmation, session de cinq minutes qui efface la saisie   | Confirmations claires, brouillon enregistré à chaque modification, rien ne s'efface seul.                                                        |
| Cases en double négation, lettre RH obligatoire, commentaire de 200 caractères minimum pour 50 autorisés             | Cases formulées simplement, parmi les cases, seules l'attestation de connexion et la charte sont obligatoires, aucune limite contradictoire.     |
| Largeur fixe de 1 000 px, texte gris clair, cases de 9 px                                                            | Page adaptée au téléphone, contrastes et cibles tactiles d'au moins 40 px, navigation au clavier, liens d'évitement.                             |

L'accessibilité est traitée comme une contrainte de départ : libellés liés aux champs, erreurs annoncées, focus géré à l'ouverture et à la fermeture des dialogues, déclaration d'accessibilité dans le pied de page.

## Choix techniques

- Vue 3 et TypeScript : un formulaire réactif dont les règles (solde, délai, validation) vivent dans des fonctions typées, séparées de l'interface.
- Vite, Pinia, Vue Router : démarrage rapide, état partagé entre le formulaire, le tableau de bord et la vue manager.
- Tailwind CSS 4. Les couleurs, rayons et durées d'animation sont définis dans `src/assets/main.css`, pour garder une interface cohérente.
- Reka UI pour le calendrier, les dialogues, les onglets et les notifications : la bibliothèque n'impose aucun style et gère le clavier et le focus. Le reste est en HTML natif.
- IBM Plex Sans, servie en local. Icônes Lucide.
- Pas de serveur : la maquette est fonctionnelle dans le navigateur (`localStorage`), ce qui permet de la tester de bout en bout sans infrastructure.

## Organisation du code

```
src/
  domain/       règles métier pures, sans Vue ni navigateur
                dates, jours fériés et ouvrés, formats de date
                solde, planning, validation (un fichier par bloc de règles)
                création des demandes et règles de décision
    seed/       données de démonstration
    __tests__/  tests des règles (Vitest)
  services/     accès au navigateur : localStorage, téléchargement de fichiers
  stores/       état partagé : portal (collaborateurs, demandes), draft (brouillon), preferences
  composables/  logique d'interface réutilisable : étapes, envoi, préremplissage, équipe, liste de demandes
  components/   ui, layout, request (formulaire en étapes), team, dashboard, detail, home, news, directory
  views/        une vue par page, limitée à l'assemblage des composants et des composables
  router/       routes
```

Les dépendances vont dans un seul sens : `views` et `components` utilisent `stores` et `composables`, qui s'appuient sur `domain` et `services`. Le domaine n'importe rien de Vue ni du navigateur. Les fichiers inutilisés, les exports orphelins et les dépendances en trop sont contrôlés avec `npx knip`.

Les règles viennent de l'ancien formulaire (délai de 14 jours pour le régulier, 8 jours occasionnels par an, journée de 7 h 24, réponse sous 15 jours ouvrés, justificatif PDF de 200 Ko, charte v5) et sont regroupées dans `src/domain/rules.ts`. Elles viennent de l'ancien portail et restent à confirmer avec les RH.

## Correspondance avec l'ancien formulaire TT-07b

Les listes de choix sont identiques à celles de l'ancien formulaire : les six types (TTR, TTO, TTE, TTX, ABS, TTR+TTO), les sept motifs et les cinq centres de coût, avec les mêmes libellés et le même ordre.

- **TTX « Ne pas utiliser »** et **CC-9999 (ne pas utiliser)** restent visibles mais ne se choisissent pas.
- **ABS** explique que ce n'est pas du télétravail et renvoie vers « Absences diverses ».
- **TTR+TTO (mixte)** demande un rythme hebdomadaire et des jours ponctuels, et un message qui explique la dérogation. Les jours ponctuels sont décomptés du solde.
- **Motif** obligatoire pour tous les types ; « Autre (préciser dans le commentaire) » rend le message obligatoire.
- **Centre de coût** : celui du demandeur est présélectionné.

Repris : identification du demandeur (préremplie), période, répartition matin / après-midi, équivalence en heures (1 jour = 7 h 24), planning par semaine ISO, solde, attestation de connexion stable, recontact RH, lettre RH, justificatif, commentaire, impression, référence de la demande, délai de traitement, contact, charte v5.

Remplacé : le matricule, le nom, le prénom et le code manager sont connus du portail pour un collaborateur ; ils ne se saisissent que lorsqu'un manager fait une demande pour une autre personne ; le code manager N+1 est remplacé par le manager connu du portail ; le bouton « Calculer » par le calcul automatique ; les listes P/T/D/X du planning par un aperçu calculé à partir des dates ; « Effacer tout » et « Annuler » demandent une confirmation ; le brouillon est enregistré en continu ; les erreurs sont localisées par champ.

Écarté volontairement : le compte à rebours de session qui efface la saisie, la confirmation du matricule sans copier-coller, les cases en double négation, la lettre RH obligatoire, les sept étapes (remplacées par trois), le texte défilant et la fenêtre « nouveauté ». La charte v4 n'est plus en vigueur.

## Limites et suite

- Pas de serveur : pas d'authentification, pas d'e-mail, le justificatif n'est pas envoyé (seuls son nom et sa taille sont gardés). Un back-end porterait l'authentification, les notifications et le stockage des pièces.
- Les services RH autres que le télétravail sont des démonstrations.
- Les règles viennent de l'ancien portail et restent à confirmer avec les RH : journée de 7 h 24, réponse sous 15 jours ouvrés, 8 jours occasionnels par an.
- Le périmètre est volontairement réduit : pas d'annulation, de filtres, d'export ni de planning d'équipe.
- Le texte de la charte v4 n'est pas repris : seule la v5 est en vigueur.
- Les tests couvrent les règles métier (validation, solde, planning, données de démonstration), pas l'interface. Des tests de bout en bout, avec axe-core, seraient la suite logique.
- Aucun test avec un lecteur d'écran n'a été fait.
