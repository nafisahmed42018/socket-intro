import express from 'express'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3500
const ADMIN = 'Admin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

const UserState = {
  users: [],
  setUsers: function (NewUsers) {
    this.users = NewUsers
  },
}

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5500', 'http://127.0.0.1:5500'],
  },
})

// socket io connection
io.on('connection', (socket) => {
  // Upon connection sends message only to user
  socket.emit('message', buildMsg(ADMIN, 'Welcome to Chat App!'))

  // Upon connection sends message to all users except the user
  // socket.broadcast.emit(
  //   'message',
  //   `User ${socket.id.substring(0, 5)} connected`,
  // )

  socket.on('enterRoom', ({ name, room }) => {
    const prevRoom = getUser(socket.id)?.room
    if (prevRoom) {
      socket.leave(prevRoom)
      io.to(prevRoom).emit(
        'message',
        buildMsg(ADMIN, `${name} has left the room`),
      )
    }
  })

  // `on` - listening on for message event
  socket.on('message', (data) => {
    console.log(data)
    // sending message to all connected users
    io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
  })

  // When user disconnects broadcasts message to all others
  socket.on('disconnect', () => {
    socket.broadcast.emit('message', `${socket.id.substring(0, 5)} logged out`)
  })

  // Listen for activity
  socket.on('activity', (name) => {
    socket.broadcast.emit('activity', name)
  })
})

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(new Date()),
  }
}

// User functions

function activateUser(id, name, room) {
  const user = { id, name, room }
  UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
    user,
  ])
  return user
}

function userLeaveApp(id) {
  UserState.setUsers(UserState.users.filter((user) => user.id !== id))
}

function getUser(id) {
  return UserState.users.find((user) => user.id === id)
}

function getUsersInRoom(room) {
  return UserState.users.filter((user) => user.room === room)
}

function getAllActiveRooms() {
  return Array.from(new Set(UserState.users.map((user) => user.room)))
}
