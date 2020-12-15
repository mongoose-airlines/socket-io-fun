const io = require('socket.io')()

const messages = []
let userCount = 0

// Client has connected
io.sockets.on('connect', () => {
  userCount ++
  messages.push({user: "System", message: `${userCount} users are connected`})
  io.sockets.emit('new-message', {messages})
})

io.on('connection', (socket) => {
  // Client has disconnected
  socket.on('disconnect', () => {
    userCount --
    messages.push({user: "System", message: `${userCount} users are connected`})
    io.sockets.emit('new-message', {messages})
  })
  
  // This is where all of our server-side socket.io functionality will exist.  
  console.log("The server is running.")
  
  // Listening for 'message' to be emitted by a client
  socket.on('message', (messageData) => {
    messages.push(messageData)
    // Emit a 'new-message' event to all sockets, pass the array of messages
    io.sockets.emit('new-message', {messages})
  })


})




module.exports = io