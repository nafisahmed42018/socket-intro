const socket = io('ws://localhost:3500')

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoomInput = document.querySelector('#room')

const activity = document.querySelector('.activity')
const userList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')

const chatDisplay = document.querySelector('.chat-display')

function sendMessage(e) {
  e.preventDefault()
  if (msgInput.value && nameInput.value && chatRoomInput.value) {
    socket.emit('message', {
      text: msgInput.value,
      name: nameInput.value,
    })
    msgInput.value = ''
  }
  msgInput.focus()
}

function enterRoom(e) {
  e.preventDefault()
  if (nameInput.value && chatRoomInput.value) {
    socket.emit('chatRoom', {
      name: nameInput.value,
      room: chatRoomInput.value,
    })
  }
}

document.querySelector('.form-join').addEventListener('submit', enterRoom)
document.querySelector('.form-msg').addEventListener('submit', sendMessage)

msgInput.addEventListener('keypress', () => {
  socket.emit('activity', nameInput.value)
})

// Listen for messages
socket.on('message', (data) => {
  const li = document.createElement('li')
  li.textContent = data
  document.querySelector('ul').appendChild(li)
})

let activityTimer
socket.on('activity', (name) => {
  activity.textContent = `${name} is typing...`

  clearTimeout(activityTimer)
  activityTimer = setTimeout(() => {
    activity.textContent = ''
  }, 1500)
})
