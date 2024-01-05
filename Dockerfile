# Stage 1: Build the React app using Vite
FROM node:18 AS build
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN yarn install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Build the React app using Vite
RUN yarn run build

# Stage 2: Create a lightweight production image
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

COPY ./nginx/mime.types /etc/nginx/mime.types

# Expose port 80 to access the app
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]