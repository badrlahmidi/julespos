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
- ✅ **Smart Split & Checkout** : Moteur de paiement complexe (division par parts égales, par article, totalité), gestion mathématique précise des totaux et TVA, intégration multi-méthodes de paiement avec animations de succès.
- ✅ **Floor Plan Interactif** : Plan de salle en CSS Grid avec "Glassmorphism", transfert de tables via Drag-and-Drop, indicateurs de temps d'attente, et badges de statut stricts.

### Modules Opérationnels ("Back-of-House" & Sécurité)
- ✅ **KDS (Kitchen Display System)** : Interface cuisine "glanceable", tri FIFO, marqueurs d'urgence (priorité), alertes sonores (Audio Hook), et vue de consolidation.
- ✅ **Sécurité & RBAC** : Login par code PIN type iOS avec feedback tactile (Framer Motion), wrapper `RequirePermission` bloquant les actions sensibles, journal d'audit crypté et persistant.
- ✅ **Management UI** : Back-office simple pour la gestion du personnel et la consultation des logs d'audit.

---

## 2. Ce Qui Manque pour un "Go-To-Market" (10/10 Ready)

Bien que le MVP soit bluffant, un restaurant en production nécessite des fonctionnalités de gestion avancée et des garanties de sécurité des données. Voici les éléments critiques manquants :

### A. Persistance Réelle (Cloud & Base de Données)
Actuellement, les données sont stockées via Zustand `persist` (LocalStorage). C'est parfait pour la résilience "Offline-first", mais insuffisant pour une sauvegarde centralisée.
- 🔴 **Besoin** : Intégration de **TanStack Query** avec un backend (Supabase, Firebase, ou un backend custom Node.js/PostgreSQL).
- 🔴 **Sync Offline/Online** : Utiliser IndexedDB et les Service Workers pour synchroniser les commandes créées hors-ligne une fois la connexion rétablie.

### B. Modificateurs Complexes & Variantes
Les types incluent les `modifiers`, mais l'interface ne gère pas la complexité réelle d'un restaurant (ex: "Cuisson: Saignant", "Supplément Cheddar +1.50€", "Sans Oignon").
- 🔴 **Besoin** : Une modal `ProductCustomizer` qui s'ouvre avant l'ajout au ticket pour configurer la cuisson, les suppléments et les exclusions.

### C. Impression Physique (Tickets & Factures)
Un POS doit imprimer. Sans cela, on ne peut pas légalement ouvrir un restaurant.
- 🔴 **Besoin** : Support de l'API WebUSB / WebBluetooth ou des serveurs d'impression locaux (ESC/POS protocol) pour imprimer les tickets de caisse (Epson, Star Micronics) et les tickets de préparation (en cas de panne du KDS).

### D. Comptabilité & Clôture de Caisse (Z-Report)
Le logiciel doit gérer le cycle de vie de l'argent physique.
- 🔴 **Besoin** : Module de clôture de journée (X-Report pour la lecture, Z-Report pour la fermeture), calcul des fonds de tiroir, et génération d'un export comptable standard.

### E. Multi-Devices & WebSockets
Si le Serveur A prend une commande, le KDS et l'iPad du Serveur B doivent se mettre à jour instantanément.
- 🔴 **Besoin** : Remplacer l'état local par un état partagé via **WebSockets** (ex: Socket.io, Pusher, Supabase Realtime).

---

## 3. Améliorations & Optimisations Techniques (Tech Debt)

Pour garantir une expérience à 60 FPS sans crash au bout de 12h de service :

1. **Sécurité Cryptographique** : Remplacer la fonction `btoa` par un vrai algorithme de hash (bcrypt/Argon2) côté serveur pour les PINs.
2. **Précision Monétaire** : Remplacer les fonctions de rounding (`Math.round`) par une librairie spécialisée comme `currency.js` ou `decimal.js` pour éviter la moindre erreur comptable.
3. **Polyfills Tactiles** : Le Drag-and-Drop HTML5 (`draggable={true}`) du Floor Plan fonctionne mal sur les tablettes iOS/Android natives. Migrer vers `dnd-kit` ou utiliser les gesture handlers de `framer-motion`.
4. **Bundle Size & Lazy Loading** : Implémenter le chargement différé (Lazy Loading) pour le KDS et le Back-Office afin d'accélérer le chargement initial du POS.
5. **Internationalisation (i18n)** : Préparer l'application pour d'autres marchés en extrayant les textes dans des fichiers de traduction (ex: `next-intl`).

---

## 4. Mega Roadmap : Les Prochaines Phases (7 à 10)

Voici le plan d'attaque pour amener Ritaj POS au niveau de "Licorne de la FoodTech".

### Phase 7 : Sync & Realtime (Le Cœur Réseau)
- [ ] Configurer un backend PostgreSQL (via Prisma ou Drizzle).
- [ ] Mettre en place un serveur WebSocket.
- [ ] Connecter le store Zustand au serveur : chaque ajout au ticket diffuse un événement `ORDER_UPDATED`.
- [ ] Créer une logique de réconciliation offline (sauvegarde dans IndexedDB -> Retry asynchrone).

### Phase 8 : Le Moteur de Personnalisation (Menu Engine)
- [ ] Refactor du modèle de données Produit pour inclure : `MenuGroups`, `ModifierOptions`, et `PricingRules`.
- [ ] Créer la Modale de Configuration Produit (Choix de la cuisson, suppléments, allergies).
- [ ] Intégrer les "Suites" (Entrée -> Plat -> Dessert) dans l'OrderTicket et le KDS.

### Phase 9 : Hardware & Impression (La Connexion Physique)
- [ ] Implémenter une bibliothèque JavaScript pour le protocole ESC/POS.
- [ ] Créer l'UI pour configurer les imprimantes réseau (IP) ou Bluetooth.
- [ ] Générer des templates de tickets de caisse légaux (TVA, SIRET, QR Code).
- [ ] Contrôler l'ouverture du tiroir-caisse via un signal ESC/POS.

### Phase 10 : Intelligence Business (Back-Office)
- [ ] Dashboard analytique avancé (Revenu par heure, produits les plus vendus, temps d'attente moyen).
- [ ] Module de clôture de caisse (Z-Report).
- [ ] Export comptable automatisé (FEC, CSV).
- [ ] Outil CRM pour la fidélité client (reconnaissance par numéro de téléphone ou QR Code).

---
*Ritaj POS - Architectural Design Document. Preparé pour la conquête du marché de la restauration 2026+.*
