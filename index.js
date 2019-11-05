var express = require("express")
var cors = require('cors')
const app = express()
var admin = require("firebase-admin")
var bodyParser = require("body-parser")
var serviceAccount = require("./serviceAccountKey.json")
const path = require('path')
const cookieParser = require('cookie-parser')
const socketIO = require('socket.io')
const http = require('http')
var server = http.createServer(app);
const io  = socketIO(server)

var usersRouter = require('./routers/users-router')
var gamesRouter = require('./routers/games-router')
var gameSessionsRouter = require('./routers/gameSession-router')

var formidable = require('express-form-data')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://xo-game-3b986.firebaseio.com"
})

app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(formidable.parse({keepExtensions:true}))
app.use(express.static(path.join(__dirname, 'public')))

app.use("/users", usersRouter)
app.use("/games", gamesRouter)
app.use('/gameSessions', gameSessionsRouter)


//socket section

//start socket when a client is connected
io.sockets.on('connect', socket =>{
  var gameSessionsReference = admin.database().ref('gameSessions')
  var gamesReference = admin.database().ref('games')

  // this socket send a signal to each client when a session is updated.
  gameSessionsReference.on("child_changed", function(snapshot) {
    var session = snapshot.val();
    
    if(session.winner){
      socket.emit('sessionUpdate', {idSession: snapshot.key, matrix: session.matrix, owner: session.owner, guest: session.guest, winner: session.winner, currentPlayer: session.currentPlayer})
    }
    else{
      socket.emit('sessionUpdate', {idSession: snapshot.key, matrix: session.matrix, owner: session.owner, guest: session.guest})
    }
  })

  // this socket send a signal to each client when a session is added.
  gameSessionsReference.on("child_added", function(snapshot) {
    var session = snapshot.val();
    
    socket.emit('sessionAdded', {idSession: snapshot.key})
  })

  // this socket send a signal to each client when a game is updated.
  gamesReference.on("child_changed", function(snapshot) {
    var game = snapshot.val();
    
    socket.emit('gameUpdate', {idGame: snapshot.key, guest: game.guest, winners: game.winners})
  })
})



server.listen('3333', function () {
  console.log('Server successfully running at 3333 port',);
})