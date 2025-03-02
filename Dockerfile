# Use a stable Ubuntu version
FROM ubuntu:22.04

# Set maintainer
LABEL authors="Yassi"

# Set environment variables to avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive \
    CHROME_DRIVER_VERSION=114.0.5735.90

# Update system packages and install required dependencies
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    wget unzip curl xvfb libxi6 libgconf-2-4 libnss3 libxss1 \
    libappindicator1 libindicator7 fonts-liberation libasound2 \
    libatk1.0-0 libgbm1 libgtk-3-0 libpangocairo-1.0-0 xdg-utils \
    ca-certificates gnupg lsb-release && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome.deb || apt-get -fy install && \
    rm google-chrome.deb

# Install ChromeDriver
RUN wget -q https://chromedriver.storage.googleapis.com/$CHROME_DRIVER_VERSION/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip && \
    mv chromedriver /usr/local/bin/ && \
    chmod +x /usr/local/bin/chromedriver && \
    rm chromedriver_linux64.zip

# Use Python 3.12
FROM python:3.12

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose default port (if needed)
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
