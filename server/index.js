const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require("fs");
var path = require("path");
const { Server } = require("socket.io");
// initialize a new instance of socket.io by passing the server (the HTTP server) object.
const io = new Server(server);

const PORT = process.env.PORT || 1337;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  // create new session
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg) => {
    var expression =
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    if (msg.match(regex)) {
      // want to send a message just to the sender?
      socket.emit("chat message", "Links are not allowed!");
    } else {
      // Not a link? send that message to all clients
      io.emit("chat message", msg);
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
