package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB
var dbError error

// Connect initializes the connection to the PostgreSQL database
func Connect() {
	// Connection string for PostgreSQL
	connStr := "host=database-2.cluster-cd82weqsmqob.eu-north-1.rds.amazonaws.com user=postgres password=masterKey dbname=postgres port=5432 sslmode=require"

	// Open a connection to the database
	DB, dbError = sql.Open("postgres", connStr)
	if dbError != nil {
		log.Fatal(dbError)
		panic("Cannot connect to DB")
	}

	// Verify the connection
	err := DB.Ping()
	if err != nil {
		log.Fatal(err)
		panic("Cannot ping DB")
	}

	log.Println("Connected to Database!")
}

// QueryUserTable fetches data from the user_table
func QueryUserTable() {
	rows, err := DB.Query("SELECT id, username, first_name, last_name, email FROM public.user_table")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var username, firstName, lastName, email string
		if err := rows.Scan(&id, &username, &firstName, &lastName, &email); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("ID: %d, Username: %s, First Name: %s, Last Name: %s, Email: %s\n",
			id, username, firstName, lastName, email)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
}

// QueryItems fetches data from the items table
func QueryItems() {
	rows, err := DB.Query("SELECT item_name, item_description, item_count FROM public.items")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var itemName, itemDescription string
		var itemCount int
		if err := rows.Scan(&itemName, &itemDescription, &itemCount); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Item Name: %s, Description: %s, Count: %d\n",
			itemName, itemDescription, itemCount)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
}
