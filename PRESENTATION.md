# AgroSentinel

## Présentation du projet

### Le problème

Les producteurs ont besoin d'outils simples pour observer leurs cultures, mieux anticiper les risques et organiser leur activité.

### Notre MVP

AgroSentinel est une application mobile offline-first qui réunit :

- la capture d'images de cultures ;
- l'accès optionnel à une position approximative ;
- des données météo agricoles ;
- une cartographie locale de diagnostics ;
- des outils de logistique et de simulation commerciale.

### Ce qui fonctionne aujourd'hui

- Les diagnostics et leur historique sont enregistrés localement pendant 30 jours.
- La météo est consultée auprès d'Open-Meteo, avec un mode secours explicite hors ligne.
- La position n'est demandée qu'au moment utile et n'est jamais remplacée par une fausse position.
- Les données ne sont pas synchronisées vers un serveur tant qu'une API authentifiée et auditée n'est pas disponible.

### Transparence sur le prototype

Le moteur TFLite, la synchronisation nationale et le paiement Mobile Money ne sont pas encore intégrés. L'interface les présente comme des étapes de démonstration, jamais comme des services opérationnels.

### Feuille de route de mise en production

1. Intégrer et valider l'inférence TFLite native avec un jeu de tests métier.
2. Créer une API sécurisée : comptes, autorisations, validation serveur, journal d'audit et protection anti-rejeu.
3. Ajouter le consentement, le chiffrement local et le contrôle de suppression/export des données.
4. Brancher un prestataire de paiement Mobile Money certifié, côté serveur.

### Valeur ajoutée

Le MVP démontre une base mobile respectueuse des données, prête à être connectée à des services agricoles validés.
