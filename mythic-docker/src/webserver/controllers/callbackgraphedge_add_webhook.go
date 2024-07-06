package webcontroller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	databaseStructs "github.com/its-a-feature/Mythic/database/structs"
	"github.com/its-a-feature/Mythic/logging"
	"github.com/its-a-feature/Mythic/rabbitmq"
)

// Structs defining the input we get from the user to process
type callbackgraphedgeAddInput struct {
	Input callbackgraphedgeAdd `json:"input" binding:"required"`
}
type callbackgraphedgeAdd struct {
	SourceCallbackId      int    `json:"source_id" binding:"required"`
	DestinationCallbackId int    `json:"destination_id" binding:"required"`
	C2ProfileName         string `json:"c2profile" binding:"required"`
}

// this function called from webhook_endpoint through the UI or scripting
func CallbackgraphedgeAddWebhook(c *gin.Context) {
	var input callbackgraphedgeAddInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.LogError(err, "Failed to get JSON parameters for CallbackgraphedgeAddWebhook")
		c.JSON(http.StatusOK, gin.H{"status": "error", "error": err.Error()})
		return
	} else if ginOperatorOperation, ok := c.Get("operatorOperation"); !ok {
		logging.LogError(err, "Failed to get operatorOperation information for CallbackgraphedgeAddWebhook")
		c.JSON(http.StatusOK, gin.H{"status": "error", "error": "Failed to get current operation. Is it set?"})
		return
	} else {
		operatorOperation := ginOperatorOperation.(*databaseStructs.Operatoroperation)
		if err := rabbitmq.AddEdgeByDisplayIds(input.Input.SourceCallbackId, input.Input.DestinationCallbackId, input.Input.C2ProfileName, operatorOperation); err != nil {
			logging.LogError(err, "Failed to add callback edge")
			c.JSON(http.StatusOK, gin.H{"status": "error", "error": err.Error()})
		} else {
			c.JSON(http.StatusOK, gin.H{"status": "success"})
		}
	}
}
