# Utilisation des PDFs pour les chèques

## Vue d'ensemble

L'application permet maintenant d'utiliser des fichiers PDF de chèques comme arrière-plan pour la prévisualisation et le remplissage automatique des chèques selon la banque.

## Fonctionnalités

### 1. Gestion des banques avec PDFs

- Accédez à la page "Banques" pour gérer vos banques
- Lors de l'ajout ou la modification d'une banque, vous pouvez télécharger un PDF du modèle de chèque
- Le PDF sera sauvegardé dans le dossier `public/uploads/`

### 2. Prévisualisation avec PDF

- Lorsque vous remplissez un chèque, la prévisualisation affichera le PDF du chèque si disponible
- Si aucun PDF n'est disponible, un fond gris sera affiché
- Les champs de texte seront superposés sur le PDF selon les positions configurées

### 3. Calibrage avec PDF

- Accédez à la page "Calibrage" pour ajuster les positions des champs
- Le PDF du chèque sera affiché en arrière-plan
- Vous pouvez ajuster précisément les positions X, Y, la largeur et la taille de police pour chaque champ
- Les rectangles de couleur montrent les zones où le texte sera placé

## Workflow recommandé

1. **Ajouter une banque**
   - Allez dans "Banques"
   - Cliquez sur "Ajouter une banque"
   - Remplissez le code et le nom
   - Téléchargez le PDF du modèle de chèque
   - Cliquez sur "Ajouter"

2. **Calibrer les positions**
   - Allez dans "Calibrage"
   - Sélectionnez la banque
   - Le PDF du chèque s'affichera en arrière-plan
   - Ajustez les positions de chaque champ (ville, date, bénéficiaire, montant, etc.)
   - Sauvegardez les positions

3. **Remplir un chèque**
   - Allez dans "Chèque"
   - Remplissez les informations
   - Sélectionnez la banque
   - La prévisualisation montrera le PDF avec les champs remplis
   - Cliquez sur "Imprimer" pour imprimer le chèque

## Technologies utilisées

- **react-pdf** : Pour afficher les PDFs dans l'interface
- **pdfjs-dist** : Worker PDF.js pour le rendu des PDFs
- **Next.js API Routes** : Pour gérer l'upload et le stockage des fichiers PDF

## Notes techniques

- Les PDFs sont stockés localement dans `public/uploads/`
- Le dossier `uploads` est ignoré par Git (voir .gitignore)
- Chaque fichier PDF est nommé avec le code de la banque et un timestamp
- Le worker PDF.js est chargé depuis unpkg CDN

## Dépannage

### Le PDF ne s'affiche pas
- Vérifiez que le fichier PDF est bien téléchargé dans `public/uploads/`
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que le worker PDF.js est bien chargé

### Les positions ne sont pas correctes
- Utilisez l'outil de calibrage pour ajuster les positions
- Les coordonnées sont en pixels depuis le coin supérieur gauche
- Testez avec différentes tailles de police si le texte ne s'aligne pas bien

### L'upload de PDF échoue
- Vérifiez que le dossier `public/uploads/` existe
- Vérifiez les permissions du dossier
- La taille du fichier ne doit pas dépasser la limite de Next.js (par défaut 1MB)
