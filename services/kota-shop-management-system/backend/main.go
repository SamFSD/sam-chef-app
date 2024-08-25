package main

import (
    "database/sql"
    "fmt"
    "log"

    "go-inventory-backend/handlers"

    "github.com/gin-gonic/gin"
    _ "github.com/lib/pq"
)

func main() {
    // Database connection parameters
    const (
        host     = "database-2.cluster-cd82weqsmqob.eu-north-1.rds.amazonaws.com"
        port     = 5432
        user     = "postgres"
        password = "masterKey"
        dbname   = "database_aws"
    )

    // Connection string
    psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    // Open a connection to the database
    db, err := sql.Open("postgres", psqlInfo)
    if err != nil {
        log.Fatalf("Error opening database connection: %v\n", err)
    }
    defer db.Close()

    // Ping the database to check the connection
    err = db.Ping()
    if err != nil {
        log.Fatalf("Error connecting to the database: %v\n", err)
    }

    fmt.Println("Successfully connected to the database!")

    // Initialize Gin router
    r := gin.Default()

    // Pass the database connection to handlers
    r.GET("/api/users", func(c *gin.Context) {
        handlers.GetUsers(c, db)
    })
    r.GET("/api/items", func(c *gin.Context) {
        handlers.GetItems(c, db)
    })

    // Other routes...

    // Run the server on port 8080
    r.Run(":8080")
}
