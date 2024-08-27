package middlewares

import (
    "log"
    "jwt-authentication-golang/auth"
    "github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
    return func(context *gin.Context) {
        tokenString := context.GetHeader("Authorization")
        log.Printf("Authorization header: %s", tokenString)
        if tokenString == "" {
            context.JSON(401, gin.H{"error": "request does not contain an access token"})
            context.Abort()
            return
        }

        if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
            tokenString = tokenString[7:]
        }

        err := auth.ValidateToken(tokenString)
        if err != nil {
            log.Printf("Token validation error: %s", err.Error())
            context.JSON(401, gin.H{"error": err.Error()})
            context.Abort()
            return
        }
        context.Next()
    }
}
