package handlers

import (
    "io/ioutil"
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
)

const jsonServerURL = "http://localhost:3000"

// GetUsers handles fetching users from the external API and logs the process
func GetUsers(c *gin.Context) {
    url := jsonServerURL + "/users"
    log.Printf("Fetching users from URL: %s", url)

    response, err := http.Get(url)
    if err != nil {
        log.Printf("Error fetching users: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
        return
    }
    defer response.Body.Close()

    body, _ := ioutil.ReadAll(response.Body)
    log.Printf("Successfully fetched users. Status Code: %d", response.StatusCode)

    c.Data(http.StatusOK, "application/json", body)
}

// GetItems handles fetching items from the external API and logs the process
func GetItems(c *gin.Context) {
    url := jsonServerURL + "/items"
    log.Printf("Fetching items from URL: %s", url)

    response, err := http.Get(url)
    if err != nil {
        log.Printf("Error fetching items: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch items"})
        return
    }
    defer response.Body.Close()

    body, _ := ioutil.ReadAll(response.Body)
    log.Printf("Successfully fetched items. Status Code: %d", response.StatusCode)

    c.Data(http.StatusOK, "application/json", body)
}
