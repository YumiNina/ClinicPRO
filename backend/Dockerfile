FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001

RUN ls -la dist/server.js || echo "ALERTA: No se encontro el archivo server.js"

CMD ["node", "dist/server.js"]