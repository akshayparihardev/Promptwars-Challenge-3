# =============================================================================
# EcoAgent Multi-Stage Dockerfile
#
# Why multi-stage: separates build dependencies (node_modules, pip packages)
# from the production image, keeping the final artifact under 10MB as required
# by the PromptWars Challenge 3 repository constraint.
#
# Stage 1: Build Next.js static export with node:22-slim
# Stage 2: Build FastAPI backend with python:3.12-slim
# Stage 3: Serve with nginx:stable-alpine (final image)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Frontend Build
# ---------------------------------------------------------------------------
FROM node:22-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --production=false
COPY frontend/ ./

# Why static export: produces plain HTML/CSS/JS that nginx can serve directly
# without a Node.js runtime, drastically reducing the production image size.
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Backend Setup
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS backend-builder

WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# ---------------------------------------------------------------------------
# Stage 3: Production Image (nginx:stable-alpine)
#
# Why Alpine: the smallest possible base image (~5MB), ensuring the total
# production footprint stays well under the 10MB repository limit.
# ---------------------------------------------------------------------------
FROM nginx:stable-alpine AS production

# Install Python runtime in Alpine for FastAPI
RUN apk add --no-cache python3 py3-pip

# Copy built frontend static files
COPY --from=frontend-builder /app/frontend/out /usr/share/nginx/html

# Copy backend with installed dependencies
COPY --from=backend-builder /install /usr/local
COPY --from=backend-builder /app/backend /app/backend

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Startup script to run both nginx and FastAPI
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["/start.sh"]
