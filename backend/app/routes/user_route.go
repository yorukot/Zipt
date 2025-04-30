package routes

import (
	"github.com/gin-gonic/gin"
	userCtrl "github.com/yorukot/zipt/app/controllers/user"
	"github.com/yorukot/zipt/pkg/middleware"
)

func UserRoute(r *gin.RouterGroup) {
	userGroup := r.Group("/users")
	userGroup.Use(middleware.IsAuthorized())

	// Profile group
	profileGroup := userGroup.Group("/profile")
	profileGroup.GET("", userCtrl.GetProfile)
	profileGroup.PUT("/email", userCtrl.UpdateEmail)
	profileGroup.PUT("/display-name", userCtrl.UpdateDisplayName)

	// Add search endpoint
	userGroup.GET("/search", userCtrl.SearchByEmail)
}
