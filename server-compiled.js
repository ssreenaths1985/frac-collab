"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

require("./config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();

const server = require("http").Server(app);

const io = require("socket.io")({
  wsEngine: "eiows",
  allowEIO3: true,
  path: "/socket.io/",
  cors: {
    origin: "*"
  }
});

const database = require("./app/models");

const Role = database.role;
let room = "room1";
let dynamicRoom = "";
app.use((0, _cors.default)());
app.options("*", (0, _cors.default)());
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: true
}));
app.get("/api", (request, response, next) => {
  response.json({
    message: "Collaborative Editing Tool API's"
  });
  response.setHeader("Last-Modified", new Date().toUTCString());
  next();
});

require("./app/routes/fracSession.routes")(app);

io.listen(server.listen(8080, function () {
  console.log("Servers listening on : 8080");
}));
var cursorPositionsSaved = {};
let deltaEditor,
    rangeEditor,
    sessionIdEditor = "";
io.on("connection", socket => {
  console.log("Connected: ".concat(socket.id));
  socket.on("disconnect", () => {
    console.log("Disconnected: ".concat(socket.id));
    let clientsList = io.sockets.adapter.rooms.get(room);
    console.log(clientsList);

    if (clientsList !== undefined) {
      let clientsListArray = [...clientsList];
      io.sockets.in(room).emit("clientsList", "".concat(clientsListArray));
      io.sockets.in(dynamicRoom).emit("clientsList", "".concat(clientsListArray));
      socket.removeAllListeners();
    } else {
      let clientsListArray = [];
      io.sockets.in(room).emit("clientsList", "".concat(clientsListArray));
      io.sockets.in(dynamicRoom).emit("clientsList", "".concat(clientsListArray));
      socket.removeAllListeners();
    }
  });
  socket.on("message", data => {
    socket.broadcast.emit("message", data);
  });
  socket.on("editor-text", (delta, range, sessionId, roomId, userName) => {
    deltaEditor = delta;
    rangeEditor = range;
    sessionIdEditor = sessionId;
    io.sockets.in(dynamicRoom).emit("editor-text", delta, range, sessionId, roomId, userName);
    let clientsList = io.sockets.adapter.rooms.get(dynamicRoom);

    if (clientsList !== undefined) {
      let clientsListArray = [...clientsList];
      io.sockets.in(dynamicRoom).emit("clientsList", "".concat(clientsListArray));
    } else {
      let clientsListArray = [];
      io.sockets.in(dynamicRoom).emit("clientsList", "".concat(clientsListArray));
    }
  });
  socket.on("cursor-position", (data, id) => {
    socket.broadcast.emit("cursor-position", {
      data,
      id
    }); // let cursorPosition = io.sockets.adapter.rooms.get(room);
    // io.sockets.in(room).emit("cursorPosition", `${cursorPosition}`);
  });
  socket.on("room", room => {
    socket.join(room);
    console.log("Joined at: ".concat(room)); // io.sockets.in(room).emit("message", {
    //   type: "paragraph",
    //   children: [{ text: "Message from the room" }],
    // });

    io.sockets.in(room).emit("message", "Message from the room");
    let clientsList = io.sockets.adapter.rooms.get(room);
    console.log(clientsList);

    if (clientsList !== undefined) {
      let clientsListArray = [...clientsList];

      if (clientsListArray.length > 1) {
        if (deltaEditor !== undefined && rangeEditor !== undefined && sessionIdEditor !== undefined) {
          io.sockets.in(room).emit("editor-text", deltaEditor, rangeEditor, sessionIdEditor);
        }
      }

      io.sockets.in(room).emit("clientsList", "".concat(clientsListArray));
    } else {
      let clientsListArray = [];
      io.sockets.in(room).emit("clientsList", "".concat(clientsListArray));
    }
  });
  socket.on("cursormove", data => {
    // console.log('cursormove');
    let mousemove_data = data;
    mousemove_data.id = socket.id;
    io.emit("cursormove", data);
    cursorPositionsSaved[socket.id] = data;
  });
  socket.on("sendMessage", data => {
    if (data !== undefined) {
      for (let i = 0; i < data.recipientId.length; i++) {
        io.to(data.recipientId[i]).emit("sendMessage", data);
      }
    }
  });
  socket.on("fracRooms", (newRoom, oldRoom) => {
    socket.leave(oldRoom);
    socket.to(oldRoom).emit("fracRooms", oldRoom);
    console.log("Left at: ".concat(oldRoom));
    socket.join(newRoom);
    console.log("Joined at: ".concat(newRoom));
    io.sockets.in(newRoom).emit("fracRooms", newRoom);
    let clientsList = io.sockets.adapter.rooms.get(newRoom);
    console.log(clientsList);
    dynamicRoom = newRoom;

    if (clientsList !== undefined) {
      let clientsListArray = [...clientsList];

      if (clientsListArray.length > 1) {
        if (deltaEditor !== undefined && rangeEditor !== undefined && sessionIdEditor !== undefined) {
          io.sockets.in(newRoom).emit("editor-text", deltaEditor, rangeEditor, sessionIdEditor);
        }
      }

      io.sockets.in(newRoom).emit("clientsList", "".concat(clientsListArray));
    } else {
      let clientsListArray = [];
      io.sockets.in(newRoom).emit("clientsList", "".concat(clientsListArray));
    }
  });
  socket.on("fracSendMessageToAll", data => {
    socket.broadcast.to(data.roomId).emit("fracSendMessageToAll", data);
  });
  socket.on("sendMessageToAll", data => {
    socket.broadcast.to(room).emit("sendMessageToAll", data);
  });
  socket.on("allSessionList", data => {
    socket.broadcast.emit("allSessionList", data);
  });
});

if (global.env.APP_COLLAB_ENV !== "local") {
  database.mongoose.connect("mongodb://".concat(global.env.APP_COLLAB_MONGO_USER, ":").concat(encodeURIComponent(global.env.APP_COLLAB_MONGO_PWD), "@").concat(global.env.APP_COLLAB_MONGO_HOST, ":").concat(global.env.APP_COLLAB_MONGO_PORT, "/").concat(global.env.APP_COLLAB_MONGO_DB), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }).then(() => {
    console.log("Connected to MongoDB");
    starter();
  }).catch(err => {
    console.log("Error in connection", err);
    process.exit();
  });
} else {
  database.mongoose.connect(global.env.APP_COLLAB_MONGO_CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }).then(() => {
    console.log("Connected to MongoDB");
    starter();
  }).catch(err => {
    console.log("Error in connection", err);
    process.exit();
  });
}

function starter() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      Role({
        name: "editor"
      }).save(err => {
        if (err) {
          console.log("Error", err);
        }

        console.log("Editor role added to the collection");
      });
      Role({
        name: "commenter"
      }).save(err => {
        if (err) {
          console.log("Error", err);
        }

        console.log("Commenter added to the collection");
      });
      Role({
        name: "viewer"
      }).save(err => {
        if (err) {
          console.log("Error", err);
        }

        console.log("Viewer added to the collection");
      });
    }
  });
}
