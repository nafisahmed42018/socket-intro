const ws = require('ws')

const server = new ws.Server({ port: '3331' })

server.on('connection', (socket) => {
  socket.on('message', (message) => {
    const b = Buffer.from(message)
    socket.send(`${message}`)
    console.log(b.toString())
  })
})
