const fs = require('fs');
const path = require('path');

// Ruta al archivo package.json
const packageJsonPath = path.resolve(__dirname, 'package.json');

// Leer el archivo package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Incrementar la versión (semántica: x.y.z)
const versionParts = packageJson.version.split('.').map(Number);
versionParts[2] += 1; // Incrementar el número de parche
if (versionParts[2] >= 10) {
  versionParts[2] = 0;
  versionParts[1] += 1; // Incrementar el número menor si el parche llega a 10
}
packageJson.version = versionParts.join('.');

// Guardar la nueva versión en package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log(`Versión actualizada a ${packageJson.version}`);