###################
##  build stage  ##
###################
FROM golang:1.13.0-alpine as builder
WORKDIR /webchat-golang-chat
COPY . .
RUN go build -v -o webchat-golang-chat

##################
##  exec stage  ##
##################
FROM alpine:3.10.2
WORKDIR /app
COPY ./configs/config.json.default ./configs/config.json
COPY --from=builder /webchat-golang-chat /app/
CMD ["./webchat-golang-chat"]