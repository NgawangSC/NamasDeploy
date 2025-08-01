# Step 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Step 2: Serve with a static file server
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

# Copy the built app to /app/dist
COPY --from=builder /app/build /app/dist

EXPOSE 3000

# Serve the app from /app/dist
CMD ["serve", "-s", "dist", "-l", "3000"]
