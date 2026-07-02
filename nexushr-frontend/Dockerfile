# Stage 1: Build the Vite/React application
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
# VITE_API_BASE_URL is a build-time variable; pass it via --build-arg
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
