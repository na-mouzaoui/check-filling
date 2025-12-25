# Guide d'utilisation - Prévisualisation PDF des chèques

## Résumé des modifications

L'application de remplissage automatique de chèques a été modifiée pour utiliser des fichiers PDF comme arrière-plan pour la prévisualisation des chèques selon la banque sélectionnée.

## Nouveautés

### 1. **Support des PDFs**
- Les modèles de chèques peuvent maintenant être téléchargés au format PDF
- Les PDFs sont affichés en arrière-plan lors de la prévisualisation
- Les champs de texte sont superposés sur le PDF selon les positions calibrées

### 2. **Composants modifiés**

#### `components/pdf-viewer.tsx` (nouveau)
- Composant wrapper pour react-pdf
- Gère le chargement côté client uniquement
- Affiche les états de chargement et d'erreur

#### `components/check-preview.tsx`
- Utilise maintenant le composant PDFViewer
- Affiche le PDF de la banque en arrière-plan si disponible
- Fallback vers un fond gris si pas de PDF

#### `components/calibration-tool.tsx`
- Affiche le PDF pendant le calibrage
- Permet d'ajuster les positions des champs sur le PDF réel

#### `components/bank-management.tsx`
- Interface pour télécharger les PDFs lors de la création/modification de banque
- Affiche un indicateur si un PDF est disponible

### 3. **API modifiées**

#### `app/api/banks/route.ts`
- Gère l'upload des fichiers PDF
- Sauvegarde les PDFs dans `public/uploads/`
- Génère des URLs publiques pour les PDFs

#### `app/api/banks/[id]/route.ts`
- Permet la mise à jour du PDF d'une banque
- Gère l'upload lors de la modification

### 4. **Base de données**

#### `lib/db.ts`
- Le type `Bank` inclut maintenant `pdfUrl?: string`
- Les banques peuvent avoir un lien vers leur PDF

## Utilisation

### Ajouter un PDF à une banque

1. Naviguez vers la page "Banques"
2. Cliquez sur "Ajouter une banque" ou modifiez une banque existante
3. Remplissez le code et le nom de la banque
4. Cliquez sur le champ "Modèle de chèque (PDF)"
5. Sélectionnez un fichier PDF de votre chèque
6. Sauvegardez

### Calibrer les positions avec le PDF

1. Naviguez vers la page "Calibrage"
2. Sélectionnez la banque avec le PDF
3. Le PDF s'affiche en arrière-plan
4. Ajustez les positions X, Y, largeur et taille de police pour chaque champ
5. Les rectangles colorés montrent où le texte apparaîtra
6. Sauvegardez les positions

### Remplir et prévisualiser un chèque

1. Naviguez vers la page "Chèque"
2. Sélectionnez une banque avec PDF
3. Remplissez les informations du chèque
4. La prévisualisation affiche le PDF avec les champs remplis
5. Cliquez sur "Imprimer" pour imprimer le chèque

## Architecture technique

### Dépendances ajoutées
```json
{
  "react-pdf": "pour afficher les PDFs",
  "pdfjs-dist": "worker PDF.js pour le rendu"
}
```

### Structure des fichiers
```
public/
  uploads/           # Dossier pour les PDFs téléchargés
    BNA-*.pdf        # Fichiers PDF nommés avec code banque + timestamp
    CPA-*.pdf
    ...

components/
  pdf-viewer.tsx     # Composant wrapper pour react-pdf
  check-preview.tsx  # Prévisualisation avec PDF
  calibration-tool.tsx  # Calibrage avec PDF
  bank-management.tsx   # Gestion des PDFs
```

### Configuration PDF.js

Le worker PDF.js est chargé depuis unpkg CDN:
```javascript
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

### Chargement dynamique

Pour éviter les erreurs SSR, les composants PDF sont chargés dynamiquement:
```javascript
const PDFViewer = dynamic(() => import("./pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div>Chargement...</div>
})
```

## Avantages

1. **Précision** : Voir le vrai modèle de chèque pendant le calibrage
2. **Visualisation réaliste** : Prévisualisation exacte avant impression
3. **Flexibilité** : Support de différents formats de chèques par banque
4. **Facilité d'utilisation** : Interface intuitive pour upload et calibrage

## Notes importantes

- Les PDFs sont stockés localement dans `public/uploads/`
- Le dossier uploads est ignoré par Git
- Taille maximale de fichier : limite de Next.js (configurable)
- Format supporté : PDF uniquement
- Le premier page du PDF est utilisé pour l'affichage

## Prochaines étapes possibles

1. Support du stockage cloud (Vercel Blob, AWS S3, etc.)
2. Gestion des PDFs multi-pages
3. Compression automatique des PDFs
4. Prévisualisation miniature dans la liste des banques
5. Export PDF avec les champs remplis
