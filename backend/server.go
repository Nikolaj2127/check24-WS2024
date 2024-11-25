package main

import (
	"encoding/csv"
	"net/http"
	"os"
	"os/exec"
	"log"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main () {
	r := gin.Default()

	c := cors.DefaultConfig()
	c.AllowOrigins = []string{"http://localhost:3000"}

	r.Use(cors.New(c))

	r.POST("/solve", func(c *gin.Context) {
		// Read input data from the request body
		inputData, err := c.GetRawData()
		if (err != nil) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	
		cmd := exec.Command("python", "./solver.py")
		stdin, err := cmd.StdinPipe()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		go func() {
			defer stdin.Close()
			stdin.Write(inputData)
		}()
	
		out, err := cmd.Output()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"res": string(out),
		})
	})

	r.POST("/saveTeams", func(c *gin.Context) {
		var requestData struct {
			CollectionName string   `json:"collectionName"`
			Teams          []string `json:"teams"`
		}
	
		if err := c.BindJSON(&requestData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid JSON format",
			})
			return
		}

		file, err := os.OpenFile("./data/selectedTeams.csv", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to open file",
			})
			log.Println("Error opening file:", err)
			return
		}
		defer file.Close()

		writer := csv.NewWriter(file)
    	defer writer.Flush()

		// Combine collection name and teams into a single slice
		record := append([]string{requestData.CollectionName}, requestData.Teams...)

		// Write the combined record to the CSV file
		if err := writer.Write(record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to write record",
			})
			log.Println("Error writing record:", err)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Teams saved successfully",
		})
	})

	r.GET("/getCollections", func(c *gin.Context) {
        file, err := os.Open("./data/selectedTeams.csv")
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Unable to open file",
            })
            log.Println("Error opening file:", err)
            return
        }
        defer file.Close()

        reader := csv.NewReader(file)
		reader.FieldsPerRecord = -1
        records, err := reader.ReadAll()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Unable to read file",
            })
            log.Println("Error reading file:", err)
            return
        }

        var collections []map[string]interface{}
        for i, record := range records {
            if len(record) < 1 {
                log.Printf("Skipping record on line %d: not enough fields\n", i+1)
                continue
            }
            collection := map[string]interface{}{
                "collectionName": record[0],
                "teams":          record[1:],
            }
            collections = append(collections, collection)
        }

        log.Println("Data:", collections)

        c.JSON(http.StatusOK, collections)
    })

	r.Run(":4000")
}