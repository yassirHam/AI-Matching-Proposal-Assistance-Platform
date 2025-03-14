FROM ubuntu:latest
LABEL authors="yassi"

ENTRYPOINT ["top", "-b"]
# Build frontend
FROM node:16 as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend .
RUN npm run build

# Build backend
FROM python:3.9-slim
WORKDIR /app/backend

# Install Node.js for frontend build (if needed)
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Copy backend dependencies
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt

# Copy backend source code
COPY backend .

# Copy frontend build artifacts from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/build /app/backend/static

# Start the application
CMD ["python", "app.py"]