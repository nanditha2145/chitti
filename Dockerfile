# Use the Playwright base image
FROM mcr.microsoft.com/playwright:v1.21.0-focal

# Set the working directory
WORKDIR /app
RUN npx playwright install
# Install additional dependencies for Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libnss3 \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
    libx11-xcb1 \
    libgbm1 \
    libpangocairo-1.0-0 \
    libgtk-4-1 \
    libgraphene-1.0-0 \
    libgstgl-1.0-0 \
    libgstcodecparsers-1.0-0 \
    libavif15 \
    libenchant-2-2 \
    libsecret-1-0 \
    libmanette-0.2-0 \
    libgles2 \
    libglesv2-2 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers (Chromium, Firefox, WebKit)
RUN npx playwright install

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app will run on (adjust as needed)
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
