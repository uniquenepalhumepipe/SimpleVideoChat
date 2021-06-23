const express = require("express")
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http)

app.use(express.static("public"))

io.on('connection', socket=>{
  socket.on("join", roomId=>{
    socket.join(roomId)
    socket.emit("joined");
  })
  socket.on("rtcOffer", offer=>{
    socket.to(offer.roomId).emit("rtcOffer", offer.sdp);
  })

  socket.on("rtcAnswer", offer=>{
    socket.to(offer.roomId).emit("rtcAnswer", offer.sdp);
  })

  socket.on("icecandidate", e=>{
    socket.to(e.roomId).emit("icecandidate", e);
  })
  console.log(socket.id)
})


http.listen()