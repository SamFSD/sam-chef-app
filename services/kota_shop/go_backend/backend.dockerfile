# Stage 1: Build the Go binary
FROM golang:1.20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to the workspace
COPY go.mod go.sum ./

# Download dependencies
RUN go mod tidy

# Copy the entire project to the container
COPY . .

# Build the Go app
RUN go build -o main ./main.go

# Stage 2: Run the Go binary in a smaller image
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose the application port
EXPOSE 8080

# Run the Go app
CMD ["./main", "--port", "8080"]
