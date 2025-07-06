# Use official Node.js base image
FROM node:18

# Create and set app directory inside the container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run the app
CMD ["node", "app.js"]
