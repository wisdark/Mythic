package grpc

import (
	"errors"
	"fmt"
	"github.com/its-a-feature/Mythic/grpc/services"
	"github.com/its-a-feature/Mythic/logging"
	"io"
	"time"
)

func (t *translationContainerServer) TranslateFromCustomToMythicFormat(stream services.TranslationContainer_TranslateFromCustomToMythicFormatServer) error {
	clientName := ""
	// initially wait for a request from the other side with blank data to indicate who is talking to us
	if initial, err := stream.Recv(); err == io.EOF {
		logging.LogDebug("Client closed before ever sending anything, err is EOF")
		return nil // the client closed before ever sending anything
	} else if err != nil {
		logging.LogError(err, "Client ran into an error before sending anything")
		return err
	} else {
		clientName = initial.GetTranslationContainerName()
		if getMessageToSend, sendBackMessageResponse, err := t.addNewCustomToMythicClient(clientName); err != nil {
			logging.LogError(err, "Failed to add new channels to listen for connection")
			return err
		} else {
			logging.LogDebug("Got translation container name from remote connection", "name", clientName)
			for {
				select {
				case <-stream.Context().Done():
					logging.LogError(stream.Context().Err(), fmt.Sprintf("client disconnected: %s", clientName))
					t.SetCustomToMythicChannelExited(clientName)
					return errors.New(fmt.Sprintf("client disconnected: %s", clientName))
				case msgToSend, ok := <-getMessageToSend:
					if !ok {
						logging.LogError(nil, "got !ok from messageToSend, channel was closed")
						t.SetCustomToMythicChannelExited(clientName)
						return nil
					} else {
						if err = stream.Send(&msgToSend); err != nil {
							logging.LogError(err, "Failed to send message through stream to translation container")
							select {
							case sendBackMessageResponse <- services.TrCustomMessageToMythicC2FormatMessageResponse{
								Success:                  false,
								Error:                    err.Error(),
								TranslationContainerName: clientName,
							}:
							case <-time.After(t.GetChannelTimeout()):
								logging.LogError(errors.New("timeout sending to channel"), "gRPC stream connection needs to exit due to timeouts")
							}
							t.SetCustomToMythicChannelExited(clientName)
							return err
						} else if resp, err := stream.Recv(); err == io.EOF {
							// cleanup the connection channels first before returning
							logging.LogError(err, "connection closed in stream.Rev after sending message")
							select {
							case sendBackMessageResponse <- services.TrCustomMessageToMythicC2FormatMessageResponse{
								Success:                  false,
								Error:                    err.Error(),
								TranslationContainerName: clientName,
							}:
							case <-time.After(t.GetChannelTimeout()):
								logging.LogError(errors.New("timeout sending to channel"), "gRPC stream connection needs to exit due to timeouts")
							}
							t.SetCustomToMythicChannelExited(clientName)
							return nil
						} else if err != nil {
							// cleanup the connection channels first before returning
							logging.LogError(err, "Failed to read from translation container")
							select {
							case sendBackMessageResponse <- services.TrCustomMessageToMythicC2FormatMessageResponse{
								Success:                  false,
								Error:                    err.Error(),
								TranslationContainerName: clientName,
							}:
							case <-time.After(t.GetChannelTimeout()):
								logging.LogError(errors.New("timeout sending to channel"), "gRPC stream connection needs to exit due to timeouts")
							}
							t.SetCustomToMythicChannelExited(clientName)
							return err
						} else {
							select {
							case sendBackMessageResponse <- *resp:
							case <-time.After(t.GetChannelTimeout()):
								logging.LogError(errors.New("timeout sending to channel"), "gRPC stream connection needs to exit due to timeouts")
								t.SetGenerateKeysChannelExited(clientName)
								return err
							}
						}
					}
				}
			}
		}
	}
}
