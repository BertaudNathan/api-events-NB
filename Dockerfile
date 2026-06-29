FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le reste du code source
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
