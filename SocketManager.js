const io = require("./index").io;
const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  STARTING_GAME,
  CHOOSED_ITEM,
  RESULT,
  TIMER
} = require("./Events");
const { createUser } = require("./Factories");

let connectedUsers = {};
let numberOfConnections = 0;
let choices = [];

module.exports = function(socket) {
  numberOfConnections++;
  let user_added = false;

  socket.on(VERIFY_USER, (nickname, callback) => {
    if (isUser(connectedUsers, nickname)) {
      callback({ isUser: true, user: null });
    } else {
      callback({ isUser: false, user: createUser({ name: nickname }) });
    }
  });

  socket.on(USER_CONNECTED, user => {
    if (Object.keys(connectedUsers).length == 2) {
      io.emit(USER_CONNECTED, connectedUsers);
    } else {
      connectedUsers = addUser(connectedUsers, user);
      socket.user = user;
      user_added = true;
      io.emit(USER_CONNECTED, connectedUsers);
      if (Object.keys(connectedUsers).length == 2) {
        io.emit(STARTING_GAME);
        io.emit(TIMER, 10);
      }
    }
  });

  socket.on("disconnect", () => {
    numberOfConnections--;
    if (user_added) {
      if ("user" in socket) {
        connectedUsers = removeUser(connectedUsers, socket.user.name);
        io.emit(USER_DISCONNECTED, connectedUsers);
        console.log("Disconnect", connectedUsers);
        choices = [];
      }
    }
  });

  socket.on(CHOOSED_ITEM, (user, choice) => {
    choices.push({ user: user.name, choice: choice });

    if (choices.length == 2) {
      if (choices[0]["choice"] === "rock") {
        if (choices[1]["choice"] === "rock") {
          io.emit(RESULT, "مساوی");
        } else if (choices[1]["choice"] === "paper") {
          io.emit(RESULT, choices[1].user + " برد");
        } else {
          io.emit(RESULT, choices[0].user + " برد");
        }
        choices = [];
      } else if (choices[0]["choice"] === "paper") {
        if (choices[1]["choice"] === "rock") {
          io.emit(RESULT, choices[0].user + " برد");
        } else if (choices[1]["choice"] === "paper") {
          io.emit(RESULT, "مساوی");
        } else {
          io.emit(RESULT, choices[1].user + " برد");
        }
        choices = [];
      } else if (choices[0]["choice"] === "scissors") {
        if (choices[1]["choice"] === "rock") {
          io.emit(RESULT, choices[1].user + " برد");
        } else if (choices[1]["choice"] === "paper") {
          io.emit(RESULT, choices[0].user + " برد");
        } else {
          io.emit(RESULT, "مساوی");
        }
        choices = [];
      }
      setTimeout(() => {
        io.emit(STARTING_GAME);
        io.emit(TIMER, 10);
      }, 5000);
    }
  });
};

function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  newList[user.name] = user;
  return newList;
}

function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  return newList;
}

function isUser(userList, username) {
  return username in userList || numberOfConnections > 2;
}
