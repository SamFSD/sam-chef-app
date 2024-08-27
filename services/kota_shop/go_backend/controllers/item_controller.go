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

func AddItem(c *gin.Context) {
	var item Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	_, err := database.DB.Exec("INSERT INTO items (item_name, item_description, item_count) VALUES (?, ?, ?)",
		item.ItemName, item.ItemDescription, item.ItemCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Item added"})
}

func EditItem(c *gin.Context) {
	var item Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	_, err := database.DB.Exec("UPDATE items SET item_description = ?, item_count = ? WHERE item_name = ?",
		item.ItemDescription, item.ItemCount, item.ItemName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Item updated"})
}

func DeleteItem(c *gin.Context) {
	itemName := c.Param("item_name")

	_, err := database.DB.Exec("DELETE FROM items WHERE item_name = ?", itemName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Item deleted"})
}
