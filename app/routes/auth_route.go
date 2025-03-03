package routes

import (
	"github.com/gin-gonic/gin"
	authCtrl "github.com/yorukot/zipt/app/controllers/auth"
	"github.com/yorukot/zipt/pkg/middleware"
)

func AuthRoute(r *gin.RouterGroup) {
	authGroup := r.Group("/auth")

	// Public auth routes
	authGroup.POST("/register", authCtrl.Register)
	authGroup.POST("/login", authCtrl.Login)
	authGroup.POST("/refresh", authCtrl.RefreshToken)
	authGroup.POST("/logout", authCtrl.Logout)

	// Protected auth routes (require authentication)
	protected := authGroup.Group("")
	protected.Use(middleware.IsAuthorized())
	protected.POST("/change-password", authCtrl.ChangePassword)
}
