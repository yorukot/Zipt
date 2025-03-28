package main

import (
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/routes"

	// _ "github.com/yorukot/zipt/pkg/cache" uncomment this to use cache
	// _ "github.com/yorukot/zipt/pkg/oauth" uncomment this to use oauth

	_ "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
	"github.com/yorukot/zipt/pkg/middleware"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	root := gin.New()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"} // Allow all origins
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.AllowCredentials = true

	root.Use(cors.New(config))

	root.OPTIONS("/*any", func(c *gin.Context) {
		c.Status(204) // No Content
	})

	root.SetTrustedProxies([]string{"127.0.0.1"})
	root.StaticFile("/favicon.ico", "./static/favicon.ico")

	root.Use(middleware.CustomLogger())
	root.Use(middleware.ErrorLoggerMiddleware())

	r := root.Group("/api/v" + os.Getenv("VERSION"))

	route(r)

	// Configure redirect routes at the root level
	root.GET("/:shortCode", routes.RedirectRoute)

	printAppInfo()

	root.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{
			"error":   "resource_not_found",
			"message": "Resource not found",
		})
	})

	if err := root.Run(); err != nil {
		logger.Log.Sugar().Fatal("Server failed to start: %v", err)
	}
}

func printAppInfo() {
	info := fmt.Sprintf(`
	Zipt API
	Version: %s
	Gin Version: %s
	Domain: %s
	`, os.Getenv("VERSION"), gin.Version, os.Getenv("BASE_URL"))
	logger.Log.Info(info)
}

func route(r *gin.RouterGroup) {
	routes.AuthRoute(r)
	routes.UserRoute(r)
	routes.ShortenerRoute(r)
}
