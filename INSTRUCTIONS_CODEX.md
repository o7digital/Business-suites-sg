# Business Suites SG — Instructions à Codex

## Mission

Reprends ce projet Astro existant et fais-le fonctionner dans mon environnement. La maquette est validée : conserve fidèlement son design, ses textes, ses couleurs, ses polices, ses photos, ses animations et sa structure. Travaille à partir du code fourni, sans reconstruire le site depuis une capture ou repartir d'un template.

Objectif : obtenir cette même maquette en fonctionnement, avec une preview consultable et un projet prêt à déployer.

## Démarrage

1. Repère la racine contenant `package.json`. Lis ce document et `README.md`.
2. Utilise Node 22 LTS et le verrouillage `package-lock.json` fourni.
3. Exécute `npm ci`, puis `npm run dev`. Ouvre l'URL réellement affichée par Astro.
4. Exécute `npm run build`. La sortie statique est `dist/`.
5. Pour examiner le build, lance `npm run preview` et utilise l'URL affichée.

Le projet fonctionne sans base de données, CMS, clé API ni variable secrète. Les polices et les photos sont incluses localement.

## Direction artistique validée

- Palette ivoire et bordeaux, accents dorés.
- Typographie Cormorant Garamond + Manrope, fichiers locaux.
- Hero photographique immersif et titre « La ciudad, afuera. Tu mundo, aquí. ».
- Navigation, formulaire de séjour, composition éditoriale de la présentation.
- Six suites avec onglets, caractéristiques et photos distinctes.
- Sections art de vivre, quartier, galerie, questions fréquentes et réservation.
- Présentation responsive et versions espagnole `/` et anglaise `/en/`.

Ne change pas ces choix. Corrige seulement les problèmes réellement constatés : chemins d'assets, débordements, erreurs de compilation ou interactions défectueuses. Ne remplace aucune photo par du stock ou une image générée. N'ajoute pas de tarif, témoignage, note, équipement ou superficie non confirmé.

## Fichiers à utiliser

| Chemin | Rôle |
| --- | --- |
| `src/components/Hotel.astro` | Structure complète et textes ES/EN |
| `src/pages/index.astro` | Accueil espagnol |
| `src/pages/en/index.astro` | Accueil anglais |
| `src/styles/global.css` | Design et responsive |
| `src/styles/fonts.css` | Polices locales |
| `src/scripts/interactions.ts` | Onglets, galerie, menu et dates |
| `src/data/rooms.ts` | Données des six suites |
| `src/data/hotel-source.json` | Informations originales Cloudbeds |
| `src/data/image-sources.json` | Origine des photos et crédits |
| `public/images/` | Photos originales et photo de destination |
| `public/fonts/` | Polices incluses |

## Réservations Cloudbeds

Conserve ce moteur :

https://hotels.cloudbeds.com/es/reservation/Z2jMb3/?currency=mxn

Le formulaire transmet `currency`, `checkin`, `checkout` et `adults`. Les liens des suites utilisent `accommodation_types` avec ces identifiants vérifiés :

| Suite | Identifiant |
| --- | --- |
| Negra | 672970 |
| Morada | 672971 |
| Beige | 672972 |
| Naranja | 672974 |
| Azul | 672975 |
| Roja | 672976 |

La réservation et la confirmation de tarif se font dans Cloudbeds. Ne simule pas de disponibilité dans le site. Vérifie la transmission des dates et l'ouverture du moteur, sans créer de réservation ni effectuer de paiement. Si Cloudbeds affiche une erreur externe, conserve l'URL et indique précisément la limite du contrôle.

## Vérification attendue

- Contrôle visuel à environ 1440 px, 768 px et 390 px, sans débordement horizontal.
- Photos et polices chargées ; aucune ressource manquante.
- Six onglets de suites fonctionnels, avec les bonnes photos et données.
- Galerie : ouverture, précédent/suivant, fermeture et touche Échap.
- Menu mobile, ancres de navigation, passage ES/EN et questions fréquentes.
- Dates : sortie postérieure à l'arrivée, validation avant transmission.
- Liens téléphone, email, Google Maps et réservation.
- Compilation finale réussie. Rapporte uniquement les contrôles réellement réalisés.

## Déploiement

La configuration Astro contient encore l'adresse de la preview d'origine dans `site`. Quand l'URL cible est connue, remplace cette valeur par l'URL réelle du déploiement. Ne laisse pas le domaine ChatGPT comme adresse canonique d'un nouveau site.

Pour Vercel : framework Astro, installation `npm ci`, build `npm run build`, dossier de sortie `dist`, Node 22. Utilise le projet ou dépôt déjà fourni dans mon environnement ; évite de créer des doublons. Prépare une preview de cette maquette si l'accès Vercel est disponible. Sinon, termine la preview locale et donne les commandes utiles.

Le `noindex, nofollow` est intentionnel pour cette maquette. Conserve-le sur une preview. Lors d'une mise en production explicitement demandée, configure le domaine définitif puis le référencement adapté.

## Livraison

Donne l'URL de preview, le chemin du projet, le résultat du build et les éventuelles corrections effectuées. Ne propose pas une nouvelle direction graphique : le résultat attendu est la maquette validée, fidèlement reprise en Astro.
