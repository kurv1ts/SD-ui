# Use an official Node.js runtime as a parent image
FROM node:22.7.0-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Build the Remix application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Define the command to start the application
CMD ["npm", "run", "dev", "--", "--host"]