# demo-service (Express "orders-api") image
ARG NODE_IMAGE=node:22-slim

FROM ${NODE_IMAGE}

ENV NODE_ENV=production
WORKDIR /app

# Install dependencies first (cached layer unless package files change)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY app.js ./

# Run as the unprivileged "node" user that ships with the image
USER node

EXPOSE 5001

# Container is "healthy" only when GET /health returns 2xx
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No .env file inside the image: variables come from compose / docker run --env-file
CMD ["node", "app.js"]
