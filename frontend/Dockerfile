# Use official Node.js image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Step 3: Copy package files first for caching dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Copy all project files
COPY . .

# Expose port your server will run on
EXPOSE 3001

# Step 7: Set environment variable (optional)
ENV NODE_ENV=production

# Step 8: Run the app
CMD ["npm", "run", "dev"]
