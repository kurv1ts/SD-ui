# Use an official Node.js runtime as a parent image
FROM node:22.7.0-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the application code
COPY . .


EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
