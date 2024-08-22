# Use Node.js base image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install JSON Server globally
RUN npm install -g json-server

# Copy db.json to the working directory
COPY ./db.json /usr/src/app/db.json

# Expose the port JSON Server will run on
EXPOSE 3000

# Command to run the JSON Server
CMD ["json-server", "--watch", "/usr/src/app/db.json", "--port", "3000"]
