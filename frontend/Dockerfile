# Stage 1: build
FROM node:20-alpine AS build

# Install build dependencies for potential native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Update npm to latest to avoid version warnings and potential bugs
RUN npm install -g npm@latest

# Use npm install for better resilience against lockfile version mismatches
RUN npm install

COPY . .

RUN npm run build

# Stage 2: serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
