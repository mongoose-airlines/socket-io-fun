# Fun with Socket.io

## Step 1: Create app using express generator:

```bash
npx express-generator -v ejs socket-io
```

<br>

## Step 2: Rename app.js to server.js and adjust the bin/www file.

<br>

## Step 3: Install the socket.io node module:

```bash
npm i socket.io
```

<br>

## Step 4: Create a chat.js file that will be responsible for client-side chat functionality. 

Stub it up with the following:

```bash
touch public/javascripts/chat.js
```

<br>

```js
 // Creating a socket connection via functionality provided by a CDN link in the HTML <head>
let socket = io()
```


## Step 5: Add the socket.io CDN to the HTML <head> along with the JavaScript file we just created:

```html
<script src="https://cdn.socket.io/socket.io-3.0.1.min.js"></script>
<script defer src="/javascripts/chat.js"></script>
```

## Step 6: Create a module to export all socket.io functionality. 

This is done to keep the code organized.  Rather than putting ALL of this code in our bin/www file, we're going to export it from io.js.

```bash
touch io.js
```

<br>

## Step 7: Stub up the io.js module with the following:

```js
const io = require('socket.io')()

io.on('connection', (socket) => {
  // This is where all of our server-side socket.io functionality will exist.
  console.log("The server is running.")  
})

module.exports = io
```

## Step 8: Require the io.js module in the bin/www file, then attach it to the http server

```js
const http = require('http');
// Require the io.js module here:
const io = require("../io")
.
.
.
const server = http.createServer(app);
// Attach io to the https server here:
io.attach(server)
```

<br>

## Step 9: In the index.ejs, create a button with an `id` of 'messageButton'

```html
<button id="messageButton">Message Button<button>
```

<br>

## Step 10: In `chat.js`, add a cached element reference and an event listener for a `click` on our new button

Click the button and verify that the message appears in the browser console.

```js
const messageButton = document.getElementById("messageButton")

messageButton.addEventListener("click", () => {
  console.log("message button clicked")
})
```

<br>

## Step 11: Let's tweak the function and emit 'message' to the server

```js
messageButton.addEventListener("click", () => {
  // Emit 'message' to the server (optionally passing data)
  socket.emit('message', {message: "message data"})
})
```

<br>

## Step 12: Now that the client is emitting, we need to listen server-side (in io.js) for 'message'

When 'message' is heard, we'll execute a callback function:

```js
io.on('connection', (socket) => {
  console.log("The server is running.")

  // Listening for 'message' to be emitted by a client, then displaying the optional data passed along.  Notice that the data must be passed as an argument to the callback function!
  socket.on('message', (messageData) => {
    console.log(messageData, 'data sent via message')
  })
})
```

<br>

## Step 13:  Add an `<input>` in `index.ejs` with an `id` of "messageInput" (above the button)

```html
<input type="text" id="messageInput" placeholder="Type a message!">
```

<br>

## Step 14: Add a cached element reference for the message input

```js
const messageInput = document.getElementById("messageInput")
```

<br>

## Step 15: Refactor the callback function in `chat.js` to pass the `<input>`'s value instead as the message data

```js
messageButton.addEventListener("click", () => {
  console.log("message button clicked")
  // Emit 'banana' to the server (optionally passing data)
  socket.emit('message', {message: messageInput.value})
})
```

## Step 16: Allow users to attach their name to the message

```html
<input type="text" id="userName" placeholder="Enter name:"><br><br><br>
```

<br>

## Step 17: Add a cached element reference in `chat.js` for the `<input>` and refactor the emit to send the user's name as well.  

Let's also make it user-friendly by allowing the user to hit "Enter" instead of clicking the button. We'll also clean up the UI by resetting the message after it is sent.

```js
const messageButton = document.getElementById("messageButton")
const messageInput = document.getElementById("messageInput")
const userName = document.getElementById("userName")

messageButton.addEventListener("click", sendMessage)
messageInput.addEventListener("keydown", sendMessage)

function sendMessage(e) {
  if(e.key === "Enter" || e.type === "click") {
    // Emit 'message' to the server (optionally passing data)
    socket.emit('message', {message: messageInput.value, user: userName.value})
    messageInput.value = ""
  }
}
```

<br>

## Step 18: Add a `<div>` to the `index.ejs` that we can append the messages to after they are sent.

Don't forget to add the cached element reference to `chat.js`!

```html
<div id="messages"></div>
```

```js
const messagesDiv = document.getElementById("messages")
```

<br>

## Step 19: Create an empty `messages` array to store the chat data. 

Also, adjust the server-side listener for `message` to push the incoming data into the `messages` array. 

```js
messages = []
.
.
.
// Listening for 'message' to be emitted by a client
socket.on('message', (messageData) => {
  messages.push(messageData)
  io.sockets.emit('new-message', {messages})
})
```

<br>

## Step 20: Add a listener in `chat.js` for the 'new-message' event

The callback function should clear the contents of `messagesDiv` then loop over each of the incoming messages and creating/appending a `<p>` with the user's name and message.

```js
socket.on('new-message', (data) => {
  messagesDiv.innerHTML = ""
  data.messages.reverse().forEach(m => {
    const newMessage = document.createElement("div")
    newMessage.innerHTML = `<p><strong>${m.user}</strong>: ${m.message}</p>`
    messagesDiv.appendChild(newMessage)
  });
})
```

<br>

## Step 21: Add events for detecting when a client connects or disconnects from the server.

Use these to push a message indicating the current number of clients connected to the server.

```js
// Initialize the number of clients connected
const userCount = 0
.
.
.
// Client has connected (This must go OUTSIDE of the io.on('connection') function!)
io.sockets.on('connect', () => {
  userCount ++
  messages.push({user: "System", message: `${userCount} users are connected`})
  io.sockets.emit('new-message', {messages})
})
.
.
.
io.on('connection', (socket) => {
  // Client has disconnected (This must go INSIDE of the io.on('connection) function!)
  socket.on('disconnect', () => {
    userCount --
    messages.push({user: "System", message: `${userCount} users are connected`})
    io.sockets.emit('new-message', {messages})
  })
  .
  .
  .
}
```

<br>

## Step 22: Display a message showing when a user is typing a message. Add a `<div>` with an id of 'isTyping' below the message button in `index.ejs`. Add a cached element reference for it in `chat.js`.

```html
<div id="isTyping"></div>
```

```js
const isTyping = document.getElementById("isTyping")
```

<br>

## Step 23: Expand the event listener for the `messageInput` element to include an else statement to handle emitting an event while someone is typing in the `<input>`.

```js
function sendMessage(e) {
  if(e.key === "Enter" || e.type === "click") {
    // Emit 'message' to the server (optionally passing data)
    socket.emit('message', {message: messageInput.value, user: userName.value})
    messageInput.value = ""
    // Add this code to handle '... is typing'
  } else {
    socket.emit('typing', {user: userName.value})
  }
}
```

<br>

## Step 24: Add a listener on the server (`io.js`) for the 'typing' event.  

When detected, it should emit an event to all sockets except for the one that triggered the event. `socket.broadcast.emit`, to the rescue!!!

```js
socket.on('typing', (userName) => {
  socket.broadcast.emit("user-typing", {user: userName.user})
})
```

<br>

## Step 25: Add a listener to the client-side `chat.js` to handle displaying a message whenever the 'user-typing' event is detected.

```js
socket.on('user-typing', (userName) => {
  isTyping.innerText = `${userName.user} is typing...`
})
```

## Step 26: Add one line of code to clear the '... is typing...' message whenever a message is sent.

```js
socket.on('new-message', (data) => {
  messagesDiv.innerHTML = ""
  data.messages.reverse().forEach(m => {
    const newMessage = document.createElement("div")
    newMessage.innerHTML = `<p><strong>${m.user}</strong>: ${m.message}</p>`
    messagesDiv.appendChild(newMessage)
  });
  // Add this line of code to reset the '... is typing ...' message
  isTyping.innerText = ""
})
```

## Stretch goals:
- oAuth instead of chat name `<input>`
- list current client user names
- handle message for multiple users typing simultaneously
- drawing with colors
- sounds on entry/exit/message
- namespaces
- database connection
- deployment
- styling (anything...)