FROM golang:1.20-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

# Build and run the Go app
RUN go build -o main ./main.go
CMD ["./main", "--port", "8080"]

EXPOSE 8080
