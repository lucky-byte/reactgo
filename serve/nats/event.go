package nats

type Event struct {
	Level   int    `json:"level"`
	Title   string `json:"title"`
	Message string `json:"message"`
}
