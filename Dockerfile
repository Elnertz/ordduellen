# Single-image build that serves the web client + API + WebSocket on one port.
# Deploy to any Docker host (Render, Railway, Fly.io, Docker, …). The server
# reads PORT from the environment, so it works out of the box on managed hosts.

FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm install

# Build both workspaces.
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Managed hosts inject PORT; default to 4000 locally.
ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
