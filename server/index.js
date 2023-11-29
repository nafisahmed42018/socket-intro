import express from 'express'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3500

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

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
  // console.log(`User ${socket.id} connected`)

  // Upon connection sends message only to user
  socket.emit('message', `Welcome Back, ${socket.id.substring(0, 5)}`)

  // Upon connection sends message to all users except the user
  socket.broadcast.emit(
    'message',
    `User ${socket.id.substring(0, 5)} connected`,
  )

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
