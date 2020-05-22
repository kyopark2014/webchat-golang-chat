package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"webchat/internal/config"
	"webchat/internal/logger"
	"webchat/internal/rediscache"

	socketio "github.com/nkovacs/go-socket.io"
)

var log *logger.Logger

func init() {
	log = logger.NewLogger("server")
}

// Event is to define the event
type Event struct {
	EvtType   string
	From      string
	To        string
	Timestamp int
	Text      string
}

// Message is the data structure of messages
type Message struct {
	From      string
	To        string
	Timestamp int
	Message   string
}

// InitServer initializes the server
func InitServer(conf *config.AppConfig) error {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.E("%v", err)
	}

	server.On("connection", func(so socketio.Socket) {
		log.D("connected... %v", so.Id())

		newMessages := make(chan string)

		so.On("chat", func(msg string) {
			newMessages <- msg
		})

		so.On("disconnection", func() {
			log.D("disconnected... %v", so.Id())
		})

		userEvent := make(chan Event, 10)
		receive := make(chan Event, 10) // received event

		// make connection with redis server
		// userEvent <- event (from PUBSUB)
		go func() { // server <-> QUEUE / PUBSUB
			for {
				select {
				case event := <-receive: //
					log.D("New event was received: %v", event.Text)

					// for test
					log.D("Then, send the event to QUEUE and PUBSUB")
					userEvent <- event

					// To-Do: check the validity of receiver
					// To-Do: lpush to QUEUE
					// publish to PUBSUB
				}
			}

		}()

		go func() { // cient <-> server (WEB Socket)
			for {
				select {
				case event := <-userEvent: // sending event to client(browser)
					log.D("sending event to browsers: %v %v %v %v %v (%v)", event.EvtType, event.From, event.To, event.Timestamp, event.Text, so.Id())
					so.Emit("chat", event)

				case msg := <-newMessages: // received message from client(browser)
					var newMSG Message
					json.Unmarshal([]byte(msg), &newMSG)
					log.D("receiving message from browser: %v %v %v %v (%v)", newMSG.From, newMSG.To, newMSG.Timestamp, newMSG.Message, so.Id())

					receive <- NewEvent("message", newMSG.From, newMSG.To, int(newMSG.Timestamp), newMSG.Message)
				}
			}
		}()
	})

	http.HandleFunc("/socket.io/", func(w http.ResponseWriter, r *http.Request) {
		// origin to excape Cross-Origin Resource Sharing (CORS)
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// address
		r.RemoteAddr = conf.ChatConfig.Host
		log.I("Address: %v", r.RemoteAddr)

		server.ServeHTTP(w, r)
	})

	http.Handle("/", http.FileServer(http.Dir("./asset")))

	log.I("Serving at %v:%v", conf.ChatConfig.Host, conf.ChatConfig.Port)
	log.E("%v", http.ListenAndServe(fmt.Sprintf(":%v", conf.ChatConfig.Port), nil))

	return err
}

// NewEvent is to create an new event
func NewEvent(evtType string, from string, to string, timestamp int, msg string) Event {
	return Event{evtType, from, to, timestamp, msg}
}

// setMsg is getting the identification from the url
func setMsg(w http.ResponseWriter, r *http.Request) {
	log.D("AddUserInfo...")
	w.Header().Set("Content-Type", "application/json")

	var value rediscache.UserProfile
	_ = json.NewDecoder(r.Body).Decode(&value)
	log.D("value: %+v", value)

	// generate key
	key := value.UID // UID to identify the profile
	log.D("key: %v", key)

	_, rErr := rediscache.SetCache(key, &value)
	if rErr != nil {
		log.E("Error of setCache: %v", rErr)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusOK)
}
