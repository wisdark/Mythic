package webcontroller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/its-a-feature/Mythic/logging"
	"github.com/its-a-feature/Mythic/rabbitmq"
)

type PayloadTypeDynamicTypedArrayParseInput struct {
	Input PayloadTypeDynamicTypedArrayParse `json:"input" binding:"required"`
}

type PayloadTypeDynamicTypedArrayParse struct {
	Command       string   `json:"command" binding:"required"`
	ParameterName string   `json:"parameter_name" binding:"required"`
	PayloadType   string   `json:"payload_type" binding:"required"`
	Callback      int      `json:"callback" binding:"required"`
	InputArray    []string `json:"input_array" binding:"required"`
}

type PayloadTypeDynamicTypedArrayParseResponse struct {
	Status     string     `json:"status"`
	Error      string     `json:"error"`
	TypedArray [][]string `json:"typed_array"`
}

func PayloadTypeDynamicTypedArrayParseWebhook(c *gin.Context) {
	// get variables from the POST request
	var input PayloadTypeDynamicTypedArrayParseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.LogError(err, "Failed to parse out required parameters")
		c.JSON(http.StatusOK, PayloadTypeDynamicTypedArrayParseResponse{
			Status: rabbitmq.PT_TYPEDARRAY_PARSE_STATUS_ERROR,
			Error:  err.Error(),
		})
		return
	}
	if payloadtypeDynamicQueryResponse, err := rabbitmq.RabbitMQConnection.SendPtRPCTypedArrayParse(rabbitmq.PTRPCTypedArrayParseMessage{
		Command:       input.Input.Command,
		ParameterName: input.Input.ParameterName,
		PayloadType:   input.Input.PayloadType,
		Callback:      input.Input.Callback,
		InputArray:    input.Input.InputArray,
	}); err != nil {
		logging.LogError(err, "Failed to send SendPtRPCTypedArrayParse to payload type", "payload_type", input.Input.PayloadType)
		c.JSON(http.StatusOK, PayloadTypeDynamicTypedArrayParseResponse{
			Status: rabbitmq.PT_TYPEDARRAY_PARSE_STATUS_ERROR,
			Error:  "Failed to send message to payload type container",
		})
		return
		// check the response from the RPC call for success or error
	} else if !payloadtypeDynamicQueryResponse.Success {
		logging.LogError(nil, payloadtypeDynamicQueryResponse.Error, "Failed to get dynamic query choices")
		c.JSON(http.StatusOK, PayloadTypeDynamicTypedArrayParseResponse{
			Status: rabbitmq.PT_TYPEDARRAY_PARSE_STATUS_ERROR,
			Error:  "Failed to get parsed type array",
		})
		return
	} else {
		c.JSON(http.StatusOK, PayloadTypeDynamicTypedArrayParseResponse{
			Status:     rabbitmq.PT_TYPEDARRAY_PARSE_STATUS_SUCCESS,
			TypedArray: payloadtypeDynamicQueryResponse.TypedArray,
		})
		return
	}
}
