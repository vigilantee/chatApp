const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const mongoclient = require("mongodb").MongoClient;
const db_uri =
  "mongodb+srv://vsm-superadmin:vsm123@vsm-6jj8t.mongodb.net/test?retryWrites=true&w=majority";

const readDB = (dbclient, name, callBackFn = () => null) => {
  let dbo = dbclient.db("development");
  let query = { name };
  console.log("query is....", query);
  dbo
    .collection("chatTest")
    .find(query)
    .toArray(function(err, result) {
      if (err) throw err;
      console.log("result is....", result);
      callBackFn(result);
      return true;
    });
};

const writeDB = (
  dbclient,
  docName = `chatTest`,
  obj = { name: "Company Inc", address: "Highway 37" }
) => {
  let dbo = dbclient.db("development");
  dbo.collection(docName).insertOne(obj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    return true;
  });
};

mongoclient.connect(db_uri, (error, dbclient) => {
  if (error) {
    console.log("some error while connecting to mongo db");
    throw error;
  }
  console.log("connection successful");

  app.get("/", function(req, res) {
    res.render("index.ejs");
  });

  io.sockets.on("connection", function(socket) {
    socket.on("username", function(username) {
      socket.username = username;
      io.emit("is_online", "🔵 <i>" + socket.username + " join the chat..</i>");

      let oldMessages = readDB(dbclient, socket.username, (message)=>readMsg(socket.username, message));
    });

    const readMsg = (username, messages) => {
      messages.map(({message}) =>
        io.emit(
          "chat_message",
          "<strong>" + username + "</strong>: " + message
        )
      );
      console.log("msgs read are...", messages);
    };

    // io.emit("read_msg", "🔵 <i>" + socket.username + " join the chat..</i>");
    // oldMessages
    socket.on("read_msg", function(message) {
      // writeDB(dbclient, `chatTest`, { name: socket.username, message });
      io.emit(
        "chat_message",
        "<strong>" + socket.username + "</strong>: " + message
      );
    });

    socket.on("disconnect", function(username) {
      io.emit("is_online", "🔴 <i>" + socket.username + " left the chat..</i>");
    });

    socket.on("chat_message", function(message) {
      writeDB(dbclient, `chatTest`, { name: socket.username, message });
      io.emit(
        "chat_message",
        "<strong>" + socket.username + "</strong>: " + message
      );
    });
  });
});

const server = http.listen(8080, function() {
  console.log("listening on *:8080");
});
