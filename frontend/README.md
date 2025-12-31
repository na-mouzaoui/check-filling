<<<<<<< HEAD
# check-filling-print
=======
# Automatic Check Filling System / Système de Remplissage Automatique de Chèques

## English

### Overview

A professional web application designed to automate the filling and printing of bank checks for Algerian banks. This system provides precise calibration tools, PDF template management, and automated number-to-text conversion in French.

### Key Features

**Bank Management**
- Support for multiple Algerian banks (BNA, CPA, BEA, BADR, CNEP, BDL, ABC Bank, AGB)
- PDF template upload and management for each bank
- Persistent storage of bank configurations

**Check Calibration**
- Interactive visual calibration interface
- Real-time position adjustment for all check fields
- Pixel-precise positioning controls (X, Y coordinates, width, font size)
- Support for multi-line amount text (automatic word wrapping)
- PDF overlay preview during calibration
- Collapsible field editors for improved workflow

**Check Creation**
- Automated form filling with real-time preview
- Amount formatting with automatic thousand separators
- Intelligent number-to-words conversion supporting up to 9,999,999,999 DZD
- Automatic handling of decimal amounts ("et zéro centimes" when applicable)
- Wilaya (province) selection from complete list
- Date picker with French formatting
- Payee and reference field management

**Preview and Printing**
- Real-time check preview with PDF background
- Identical preview rendering in both calibration and creation views
- Print confirmation dialog
- Automatic redirection to history after printing

**History Management**
- Complete check history tracking
- Export functionality (PDF, CSV, Excel)
- Search and filter capabilities
- Detailed check information display

**Authentication**
- Secure login system
- Session management
- User-specific data isolation

### Technology Stack

**Frontend**
- Next.js 16.0.10 (App Router with Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- react-pdf / pdf.js for PDF rendering

**Backend**
- Next.js API Routes
- Server Actions
- File system storage (JSON)
- PDF worker with module support

**UI Components**
- Custom form controls
- Toast notifications
- Dialog modals
- Responsive layout with sidebar navigation

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd automatic-check-filling

# Install dependencies
npm install --legacy-peer-deps

# Copy PDF worker
npm run setup-worker
# or manually:
# Copy-Item "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" -Destination "public\pdf.worker.min.mjs" -Force

# Run development server
npm run dev
```

### Configuration

The application uses file system storage in the `data/` directory:
- `data/banks.json` - Bank configurations and positions
- `public/uploads/` - PDF templates

### Usage

**Initial Setup**
1. Navigate to "Banques" section
2. Select a bank
3. Upload a PDF template of the check
4. Go to "Calibrage" to configure field positions

**Calibration Process**
1. Select the bank from dropdown
2. Adjust position controls for each field:
   - City (blue)
   - Date (green)
   - Payee (purple)
   - Amount in words (orange)
   - Amount in words line 2 (optional, darker orange)
   - Amount (red)
3. Use pixel-level controls: X, Y, Width, Font Size
4. Save positions - confirmation toast will appear

**Creating a Check**
1. Go to "Nouveau Chèque"
2. Enter amount (automatic thousand separators)
3. Verify/edit amount in words (auto-generated)
4. Enter payee name
5. Select wilaya
6. Choose date
7. Select bank
8. Add reference (optional)
9. Review preview with colored rectangles
10. Click "Imprimer" and confirm

**Viewing History**
1. Navigate to "Historique"
2. Browse all created checks
3. Export data as needed (PDF, CSV, Excel)

### Project Structure

```
automatic-check-filling/
├── app/
│   ├── actions.ts                 # Server actions
│   ├── api/
│   │   └── banks/
│   │       ├── route.ts           # GET/POST banks
│   │       └── [id]/route.ts      # PATCH/DELETE bank by ID
│   ├── banques/                   # Bank management page
│   ├── calibrage/                 # Calibration page
│   ├── cheque/                    # Check creation page
│   ├── dashboard/                 # Dashboard page
│   ├── historique/                # History page
│   └── login/                     # Login page
├── components/
│   ├── bank-management.tsx        # Bank CRUD interface
│   ├── calibration-tool.tsx       # Calibration interface
│   ├── check-canvas.tsx           # Shared PDF + overlay canvas
│   ├── check-form.tsx             # Check creation form
│   ├── check-preview.tsx          # Preview wrapper
│   ├── check-history.tsx          # History table
│   ├── pdf-viewer.tsx             # PDF.js wrapper
│   └── ui/                        # Shadcn components
├── lib/
│   ├── auth.ts                    # Authentication utilities
│   ├── banks-store.ts             # Bank persistence (JSON)
│   ├── db.ts                      # In-memory database
│   ├── number-to-words.ts         # FR number conversion
│   ├── text-utils.ts              # Text wrapping utilities
│   └── wilayas.ts                 # Algerian provinces list
├── public/
│   ├── pdf.worker.min.mjs         # PDF.js worker
│   └── uploads/                   # Bank PDF templates
└── data/
    └── banks.json                 # Persistent bank data
```

### API Endpoints

**Banks**
- `GET /api/banks` - List all banks
- `POST /api/banks` - Create new bank
- `PATCH /api/banks/[id]` - Update bank (positions or PDF)
- `DELETE /api/banks/[id]` - Delete bank

### Troubleshooting

**PDF Worker Issues**
- Ensure `pdf.worker.min.mjs` exists in `public/` directory
- Worker must be a module file (.mjs)
- Check browser console for worker loading errors

**Position Saving Fails**
- Check browser console for detailed error logs
- Verify `data/` directory exists and is writable
- Confirm bank ID matches between frontend and backend

**PDF Not Displaying**
- Verify PDF file is in `public/uploads/`
- Check file permissions
- Ensure PDF is a valid format

### Development

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

### License

Proprietary - All rights reserved

---

## Français

### Vue d'ensemble

Une application web professionnelle conçue pour automatiser le remplissage et l'impression de chèques bancaires pour les banques algériennes. Ce système fournit des outils de calibrage précis, la gestion de modèles PDF et la conversion automatique de nombres en lettres en français.

### Fonctionnalités Principales

**Gestion des Banques**
- Support de plusieurs banques algériennes (BNA, CPA, BEA, BADR, CNEP, BDL, ABC Bank, AGB)
- Téléchargement et gestion de modèles PDF pour chaque banque
- Stockage persistant des configurations bancaires

**Calibrage des Chèques**
- Interface de calibrage visuelle interactive
- Ajustement en temps réel de la position de tous les champs
- Contrôles de positionnement au pixel près (coordonnées X, Y, largeur, taille de police)
- Support du texte de montant sur plusieurs lignes (retour à la ligne automatique)
- Aperçu avec superposition PDF pendant le calibrage
- Éditeurs de champs repliables pour un flux de travail amélioré

**Création de Chèques**
- Remplissage automatique de formulaire avec aperçu en temps réel
- Formatage du montant avec séparateurs de milliers automatiques
- Conversion intelligente de nombres en lettres supportant jusqu'à 9 999 999 999 DZD
- Gestion automatique des montants décimaux ("et zéro centimes" le cas échéant)
- Sélection de wilaya à partir de la liste complète
- Sélecteur de date avec formatage français
- Gestion des champs bénéficiaire et référence

**Aperçu et Impression**
- Aperçu du chèque en temps réel avec fond PDF
- Rendu identique dans les vues calibrage et création
- Boîte de dialogue de confirmation d'impression
- Redirection automatique vers l'historique après impression

**Gestion de l'Historique**
- Suivi complet de l'historique des chèques
- Fonctionnalité d'exportation (PDF, CSV, Excel)
- Capacités de recherche et de filtrage
- Affichage détaillé des informations de chèque

**Authentification**
- Système de connexion sécurisé
- Gestion de session
- Isolation des données par utilisateur

### Stack Technique

**Frontend**
- Next.js 16.0.10 (App Router avec Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- Composants Shadcn/ui
- react-pdf / pdf.js pour le rendu PDF

**Backend**
- Routes API Next.js
- Server Actions
- Stockage système de fichiers (JSON)
- Worker PDF avec support de modules

**Composants UI**
- Contrôles de formulaire personnalisés
- Notifications toast
- Modales de dialogue
- Disposition responsive avec navigation par barre latérale

### Installation

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd automatic-check-filling

# Installer les dépendances
npm install --legacy-peer-deps

# Copier le worker PDF
npm run setup-worker
# ou manuellement :
# Copy-Item "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" -Destination "public\pdf.worker.min.mjs" -Force

# Lancer le serveur de développement
npm run dev
```

### Configuration

L'application utilise le stockage système de fichiers dans le répertoire `data/` :
- `data/banks.json` - Configurations et positions des banques
- `public/uploads/` - Modèles PDF

### Utilisation

**Configuration Initiale**
1. Accéder à la section "Banques"
2. Sélectionner une banque
3. Télécharger un modèle PDF du chèque
4. Aller dans "Calibrage" pour configurer les positions des champs

**Processus de Calibrage**
1. Sélectionner la banque dans le menu déroulant
2. Ajuster les contrôles de position pour chaque champ :
   - Ville (bleu)
   - Date (vert)
   - Bénéficiaire (violet)
   - Montant en lettres (orange)
   - Montant en lettres ligne 2 (optionnel, orange foncé)
   - Montant (rouge)
3. Utiliser les contrôles au niveau pixel : X, Y, Largeur, Taille police
4. Sauvegarder les positions - un toast de confirmation apparaîtra

**Création d'un Chèque**
1. Aller dans "Nouveau Chèque"
2. Entrer le montant (séparateurs de milliers automatiques)
3. Vérifier/modifier le montant en lettres (généré automatiquement)
4. Entrer le nom du bénéficiaire
5. Sélectionner la wilaya
6. Choisir la date
7. Sélectionner la banque
8. Ajouter une référence (optionnel)
9. Revoir l'aperçu avec les rectangles colorés
10. Cliquer sur "Imprimer" et confirmer

**Consultation de l'Historique**
1. Naviguer vers "Historique"
2. Parcourir tous les chèques créés
3. Exporter les données selon les besoins (PDF, CSV, Excel)

### Structure du Projet

```
automatic-check-filling/
├── app/
│   ├── actions.ts                 # Actions serveur
│   ├── api/
│   │   └── banks/
│   │       ├── route.ts           # GET/POST banques
│   │       └── [id]/route.ts      # PATCH/DELETE banque par ID
│   ├── banques/                   # Page gestion des banques
│   ├── calibrage/                 # Page de calibrage
│   ├── cheque/                    # Page création de chèque
│   ├── dashboard/                 # Page tableau de bord
│   ├── historique/                # Page historique
│   └── login/                     # Page connexion
├── components/
│   ├── bank-management.tsx        # Interface CRUD banques
│   ├── calibration-tool.tsx       # Interface de calibrage
│   ├── check-canvas.tsx           # Canvas partagé PDF + overlay
│   ├── check-form.tsx             # Formulaire création chèque
│   ├── check-preview.tsx          # Wrapper aperçu
│   ├── check-history.tsx          # Tableau historique
│   ├── pdf-viewer.tsx             # Wrapper PDF.js
│   └── ui/                        # Composants Shadcn
├── lib/
│   ├── auth.ts                    # Utilitaires authentification
│   ├── banks-store.ts             # Persistance banques (JSON)
│   ├── db.ts                      # Base de données en mémoire
│   ├── number-to-words.ts         # Conversion nombres en FR
│   ├── text-utils.ts              # Utilitaires retour à la ligne
│   └── wilayas.ts                 # Liste des wilayas algériennes
├── public/
│   ├── pdf.worker.min.mjs         # Worker PDF.js
│   └── uploads/                   # Modèles PDF bancaires
└── data/
    └── banks.json                 # Données bancaires persistantes
```

### Points de Terminaison API

**Banques**
- `GET /api/banks` - Lister toutes les banques
- `POST /api/banks` - Créer une nouvelle banque
- `PATCH /api/banks/[id]` - Mettre à jour une banque (positions ou PDF)
- `DELETE /api/banks/[id]` - Supprimer une banque

### Dépannage

**Problèmes de Worker PDF**
- S'assurer que `pdf.worker.min.mjs` existe dans le répertoire `public/`
- Le worker doit être un fichier module (.mjs)
- Vérifier la console du navigateur pour les erreurs de chargement du worker

**Échec de Sauvegarde des Positions**
- Consulter la console du navigateur pour les journaux d'erreur détaillés
- Vérifier que le répertoire `data/` existe et est accessible en écriture
- Confirmer que l'ID de la banque correspond entre le frontend et le backend

**PDF Non Affiché**
- Vérifier que le fichier PDF est dans `public/uploads/`
- Vérifier les permissions du fichier
- S'assurer que le PDF est dans un format valide

### Développement

```bash
# Lancer le serveur de développement avec Turbopack
npm run dev

# Construire pour la production
npm run build

# Démarrer le serveur de production
npm start

# Vérification des types
npm run type-check
```

### Licence

Propriétaire - Tous droits réservés
>>>>>>> eebdb673 (1stCommit)
