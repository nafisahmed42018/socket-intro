// create a new socket instance
const socket = new WebSocket('ws://localhost:3331')

function sendMessage(e) {
  // prevent default behavior which is refreshing the page
  e.preventDefault()
  const input = document.querySelector('input')
  //   send and reset the input field
  if (input.value) {
    socket.send(input.value)
    input.value = ''
  }
  input.focus()
}

document.querySelector('form').addEventListener('submit', sendMessage)

// Listen for messages
socket.addEventListener('message', (event) => {

  const li = document.createElement('li')
  li.textContent = event.data
  document.querySelector('ul').appendChild(li)
})
