// Script pour installer les dépendances Python nécessaires au scraping
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Chemin vers le fichier requirements.txt
const requirementsPath = path.join(__dirname, 'requirements.txt');

// Créer le fichier requirements.txt s'il n'existe pas
if (!fs.existsSync(requirementsPath)) {
  fs.writeFileSync(requirementsPath, 'requests\nbeautifulsoup4\n');
  console.log('Fichier requirements.txt créé');
}

// Fonction pour installer les dépendances Python
function installPythonDeps() {
  console.log('Installation des dépendances Python...');
  
  // Déterminer la commande Python à utiliser (python ou python3)
  const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
  
  // Lancer la commande d'installation
  const pipProcess = spawn(pythonCommand, [
    '-m', 'pip', 'install', '-r', requirementsPath
  ]);
  
  // Afficher la sortie standard
  pipProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  // Afficher la sortie d'erreur
  pipProcess.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  
  // Gérer la fin du processus
  pipProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Installation des dépendances Python terminée avec succès');
    } else {
      console.error(`L'installation des dépendances Python a échoué avec le code ${code}`);
    }
  });
}

// Exécuter l'installation
installPythonDeps();
