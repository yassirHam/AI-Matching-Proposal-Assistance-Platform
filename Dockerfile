# Use Python 3.10 as the base image
FROM python:3.10-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Set the working directory
WORKDIR /app/backend

# Copy backend dependencies
COPY backend/requirements.txt ./
COPY backend/package.json ./

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Copy backend source code
COPY backend .

# Start the application
CMD ["python", "app.py"]