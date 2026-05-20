FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
RUN npm ci

FROM deps AS dev

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM deps AS build

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
