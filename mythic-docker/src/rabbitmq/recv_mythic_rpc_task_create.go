package rabbitmq

import (
	"encoding/json"

	"github.com/its-a-feature/Mythic/database"
	databaseStructs "github.com/its-a-feature/Mythic/database/structs"
	"github.com/its-a-feature/Mythic/logging"
	amqp "github.com/rabbitmq/amqp091-go"
)

type MythicRPCTaskCreateMessage struct {
	AgentCallbackID    string  `json:"agent_callback_id"`
	CommandName        string  `json:"command_name"`
	Params             string  `json:"params"`
	ParameterGroupName *string `json:"parameter_group_name,omitempty"`
	Token              *int    `json:"token,omitempty"`
}

// Every mythicRPC function call must return a response that includes the following two values
type MythicRPCTaskCreateMessageResponse struct {
	Success       bool   `json:"success"`
	Error         string `json:"error"`
	TaskID        int    `json:"task_id"`
	TaskDisplayID int    `json:"task_display_id"`
}

func init() {
	RabbitMQConnection.AddRPCQueue(RPCQueueStruct{
		Exchange:   MYTHIC_EXCHANGE,
		Queue:      MYTHIC_RPC_TASK_CREATE,     // swap out with queue in rabbitmq.constants.go file
		RoutingKey: MYTHIC_RPC_TASK_CREATE,     // swap out with routing key in rabbitmq.constants.go file
		Handler:    processMythicRPCTaskCreate, // points to function that takes in amqp.Delivery and returns interface{}
	})
}

// MYTHIC_RPC_OBJECT_ACTION - Say what the function does
func MythicRPCTaskCreate(input MythicRPCTaskCreateMessage) MythicRPCTaskCreateMessageResponse {
	response := MythicRPCTaskCreateMessageResponse{
		Success: false,
	}
	taskingLocation := "mythic_rpc"
	createTaskInput := CreateTaskInput{
		CommandName:        input.CommandName,
		Params:             input.Params,
		Token:              input.Token,
		ParameterGroupName: input.ParameterGroupName,
		TaskingLocation:    &taskingLocation,
	}
	callback := databaseStructs.Callback{}
	operatorOperation := databaseStructs.Operatoroperation{}
	if err := database.DB.Get(&callback, `SELECT 
	callback.id,
	callback.display_id,
	callback.operation_id,
	operator.id "operator.id",
	operator.admin "operator.admin" 
	FROM callback
	JOIN operator ON callback.operator_id = operator.id
	WHERE callback.agent_callback_id=$1`, input.AgentCallbackID); err != nil {
		response.Error = err.Error()
		logging.LogError(err, "Failed to fetch task/callback information when creating subtask")
		return response
	} else if err := database.DB.Get(&operatorOperation, `SELECT
	base_disabled_commands_id
	FROM operatoroperation
	WHERE operator_id = $1 AND operation_id = $2
	`, callback.Operator.ID, callback.OperationID); err != nil {
		logging.LogError(err, "Failed to get operation information when creating subtask")
		response.Error = err.Error()
		return response
	} else {
		createTaskInput.IsOperatorAdmin = callback.Operator.Admin
		createTaskInput.CallbackDisplayID = callback.DisplayID
		createTaskInput.CurrentOperationID = callback.OperationID
		if operatorOperation.BaseDisabledCommandsID.Valid {
			baseDisabledCommandsID := int(operatorOperation.BaseDisabledCommandsID.Int64)
			createTaskInput.DisabledCommandID = &baseDisabledCommandsID
		}
		createTaskInput.OperatorID = callback.Operator.ID
		creationResponse := CreateTask(createTaskInput)
		if creationResponse.Status == "success" {
			response.Success = true
			response.TaskID = creationResponse.TaskID
			response.TaskDisplayID = creationResponse.TaskDisplayID
		} else {
			response.Error = creationResponse.Error
		}
		return response
	}

}
func processMythicRPCTaskCreate(msg amqp.Delivery) interface{} {
	incomingMessage := MythicRPCTaskCreateMessage{}
	responseMsg := MythicRPCTaskCreateMessageResponse{
		Success: false,
	}
	if err := json.Unmarshal(msg.Body, &incomingMessage); err != nil {
		logging.LogError(err, "Failed to unmarshal JSON into struct")
		responseMsg.Error = err.Error()
	} else {
		return MythicRPCTaskCreate(incomingMessage)
	}
	return responseMsg
}
