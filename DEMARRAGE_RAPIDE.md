# 🚀 DÉMARRAGE RAPIDE

## ✅ ÉTAPE 1 : Ouvrir le projet dans VS Code

### Option A : Ouvrir le workspace (RECOMMANDÉ)
1. Ouvrez VS Code
2. Fichier > Ouvrir l'espace de travail...
3. Sélectionnez `check-filling.code-workspace`

✨ Ceci ouvrira 3 dossiers dans la même fenêtre :
   - Frontend (Next.js)
   - Backend (ASP.NET)
   - Root (fichiers de configuration)

### Option B : Ouvrir le dossier racine
1. Ouvrez VS Code
2. Fichier > Ouvrir le dossier...
3. Sélectionnez le dossier `check-filling`

## ✅ ÉTAPE 2 : Lancer l'application

### Méthode automatique (1 commande)
```powershell
.\lancer.ps1
```

### Méthode manuelle (2 terminaux)
**Terminal 1 - Backend:**
```powershell
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## 🌐 Accéder à l'application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🔐 Connexion test

- **Email:** test@gmail.com
- **Mot de passe:** test1234

---

## ⚠️ Si vous voyez des erreurs TypeScript

1. **Fermez complètement VS Code** (toutes les fenêtres)
2. **Rouvrez le workspace** `check-filling.code-workspace`
3. Attendez que VS Code indexe les fichiers (barre de chargement en bas)
4. Les erreurs devraient disparaître

Si les erreurs persistent :
```powershell
cd frontend
npm install --legacy-peer-deps
```

Puis redémarrez VS Code.

---

## 📚 Documentation complète

Voir [LANCEMENT_PROJET.txt](LANCEMENT_PROJET.txt) pour :
- Configuration SQL Server
- Résolution des problèmes
- Commandes avancées
