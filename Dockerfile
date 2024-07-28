# Utiliser une image Node.js officielle
FROM node:14

# Créer et définir le répertoire de travail
WORKDIR /app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers de l'application
COPY . .

# Exposer le port sur lequel votre application va s'exécuter
EXPOSE 3000

# Démarrer l'application
CMD ["node", "server.js"]
