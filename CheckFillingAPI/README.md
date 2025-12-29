# Check Filling API (.NET 8)

Backend API ASP.NET Core pour l'application de remplissage automatique de chèques.

## 🚀 Démarrage rapide

### Prérequis
- .NET 8 SDK
- Visual Studio 2022 ou VS Code

### Installation

```bash
# Naviguer vers le dossier API
cd CheckFillingAPI

# Restaurer les packages
dotnet restore

# Créer la base de données
dotnet ef database update

# Lancer l'API
dotnet run
```

L'API sera disponible sur : `https://localhost:5001` ou `http://localhost:5000`

## 📚 Documentation

### Swagger UI
Accédez à la documentation interactive : `https://localhost:5001/swagger`

### Endpoints principaux

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur

#### Banques
- `GET /api/banks` - Liste des banques
- `POST /api/banks` - Créer une banque (avec upload PDF)
- `PUT /api/banks/{id}` - Modifier une banque
- `PATCH /api/banks/{id}/positions` - Mettre à jour positions
- `DELETE /api/banks/{id}` - Supprimer une banque

#### Chèques
- `GET /api/checks` - Liste des chèques
- `GET /api/checks/user` - Chèques de l'utilisateur connecté
- `POST /api/checks` - Créer un chèque
- `GET /api/checks/stats` - Statistiques

## 🗄️ Base de données

SQLite avec Entity Framework Core
- Fichier : `checkfilling.db`
- Migrations automatiques au démarrage

## 🔐 Sécurité

- JWT Bearer Authentication
- Mots de passe hashés avec BCrypt
- CORS configuré pour le frontend (localhost:3000)

## 📁 Structure

```
CheckFillingAPI/
├── Controllers/      # Contrôleurs API
├── Models/          # Modèles de données
├── Services/        # Services métier
├── Data/            # DbContext et configuration
├── Program.cs       # Configuration app
└── wwwroot/         # Fichiers statiques (PDFs)
    └── uploads/
```

## ⚙️ Configuration

Fichier `appsettings.json` :
- ConnectionString SQLite
- Clé JWT (à changer en production !)
- CORS origins

## 🔄 Migration depuis Next.js

Le frontend Next.js doit maintenant appeler cette API au lieu des routes internes.
Voir le fichier `MIGRATION_FRONTEND.md` pour les modifications à apporter.
