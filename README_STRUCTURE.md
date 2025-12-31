# Check Filling - Système de Remplissage de Chèques

## 🏗️ Structure du Projet

Le projet est maintenant organisé en deux dossiers principaux :

```
check-filling/
├── frontend/          # Application Next.js (React)
│   ├── app/          # Pages et routes Next.js
│   ├── components/   # Composants React réutilisables
│   ├── lib/          # Utilitaires et helpers
│   ├── hooks/        # Custom React hooks
│   └── package.json  # Dépendances Node.js
│
└── backend/          # API ASP.NET Core
    ├── Controllers/  # Endpoints API REST
    ├── Services/     # Logique métier
    ├── Models/       # Modèles de données
    ├── Data/         # DbContext et migrations
    └── Program.cs    # Point d'entrée de l'API
```

## 🚀 Lancement Rapide

### Option 1 : Script automatique (Recommandé)
```powershell
.\lancer.ps1
```

### Option 2 : Lancement manuel

**Terminal 1 - Backend :**
```powershell
cd backend
dotnet run
```

**Terminal 2 - Frontend :**
```powershell
cd frontend
npm run dev
```

## 🔧 Configuration Initiale

### 1. Installer les dépendances frontend
```powershell
cd frontend
npm install --legacy-peer-deps
```

### 2. Configurer la base de données
```powershell
cd backend
dotnet ef database update
```

## 📡 Endpoints

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🔐 Compte de Test

- **Email:** test@gmail.com
- **Mot de passe:** test1234

## 📚 Documentation Complète

Voir [LANCEMENT_PROJET.txt](LANCEMENT_PROJET.txt) pour la documentation complète incluant :
- Prérequis système
- Configuration SQL Server
- Résolution des problèmes
- Commandes utiles

## 🛠️ Technologies

**Frontend:**
- Next.js 16.0.10 avec Turbopack
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui

**Backend:**
- ASP.NET Core 10.0
- Entity Framework Core 10.0.1
- SQL Server
- JWT Authentication

## 📝 Notes Importantes

- Les deux serveurs doivent être démarrés pour que l'application fonctionne
- Le backend doit démarrer en premier (le frontend fait des appels API au démarrage)
- SQL Server doit être en cours d'exécution sur localhost
