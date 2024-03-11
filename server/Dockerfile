# Use the official Node.js image as the base image
FROM node

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the server code to the working directory
COPY . .

# Expose the server port
EXPOSE 8081

# Start the server
CMD ["npm", "start"]