// Creating a socket connection (global variable) via functionality provided by the CDN link in the HTML <head>
let socket = io()

const messageButton = document.getElementById("messageButton")
const messageInput = document.getElementById("messageInput")
const userName = document.getElementById("userName")
const messagesDiv = document.getElementById("messages")

messageButton.addEventListener("click", sendMessage)
messageInput.addEventListener("keydown", sendMessage)

function sendMessage(e) {
  if(e.key === "Enter" || e.type === "click") {
    // Emit 'message' to the server (optionally passing data)
    socket.emit('message', {message: messageInput.value, user: userName.value})
    messageInput.value = ""
  }
}

socket.on('new-message', (data) => {
  messagesDiv.innerHTML = ""
  data.messages.forEach(m => {
    const newMessage = document.createElement("div")
    newMessage.innerHTML = `<p><strong>${m.user}</strong>: ${m.message}</p>`
    messagesDiv.appendChild(newMessage)
  });
})

