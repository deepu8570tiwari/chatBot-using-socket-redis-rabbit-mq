# Step 1: Use official Node.js v20 image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package files first for caching dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy all source code to the container
COPY . .

# Step 6: Expose your app port (update if not 8085)
EXPOSE 8090

# Step 7: Set environment variable (optional)
ENV NODE_ENV=production

# Step 8: Run the app
CMD ["npm", "run", "dev"]

