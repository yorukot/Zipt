package routes

import (
	"github.com/gin-gonic/gin"
	userCtrl "github.com/yorukot/zipt/app/controllers/user"
	"github.com/yorukot/zipt/pkg/middleware"
)

func UserRoute(r *gin.RouterGroup) {
	userGroup := r.Group("/users")
	userGroup.Use(middleware.IsAuthorized())

	userGroup.GET("/profile", userCtrl.GetProfile)

	// Add search endpoint
	userGroup.GET("/search", userCtrl.SearchByEmail)
}
