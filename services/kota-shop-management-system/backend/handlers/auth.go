package handlers

import (
    "database/sql"
    "net/http"

    "github.com/gin-gonic/gin"
)

// User represents a user in the database
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

// GetUsers fetches users from the database
func GetUsers(c *gin.Context, db *sql.DB) {
    rows, err := db.Query("SELECT id, name FROM users")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch users"})
        return
    }
    defer rows.Close()

    var users []User
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Name); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning user"})
            return
        }
        users = append(users, user)
    }

    c.JSON(http.StatusOK, users)
}

// Item represents an item in the database
type Item struct {
    ID       int    `json:"id"`
    ItemName string `json:"item_name"`
}

// GetItems fetches items from the database
func GetItems(c *gin.Context, db *sql.DB) {
    rows, err := db.Query("SELECT id, item_name FROM items")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch items"})
        return
    }
    defer rows.Close()

    var items []Item
    for rows.Next() {
        var item Item
        if err := rows.Scan(&item.ID, &item.ItemName); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning item"})
            return
        }
        items = append(items, item)
    }

    c.JSON(http.StatusOK, items)
}
