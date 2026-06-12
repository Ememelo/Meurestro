# Stage 1: Build React SPA
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy code and build
COPY . .
RUN npm run build

# Stage 2: Serve React SPA with Nginx
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
