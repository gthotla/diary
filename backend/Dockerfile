
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime


RUN addgroup -g 1001 -S nodejs && \
    adduser -S diary -u 1001

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules


COPY --chown=diary:nodejs . .


RUN mkdir -p logs secrets uploads && \
    chown -R diary:nodejs /app && \
    chmod -R 755 /app


RUN echo '#!/bin/sh\ncurl -f http://localhost:5000/api/health || exit 1' > healthcheck.sh && \
    chmod +x healthcheck.sh

USER diary

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ./healthcheck.sh

CMD ["npm", "start"]