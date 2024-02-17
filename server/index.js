import express from 'express'
import logger from 'morgan'
import pg from 'pg'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

const config = {
  host: 'localhost',
  port: 5432,
  database: 'node_chat',
  user: 'saalcazar',
  password: 'a1b2c3d4c0'
}

const client = new pg.Client(config)
await client.connect()

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

io.on('connection', async (socket) => {
  console.log('a user has connected!')
  socket.on('disconnect', () => {
    console.log('an user has disconnected')
  })
  socket.on('chat message', async (msg) => {
    let result
    const user = socket.handshake.auth.username ?? 'anonymous'
    try {
      result = await client.query('SELECT id FROM create_chat ($1, $2)', [msg, user])
    } catch (e) {
      console.error('message can`t save in database', e)
    }
    io.emit('chat message', msg, result.rows[0].id, user)
  })

  const auth = socket.handshake.auth.serverOffset ?? 0

  if (!socket.recovered) { // recuperar mensajes sin conexión
    try {
      const results = await client.query('SELECT id, content, user_name FROM messages WHERE id > $1', [auth])
      results.rows.forEach(row => {
        socket.emit('chat message', row.content, row.id.toString(), row.user_name)
      })
    } catch (e) {
      console.log(e)
    }
  }
})

app.use(logger('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`Server runing on port ${port}`)
})
