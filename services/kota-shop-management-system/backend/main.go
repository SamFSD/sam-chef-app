package main

import (
    "go-inventory-backend/handlers"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // Routes for fetching data from json-server
    r.GET("/api/users", handlers.GetUsers)
    r.GET("/api/items", handlers.GetItems)

    // Other routes...

    r.Run(":8080") // Run the server on port 8080
}
