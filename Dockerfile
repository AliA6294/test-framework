# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

# docker build -t playwright-docker .
# docker run -it --rm --ipc=host mcr.microsoft.com/playwright:v1.46.1-jammy /bin/bash

# FROM node:20-bookworm

FROM mcr.microsoft.com/playwright:v1.52.0-noble

# Set working directory
WORKDIR /app

# Install Java for Allure reporting
RUN apt-get update && apt-get install -y \
    openjdk-11-jre \
    && rm -rf /var/lib/apt/lists/*

# Copy package.jsons first to utilize Docker cache
COPY package.json package-lock.json ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy configuration files
COPY playwright.config.ts playwright.ci.config.ts tsconfig.json ./

# Copy test code
COPY tests ./tests

# Set environment variables
ENV NODE_ENV=production \
    CI=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)"

# Create volume for reports
VOLUME ["/app/allure-results", "/app/playwright-report"]

# Command to run tests
CMD ["npx", "playwright", "test", "--config=playwright.ci.config.ts"]

#ARG NODE_VERSION=20.10.0

#FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
#ENV NODE_ENV production

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
#RUN --mount=type=bind,source=package.json,target=package.json \
#    --mount=type=bind,source=package-lock.json,target=package-lock.json \
#    --mount=type=cache,target=/root/.npm \
#    npm ci --omit=dev

# Run the application as a non-root user.
#USER node

# Expose the port that the application listens on.
#EXPOSE 3000


#RUN apt-get update && apt-get install -y \
#    xvfb \
#    libnss3 \
#    libatk1.0-0 \
#    libatk-bridge2.0-0 \
#    libdrm2 \
#    libxkbcommon0 \
#    libxcomposite1 \
#    libxrandr2 \
#    libgbm1 \
#    libpango1.0-0 \
#    libcups2 \
#    libgtk-3-0 \
#    libxdamage1 \
#    libxshmfence1 \
#    libasound2 \
#    libpangocairo-1.0-0 \
#    libx11-xcb1

# Use non-root user for security (Root currently required for perms)
#USER pwuser

# Expose the port that the application listens on, if your app needs it
#EXPOSE 3000

# Default command to run Playwright tests
#CMD ["xvfb-run", "--auto-servernum", "npx", "playwright", "test"]
#CMD ["npx", "playwright", "test"]

# docker run -it --rm -e DISPLAY=:0 -v /tmp/.X11-unix:/tmp/.X11-unix playwright-docker:latest xvfb-run --auto-servernum npx playwright test