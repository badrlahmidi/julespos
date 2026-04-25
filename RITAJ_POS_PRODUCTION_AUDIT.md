# Ritaj POS : Audit de Production & Roadmap Commerciale (Version 2026)

Ce document constitue un audit profond du système Ritaj POS tel qu'il a été construit lors des Phases 1 à 6, et détaille le plan de marche ("Roadmap") nécessaire pour transformer ce prototype fonctionnel en une solution SaaS commerciale, robuste et prête à être installée dans des restaurants à haut volume.

---

## 1. Ce Qui a Été Accompli (Fondations & MVP)

Nous avons posé des bases architecturales extrêmement solides qui permettent à l'application d'être fluide, réactive et sécurisée.

### Architecture & Stack Technique
- ✅ **Next.js 16+ (App Router)** : Utilisation du Server-Side Rendering (SSR) et du rendu hybride pour des performances optimales.
- ✅ **TypeScript Strict** : Typage complet du domaine métier (`types/pos.ts`, `types/auth.ts`), évitant la majorité des erreurs d'exécution (runtime errors).
- ✅ **Tailwind CSS 4.0** : Configuration d'un "Design System" propre à la restauration (`Modern Restaurant Palette`) avec Dark Mode natif et espacements pensés pour le tactile (Fitts' Law).
- ✅ **State Management (Zustand)** : Gestion globale de l'état ultra-rapide sans re-renders inutiles, incluant le middleware `persist` pour la résilience hors-ligne (PWA/IndexedDB readiness).

### Modules Fonctionnels ("Front-of-House")
- ✅ **Dashboard POS** : Interface à hauteur fixe (native-like), grille de produits avec filtrage par catégorie, ticket de caisse interactif.
- ✅ **Menu Engine & Suites** : Gestion avancée des modificateurs de produits (cuisson, suppléments, allergies) via une modale de configuration, et séquencement des repas ("Entrées", "Plats") intégré au KDS et tickets.
- ✅ **Smart Split & Checkout** : Moteur de paiement complexe (division par parts égales, par article, totalité), gestion mathématique précise des totaux et TVA, intégration multi-méthodes de paiement avec animations de succès.
- ✅ **Floor Plan Interactif** : Plan de salle en CSS Grid avec "Glassmorphism", transfert de tables via Drag-and-Drop, indicateurs de temps d'attente, et badges de statut stricts.

### Modules Opérationnels ("Back-of-House", Hardware & Sécurité)
- ✅ **KDS (Kitchen Display System)** : Interface cuisine "glanceable", tri FIFO, marqueurs d'urgence (priorité), alertes sonores (Audio Hook), et vue de consolidation par "Suites".
- ✅ **Hardware & Impression** : Connexion directe du navigateur vers les périphériques (WebUSB) pour l'impression de tickets légaux en ESC/POS et l'ouverture automatique du tiroir-caisse lors de paiements en espèces.
- ✅ **Sécurité & RBAC** : Login par code PIN type iOS avec feedback tactile, wrapper `RequirePermission` bloquant les actions sensibles, journal d'audit persistant et hiérarchie de droits.
- ✅ **Synchronisation Multi-Devices (Realtime)** : Un serveur custom `socket.io` intégré diffuse l'état en temps réel (Tables, Commandes) vers tous les clients actifs, épaulé par une file d'attente hors-ligne (Offline Queue).
- ✅ **Intelligence Business & Back-office** : Dashboards d'analyse (Recharts), module de clôture de journée financière (Z-Report) avec export CSV FEC, et un module CRM fidélité client de base.

---

## 2. Ce Qui Manque pour un "Go-To-Market" (10/10 Ready)

La solution a atteint une couverture de fonctionnalités quasi-exhaustive pour un MVP commercialisable, mais nécessite une infrastructure Cloud de production.

### A. Persistance Cloud Production (Database)
Le schéma Prisma PostgreSQL existe, mais l'application utilise toujours Zustand `persist` et le broadcast Socket en guise de backend temporaire.
- 🔴 **Besoin** : Brancher Prisma Client dans des Server Actions / API Routes Next.js, et persister réellement chaque transaction, log, et utilisateur dans la base PostgreSQL.
- 🔴 **Sync Hors-Ligne (PWA)** : Utiliser IndexedDB localement couplé avec une librairie (ex: TanStack Query / PWA Service Workers) pour synchroniser asynchrone les commandes créées lors des pannes réseau prolongées (bien qu'une queue mémoire soit déjà en place).

### B. Intégration de Terminaux de Paiement (TPE)
- 🔴 **Besoin** : Interfaçage avec les API de paiement (ex: Stripe Terminal, SumUp, ou protocoles type Concert locaux) pour déclencher les TPE directement depuis l'interface sans saisie manuelle.

---

## 3. Améliorations & Optimisations Techniques (Tech Debt)

Pour garantir une expérience à 60 FPS sans crash au bout de 12h de service :

1. **Sécurité Cryptographique** : Remplacer la fonction `btoa` par un vrai algorithme de hash (bcrypt/Argon2) côté serveur pour les PINs.
2. **Précision Monétaire** : Remplacer les fonctions de rounding (`Math.round`) par une librairie spécialisée comme `currency.js` ou `decimal.js` pour éviter la moindre erreur comptable.
3. **Polyfills Tactiles** : Le Drag-and-Drop HTML5 (`draggable={true}`) du Floor Plan fonctionne mal sur les tablettes iOS/Android natives. Migrer vers `dnd-kit` ou utiliser les gesture handlers de `framer-motion`.
4. **Bundle Size & Lazy Loading** : Implémenter le chargement différé (Lazy Loading) pour le KDS et le Back-Office afin d'accélérer le chargement initial du POS.
5. **Internationalisation (i18n)** : Préparer l'application pour d'autres marchés en extrayant les textes dans des fichiers de traduction (ex: `next-intl`).

---

## 4. Mega Roadmap : Les Futures Phases (11 à 14)

Les phases 7 à 10 ont été intégrées avec succès. Ritaj POS est désormais une application complète. Voici le chemin vers l'échelle "Enterprise".

### Phase 11 : Backend & Cloud Intégration (Mise en Prod)
- [ ] Migrer le stockage de Zustand Persist vers des API Next.js connectées à PostgreSQL via Prisma.
- [ ] Mettre en place TanStack Query pour le fetching et la mise en cache réseau.
- [ ] Gérer l'authentification Server-Side pour protéger les routes Admin/Back-office.

### Phase 12 : Multi-tenant SaaS Architecture
- [ ] Modifier le schéma Prisma pour isoler les données par "Restaurant/Tenant".
- [ ] Créer un "Super-Admin" Dashboard pour gérer les abonnements des différents restaurants clients.

### Phase 13 : Gestion Avancée des Stocks & Ingénierie Menu
- [ ] Lier les "Produits" à des "Ingrédients" pour décrémenter le stock automatiquement au gramme près lors des ventes.
- [ ] Alertes de rupture de stock intelligentes et prédiction des besoins d'achats.

### Phase 14 : Écosystème Connecté
- [ ] Lancement d'une App de prise de commande "Table-side" (QR Code Ordering).
- [ ] Intégration d'UberEats/Deliveroo directement dans le KDS.

---
*Ritaj POS - Architectural Design Document. Preparé pour la conquête du marché de la restauration 2026+.*
