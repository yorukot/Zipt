package routes

import (
	"github.com/gin-gonic/gin"
	authCtrl "github.com/yorukot/zipt/app/controllers/auth"
)

func AuthRoute(r *gin.RouterGroup) {
	authGroup := r.Group("/auth")

	authGroup.POST("/signup", authCtrl.Signup)
	authGroup.POST("/login", authCtrl.Login)
}
