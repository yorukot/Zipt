package routes

import (
	"github.com/gin-gonic/gin"
	authCtrl "github.com/yorukot/zipt/app/controllers/auth"
)

func AuthRoute(r *gin.RouterGroup) {
	authGroup := r.Group("/auth")

	authGroup.POST("/register", authCtrl.Register)
	authGroup.POST("/login", authCtrl.Login)
	authGroup.POST("/refresh", authCtrl.RefreshToken)
}
