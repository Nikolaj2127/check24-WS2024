package main

import (
	"net/http"
	"os/exec"
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
		if err != nil {
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

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.GET("/solve", func(c *gin.Context) {
		res := exec.Command("python", "./solver.py")
		out, err := res.Output()
		if err != nil {
            println(err.Error())
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": err.Error(),
            })
            return
        }
		c.JSON(http.StatusOK, gin.H{
			"res": string(out),
		})
	})

	
	r.Run(":4000")
}