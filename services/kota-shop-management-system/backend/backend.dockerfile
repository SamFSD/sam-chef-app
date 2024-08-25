# Use an official Go image as the base image
FROM golang:1.22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Go modules files
COPY go.mod go.sum ./

# Install dependencies
RUN go mod tidy

# Copy the rest of the application source code
COPY . .

# Build the Go application
RUN go build -o main .

# Specify the command to run the application
CMD ["./main"]
