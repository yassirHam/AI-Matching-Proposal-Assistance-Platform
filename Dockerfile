# Use Ubuntu as base
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install required dependencies
RUN apt-get update && apt-get install -y \
    wget unzip curl xvfb libxi6 libgconf-2-4 libnss3 libxss1 \
    libappindicator1 libindicator7 fonts-liberation libasound2 \
    libatk1.0-0 libgbm1 libgtk-3-0 libpangocairo-1.0-0 xdg-utils \
    ca-certificates gnupg lsb-release && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install latest Google Chrome
RUN wget -q -O google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome.deb || apt-get -fy install && \
    rm google-chrome.deb

# Get latest Chromedriver version dynamically
RUN CHROME_VERSION=$(google-chrome --version | awk '{print $3}' | cut -d'.' -f1) && \
    wget -q https://chromedriver.storage.googleapis.com/$(curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_VERSION)/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip && \
    mv chromedriver /usr/local/bin/ && \
    chmod +x /usr/local/bin/chromedriver && \
    rm chromedriver_linux64.zip

# Use Python
FROM python:3.12

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port if needed
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
