# Stage 1: Build Stage
FROM node:14.17.0 AS build

# Install required dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-dev \
    curl \
    wine

# Install specific version of node-gyp globally
RUN npm install -g node-gyp

# Set environment variables for node-gyp and electron
ENV npm_config_build_v8_with_gn=false \
    npm_config_runtime=electron \
    npm_config_target="11.5.0"

# Install project dependencies and build
WORKDIR /app
COPY . .
RUN npm install --build-from-source
RUN npm run build

# Stage 2: Final Image
FROM electronuserland/builder:wine

# Copy built files from the build stage
# COPY --from=build /app /app

# Default command
# CMD ["npm", "start"]
EXPOSE 19000
