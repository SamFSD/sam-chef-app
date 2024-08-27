KOTA - SHOP APP

# Kota Shop Management System

## Overview

The Kota Shop Management System is a full-stack application designed to manage a shop's inventory, users, and orders. The project leverages modern web development technologies, including Angular for the frontend and Go (Golang) for the backend. A JSON Server is used as a lightweight database during development.

## Stacks

- **Frontend**: Angular
- **Backend**: Go (Golang)
- **Database**: postgresSQL (AWS)

## Project Structure

The project is organized into the following services:

- **Frontend (kota-shop_frontend)**: The Angular application that provides the user interface for the shop management system.
- **Backend (kota-shop_backend)**: The Go application that handles business logic and API requests.
- **Database (json-server)**: A mock JSON database that mimics a RESTful API for development and testing purposes.

## Prerequisites

Before running the project, ensure you have the following installed on your machine:

- Docker
- Docker Compose
- Yarn (for frontend dependencies)

## Setting Up the Project

1. **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd kota_shop
    ```

2. **Install dependencies for the frontend:**

    Navigate to the frontend directory and install the necessary dependencies:

    ```bash
    cd services/kota_shop/frontend
    yarn install
    ```

3. **Prepare the environment:**

    Ensure all necessary environment variables and configurations are set up.

## Running the Project

To start the project, you need to run the Docker services for the frontend, backend

### Starting the Services

Run the following command to start all services:

```bash
sh services/kota_shop/start_services.sh


### **This script will execute the following tasks:**

Start the Frontend Service: The Angular application will be served at http://localhost:4200.
Start the Backend Service: The Go application will handle API requests at http://localhost:8080.
Accessing the Application
Frontend: Open your browser and navigate to http://localhost:4200 to access the Angular user interface.
Backend API: The backend API can be accessed at http://localhost:8080.
Development Workflow
Adding/Editing/Deleting Data: Manage users and items via the Angular frontend. The operations will reflect in the JSON Server database.
Modifying Backend Logic: Modify the Go application source code in the backend directory. Ensure you rebuild the Docker image after making changes.
Modifying Frontend: The Angular frontend can be developed and tested locally. The live-reload feature allows you to see changes in real-time.
Docker Volumes
The project uses Docker volumes to persist data and code changes:

Frontend Volume: Maps the Angular application source code to the container, enabling live-reload.
Backend Volume: Maps the Go application source code, allowing development and debugging inside the container.
Database Volume: Maps the db.json file to the container, preserving the state of the mock database between container restarts.
Common Commands
Building Docker Images: If you make changes to the Dockerfiles or need to rebuild the images, use the following command:

bash
Copy code
docker-compose build
Stopping the Services: To stop all running services, use:

bash
Copy code
docker-compose down
Running Go Commands: For development purposes, you can execute Go commands directly within the backend container:

bash
Copy code
docker-compose exec kota-shop_backend go mod tidy
docker-compose exec kota-shop_backend go run main.go
Debugging and Logs: To view the logs for each service, use:

bash
Copy code
docker-compose logs -f kota-shop_frontend
docker-compose logs -f kota-shop_backend
docker-compose logs -f json-server
Troubleshooting
Permission Denied Errors: Ensure that the shell script start_services.sh and other related scripts have execute permissions:

bash
Copy code
chmod +x services/kota_shop/start_services.sh
Port Conflicts: Make sure that the ports 4200, 8080, and 3000 are not being used by other services on your machine.

Docker Issues: If you encounter issues with Docker, try rebuilding the containers:
site : http://sam2awsbucket.s3-website.eu-north-1.amazonaws.com/

