const express = require('express')
const http = require("http")
const socketio = require("socket.io")
const crypto = require("crypto")

const port = process.env.PORT || 4000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const updatePublicKeys = () => {
  let pubkeys = {}
  Object.keys(io.sockets.sockets).forEach(s => {
    pubkeys[s] = io.sockets.sockets[s].public_key
  })
  io.emit("user_pubkeys", pubkeys)
}

setInterval(updatePublicKeys, 5000)

io.on("connection", socket => {
  socket.on("pubkey_submit", public => {
    socket.public_key = public
  })

  updatePublicKeys()

  socket.on("message_send", message => {
    // message will be in the form {userid: encrypted_message,...}
    try {
      let time = Date.now()
      let id = crypto.randomBytes(16).toString("hex")
      for (socket_id in message) {
        io.sockets.connected[socket_id].emit("message_recv", {message: message[socket_id], time, id, pubkey_short: socket.public_key.substr(100,10), self: (socket_id == socket.id)})
      }
    } catch (e) {
      console.log("Error: ", e)
      socket.emit("clear_data_err")
    }
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))