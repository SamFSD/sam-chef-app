package controllers

import (
	"net/http"
	"jwt-authentication-golang/database"
	"github.com/gin-gonic/gin"
)

// Item represents a row in the items table
type Item struct {
	ItemName        string `json:"item_name"`
	ItemDescription string `json:"item_description"`
	ItemCount       int    `json:"item_count"`
}

// GetItems handles GET requests to fetch all items
func GetItems(c *gin.Context) {
	var items []Item

	rows, err := database.DB.Query("SELECT item_name, item_description, item_count FROM items")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query items"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var item Item
		if err := rows.Scan(&item.ItemName, &item.ItemDescription, &item.ItemCount); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan item"})
			return
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to iterate over items"})
		return
	}

	c.JSON(http.StatusOK, items)
}
