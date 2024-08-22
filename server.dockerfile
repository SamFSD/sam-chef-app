# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Install json-server globally
RUN npm install -g json-server

# Copy the local db.json file into the container
COPY ./services/kota-shop/frontend/app/db.json /usr/src/app/db.json

# Expose port 3000
EXPOSE 3000

# Define the command to run json-server
CMD ["json-server", "--watch", "db.json", "--port", "3000"]
